import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { emailService } from '../../../utils/email';

import { prisma } from '../../../lib/prisma';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

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
    return res.status(405).end('Method Not Allowed');
  }

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
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
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
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

    console.log(`Order ${orderId} marked as paid and inventory updated`);
  } catch (error) {
    console.error('Error processing checkout session completion:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id);
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

      console.log(`Order ${orderId} marked as payment failed`);
    } catch (error) {
      console.error('Error updating order for failed payment:', error);
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

      console.log(`Refund processed for order ${orderId}`);
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  }
}


