import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { emailService } from '../../../utils/email';
import { logger } from '../../../utils/logger';

import prisma from '../../../lib/prisma';

// Initialize Stripe with proper error handling
let stripe: Stripe | null = null;
let webhookSecret: string | null = null;

try {
  if (!process.env.STRIPE_SECRET_KEY) {
    logger.error('Webhook - Stripe secret key is missing');
  } else if (process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key') {
    logger.error('Webhook - Stripe secret key is using the default example value');
  } else {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
    logger.info('Webhook - Stripe initialized successfully');
  }
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    logger.error('Webhook - Stripe webhook secret is missing');
  } else if (process.env.STRIPE_WEBHOOK_SECRET === 'whsec_your_stripe_webhook_secret') {
    logger.error('Webhook - Stripe webhook secret is using the default example value');
  } else {
    webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    logger.info('Webhook - Webhook secret configured successfully');
  }
} catch (error) {
  logger.error('Webhook - Failed to initialize Stripe', error);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

function buffer(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  // Check if Stripe and webhook secret are properly initialized
  if (!stripe) {
    logger.error('Webhook handler - Stripe not initialized');
    res.status(503).json({ error: 'Payment service unavailable' });
    return;
  }

  if (!webhookSecret) {
    logger.error('Webhook handler - Webhook secret not configured');
    res.status(500).json({ error: 'Webhook secret not configured' });
    return;
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;
  
  if (!sig) {
    logger.error('Webhook handler - Missing Stripe signature');
    res.status(400).json({ error: 'Missing Stripe signature' });
    return;
  }
  
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    logger.info(`Webhook received: ${event.type}`);
  } catch (err: any) {
    logger.error('Webhook signature verification failed', err, { headers: req.headers });
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`, { eventType: event.type });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Webhook handler error:', error, { headers: req.headers });
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  const userId = session.metadata?.userId;

  if (!orderId) {
    console.error('No orderId in session metadata');
    return;
  }

  try {
    // Update order status
    const order = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        status: 'paid',
        paymentStatus: 'completed',
        trackingNumber: session.payment_intent as string,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            gemstone: true,
          },
        },
        user: true,
      },
    });

    // Update inventory
    for (const item of order.items) {
      await prisma.gemstone.update({
        where: { id: item.gemstoneId },
        data: {
          stockCount: {
            decrement: item.quantity,
          },

        },
      });
    }

    // Add order status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'paid',
        comment: 'Payment completed successfully',
      },
    });

    // Send confirmation email
    await emailService.sendOrderConfirmation({
      orderId: order.id,
      customerName: `${order.user.firstName} ${order.user.lastName}`,
      customerEmail: order.user.email,
      total: order.total,
      items: order.items.map(item => ({
        name: item.gemstone.name,
        quantity: item.quantity,
        price: item.price,
      })),
      orderDate: order.createdAt.toLocaleDateString(),
    });

  logger.info(`Order ${orderId} marked as paid and inventory updated`, { orderId });
  } catch (error) {
  logger.error('Error processing checkout session completion:', error, { orderId });
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logger.info('Payment intent succeeded', { paymentIntentId: paymentIntent.id });
  // Additional payment success logic if needed
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;
  
  if (orderId) {
    try {
      await prisma.order.update({
        where: { id: Number(orderId) },
        data: {
          status: 'payment_failed',
          paymentStatus: 'failed',
          updatedAt: new Date(),
        },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: Number(orderId),
          status: 'payment_failed',
          comment: 'Payment failed',
        },
      });

  logger.info(`Order ${orderId} marked as payment failed`, { orderId });
    } catch (error) {
  logger.error('Error updating order for failed payment:', error, { orderId });
    }
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const orderId = charge.metadata?.orderId;
  
  if (orderId) {
    try {
      const refundAmount = charge.amount_refunded / 100; // Convert from cents



      await prisma.order.update({
        where: { id: Number(orderId) },
        data: {
          status: 'refunded',
          updatedAt: new Date(),
        },
      });

  logger.info(`Refund processed for order ${orderId}`, { orderId, refundAmount });
    } catch (error) {
  logger.error('Error processing refund:', error, { orderId });
    }
  }
}