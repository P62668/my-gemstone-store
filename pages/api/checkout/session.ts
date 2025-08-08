import Stripe from 'stripe';
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '../../../utils/auth';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-06-30.basil' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = getUserFromRequest(req);
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    // Validate stock availability
    const stockValidation = await Promise.all(
      items.map(async (item: any) => {
        const gemstone = await prisma.gemstone.findUnique({
          where: { id: item.gemstoneId },
          select: { id: true, name: true, price: true, stockCount: true, active: true },
        });

        if (!gemstone) {
          return { valid: false, error: `Product ${item.gemstoneId} not found` };
        }

        if (!gemstone.active) {
          return { valid: false, error: `${gemstone.name} is not available` };
        }

        if (gemstone.stockCount < item.quantity) {
          return {
            valid: false,
            error: `Only ${gemstone.stockCount} units available for ${gemstone.name}`,
          };
        }

        return { valid: true, gemstone };
      }),
    );

    const invalidItems = stockValidation.filter((item) => !item.valid);
    if (invalidItems.length > 0) {
      return res.status(400).json({
        error: 'Stock validation failed',
        details: invalidItems.map((item) => item.error),
      });
    }

    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        items: {
          create: items.map((item: any) => ({
            gemstoneId: item.gemstoneId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // Create Stripe session with orderId in metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name,
            images: item.images ? [item.images[0]] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.PUBLIC_BASE_URL}/orders/${order.id}?success=1`,
      cancel_url: `${process.env.PUBLIC_BASE_URL}/checkout?canceled=1`,
      metadata: {
        orderId: order.id.toString(),
        userId: user.id.toString(),
      },
      customer_email: user.email,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
