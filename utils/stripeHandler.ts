import Stripe from 'stripe';
import { logger } from './logger';
import { processPaymentAndUpdateOrder, createOrderWithInventoryUpdate } from './databaseTransactions';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export interface StripeConfig {
  currency: string;
  paymentMethods: string[];
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionData {
  items: Array<{
    gemstoneId: number;
    quantity: number;
    price: number;
    name: string;
    image?: string;
  }>;
  customerEmail: string;
  userId?: number;
  metadata?: Record<string, string>;
}

export interface PaymentIntentData {
  amount: number;
  currency: string;
  customerEmail: string;
  metadata?: Record<string, string>;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  created: number;
}

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(
  data: CreateCheckoutSessionData,
  config: StripeConfig
): Promise<{ sessionId: string; url: string }> {
  try {
    const lineItems = data.items.map(item => ({
      price_data: {
        currency: config.currency,
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: config.paymentMethods as any,
      line_items: lineItems,
      mode: 'payment',
      success_url: config.successUrl,
      cancel_url: config.cancelUrl,
      metadata: {
        userId: data.userId?.toString() || '',
        gemstoneIds: data.items.map(item => item.gemstoneId).join(','),
        ...data.metadata,
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'IN'],
      },
      billing_address_collection: 'required',
      payment_intent_data: {
        metadata: {
          userId: data.userId?.toString() || '',
          gemstoneIds: data.items.map(item => item.gemstoneId).join(','),
        },
      },
    });

    logger.info('Stripe checkout session created', {
      sessionId: session.id,
      amount: session.amount_total,
    });

    return {
      sessionId: session.id,
      url: session.url!,
    };
  } catch (error) {
    logger.error('Failed to create Stripe checkout session', undefined, error as Error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Create a payment intent for custom payment flow
 */
export async function createPaymentIntent(
  data: PaymentIntentData
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: data.currency,
      metadata: data.metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logger.info('Stripe payment intent created', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    logger.error('Failed to create Stripe payment intent', undefined, error as Error);
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Process Stripe webhook events
 */
export async function processWebhookEvent(
  event: WebhookEvent,
  signature: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const verifiedEvent = stripe.webhooks.constructEvent(
      JSON.stringify(event),
      signature,
      webhookSecret
    );

    logger.info('Processing Stripe webhook event', {
      eventType: verifiedEvent.type,
      eventId: verifiedEvent.id,
    });

    switch (verifiedEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(verifiedEvent.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(verifiedEvent.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(verifiedEvent.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(verifiedEvent.data.object);
        break;

      case 'charge.dispute.created':
        await handleChargeDisputeCreated(verifiedEvent.data.object);
        break;

      default:
        logger.info('Unhandled webhook event type', {
          eventType: verifiedEvent.type,
        });
    }

    return { success: true, message: 'Webhook processed successfully' };
  } catch (error) {
    logger.error('Webhook processing failed', undefined, error as Error);
    return { success: false, message: 'Webhook processing failed' };
  }
}

/**
 * Handle successful checkout session completion
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  try {
    const userId = session.metadata?.userId ? parseInt(session.metadata.userId) : undefined;
    const gemstoneIds = session.metadata?.gemstoneIds?.split(',').map(id => parseInt(id)) || [];

    if (!userId) {
      logger.warn('No user ID in checkout session metadata', {
        sessionId: session.id,
      });
      return;
    }

    // Create order in database
    const orderData = {
      userId,
      items: [], // You'll need to fetch the actual items from your database
      shippingAddress: session.customer_details?.address,
      billingAddress: session.customer_details?.address,
      paymentMethod: 'stripe',
      totalAmount: (session.amount_total || 0) / 100,
    };

    const orderResult = await createOrderWithInventoryUpdate(orderData);
    
    if (!orderResult.success) {
      throw new Error(orderResult.error || 'Failed to create order');
    }

    // Process payment
    const paymentResult = await processPaymentAndUpdateOrder(
      orderResult.data!.orderId,
      {
        paymentIntentId: session.payment_intent as string,
        amount: (session.amount_total || 0) / 100,
        status: 'succeeded',
      }
    );

    if (!paymentResult.success) {
      throw new Error(paymentResult.error || 'Failed to process payment');
    }

    logger.info('Checkout session completed successfully', {
      sessionId: session.id,
      userId,
    });
  } catch (error) {
    logger.error('Failed to handle checkout session completion', undefined, error as Error);
    throw error;
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  try {
    const userId = paymentIntent.metadata?.userId ? parseInt(paymentIntent.metadata.userId) : undefined;

    if (!userId) {
      logger.warn('No user ID in payment intent metadata', {
        paymentIntentId: paymentIntent.id,
      });
      return;
    }

    // Find the order associated with this payment intent
    // You'll need to implement this based on your database structure
    const orderId = await findOrderByPaymentIntentId(paymentIntent.id);

    if (!orderId) {
      logger.warn('No order found for payment intent', {
        paymentIntentId: paymentIntent.id,
      });
      return;
    }

    // Update order status
    const paymentResult = await processPaymentAndUpdateOrder(orderId, {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      status: 'succeeded',
    });

    if (!paymentResult.success) {
      throw new Error(paymentResult.error || 'Failed to process payment');
    }

    logger.info('Payment intent succeeded', {
      paymentIntentId: paymentIntent.id,
      orderId,
      userId,
    });
  } catch (error) {
    logger.error('Failed to handle payment intent success', undefined, error as Error);
    throw error;
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  try {
    const userId = paymentIntent.metadata?.userId ? parseInt(paymentIntent.metadata.userId) : undefined;

    if (!userId) {
      logger.warn('No user ID in payment intent metadata', {
        paymentIntentId: paymentIntent.id,
      });
      return;
    }

    // Find the order associated with this payment intent
    const orderId = await findOrderByPaymentIntentId(paymentIntent.id);

    if (!orderId) {
      logger.warn('No order found for payment intent', {
        paymentIntentId: paymentIntent.id,
      });
      return;
    }

    // Update order status
    const paymentResult = await processPaymentAndUpdateOrder(orderId, {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      status: 'failed',
    });

    logger.info('Payment intent failed', {
      paymentIntentId: paymentIntent.id,
      orderId,
      userId,
      failureReason: paymentIntent.last_payment_error?.message,
    });
  } catch (error) {
    logger.error('Failed to handle payment intent failure', undefined, error as Error);
    throw error;
  }
}

/**
 * Handle charge refund
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  try {
    const paymentIntentId = charge.payment_intent as string;
    const orderId = await findOrderByPaymentIntentId(paymentIntentId);

    if (!orderId) {
      logger.warn('No order found for refunded charge', {
        chargeId: charge.id,
        paymentIntentId,
      });
      return;
    }

    // Update order status to refunded
    // You'll need to implement this based on your order status system
    logger.info('Charge refunded', {
      chargeId: charge.id,
      paymentIntentId,
      refundAmount: charge.amount_refunded / 100,
    });
  } catch (error) {
    logger.error('Failed to handle charge refund', undefined, error as Error);
    throw error;
  }
}

/**
 * Handle charge dispute
 */
async function handleChargeDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
  try {
    const charge = dispute.charge as Stripe.Charge;
    const paymentIntentId = charge.payment_intent as string;
    const orderId = await findOrderByPaymentIntentId(paymentIntentId);

    if (!orderId) {
      logger.warn('No order found for disputed charge', {
        disputeId: dispute.id,
        chargeId: charge.id,
      });
      return;
    }

    // Update order status to disputed
    // You'll need to implement this based on your order status system
    logger.info('Charge dispute created', {
      disputeId: dispute.id,
      orderId,
      reason: dispute.reason,
    });
  } catch (error) {
    logger.error('Failed to handle charge dispute', undefined, error as Error);
    throw error;
  }
}

/**
 * Find order by payment intent ID
 */
async function findOrderByPaymentIntentId(paymentIntentId: string): Promise<number | null> {
  try {
    // This is a placeholder - implement based on your database structure
    // You might want to store payment intent IDs in your orders table
    const { prisma } = await import('./databaseTransactions');
    
    const order = await prisma.order.findFirst({
      where: { paymentIntentId },
      select: { id: true },
    });

    return order?.id || null;
  } catch (error) {
    logger.error('Failed to find order by payment intent ID', undefined, error as Error);
    return null;
  }
}

/**
 * Create a refund
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
): Promise<{ refundId: string; status: string }> {
  try {
    const refundData: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      metadata: {
        reason: reason || 'customer_request',
      },
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundData);

    logger.info('Refund created', {
      refundId: refund.id,
      paymentIntentId,
      amount: refund.amount / 100,
      reason,
    });

    return {
      refundId: refund.id,
      status: refund.status || 'unknown',
    };
  } catch (error) {
    logger.error('Failed to create refund', undefined, error as Error);
    throw new Error('Failed to create refund');
  }
}

/**
 * Get payment intent details
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    logger.error('Failed to retrieve payment intent', undefined, error as Error);
    throw new Error('Failed to retrieve payment intent');
  }
}

/**
 * Validate Stripe configuration
 */
export function validateStripeConfig(): boolean {
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    logger.error('Missing Stripe environment variables', undefined, {
      missingVars,
    });
    return false;
  }

  return true;
}

export { stripe };
