import { z } from 'zod';
// Zod schema for validating checkout items
const itemSchema = z.object({
  gemstoneId: z.number().optional(),
  id: z.number().optional(),
  quantity: z.number().int().min(1).optional(),
  price: z.number().optional(),
  name: z.string().optional(),
  images: z.array(z.string()).optional(),
});
const bodySchema = z.object({
  items: z.array(itemSchema).min(1),
});
import Stripe from 'stripe';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../utils/getUser';

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SM-${timestamp}-${random}`;
}

import prisma from '../../../lib/prisma';
import { logger } from '../../../utils/logger';

// Initialize Stripe with proper error handling
let stripe: Stripe | null = null;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    logger.error('Stripe secret key is missing');
  } else if (process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key') {
    logger.error('Stripe secret key is using the default example value');
  } else if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    logger.error('Stripe secret key has invalid format');
  } else {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
    logger.info('Stripe initialized successfully');
  }
} catch (error) {
  logger.error('Failed to initialize Stripe', error);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Stripe is properly initialized
  if (!stripe) {
    logger.error('Checkout session - Stripe not initialized');
    return res.status(503).json({ 
      error: 'Payment service unavailable', 
      message: 'The payment service is not properly configured. Please contact support.'
    });
  }

  try {
    logger.info('Checkout session - Starting', { headers: req.headers });
    
    // Try to get user, but don't fail if not authenticated (for testing)
    let user;
    try {
      user = await getUserFromRequest(req);
      if (!user) {
        // For testing purposes, use a default user ID
        user = { id: 1, email: 'test@example.com' } as any;
        logger.info('Checkout session - Using default user', { userId: user.id });
      } else {
        logger.info('Checkout session - User authenticated', { userId: user.id });
      }
    } catch (error) {
      // For testing purposes, use a default user ID
  user = { id: 1, email: 'test@example.com' } as any;
  logger.info('Checkout session - Using default user', { userId: user.id });
    }


    // Validate request body
    const parse = bodySchema.safeParse(req.body);
    if (!parse.success) {
      logger.warn('Checkout session - Invalid input', { errors: parse.error.errors });
      return res.status(400).json({ error: 'Invalid input', details: parse.error.errors });
    }
    const { items } = parse.data;
    logger.info('Checkout session - Items', { itemCount: items.length });

  logger.info('Checkout session - Validating stock');

    // Normalize items (support id or gemstoneId) and validate stock availability
    const normalizedItems = Array.isArray(items)
      ? items.map((it: any) => ({
          gemstoneId: it.gemstoneId ?? it.id,
          quantity: Number(it.quantity) || 1,
          price: typeof it.price === 'number' ? it.price : undefined,
          name: it.name,
          images: it.images,
        }))
      : [];

    const stockValidation = await Promise.all(
      normalizedItems.map(async (item: any) => {
        if (!item.gemstoneId) {
          return { valid: false, error: `Missing gemstoneId for item`, gemstone: null };
        }
        const gemstone = await prisma.gemstone.findUnique({
          where: { id: Number(item.gemstoneId) },
          select: { id: true, name: true, price: true, stockCount: true, active: true },
        });

        if (!gemstone) {
          return { valid: false, error: `Product ${item.gemstoneId} not found`, gemstone: null };
        }

        if (!gemstone.active) {
          return { valid: false, error: `${gemstone.name} is not available`, gemstone };
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

  logger.info('Checkout session - Stock validation passed');

    // Fill missing price/name from DB gemstones and compute total
    const enrichedItems = normalizedItems.map((item, idx) => {
      const sv = stockValidation[idx];
      const dbg = sv && (sv as any).gemstone;
      return {
        gemstoneId: item.gemstoneId,
        quantity: item.quantity,
        price: typeof item.price === 'number' ? item.price : dbg?.price ?? 0,
        name: item.name ?? dbg?.name ?? `Item ${item.gemstoneId}`,
        images: item.images,
      };
    });

    const total = enrichedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  logger.info('Checkout session - Total calculated', { total });

  logger.info('Checkout session - Creating order');

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: generateOrderNumber(),
        total,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: JSON.stringify({}), // Default empty address, will be updated later
        items: {
          create: enrichedItems.map((item: any) => ({
            gemstoneId: Number(item.gemstoneId),
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
        },
      },
    });

  logger.info('Checkout session - Order created', { orderId: order.id });

    // Check if Stripe is configured
    if (!stripe || !process.env.STRIPE_SECRET_KEY || 
        process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key') {
  logger.warn('Checkout session - Stripe not configured, using mock checkout');
      // Return mock checkout URL for testing
      const base = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || '3000'}`;
      const mockCheckoutUrl = `${base}/orders/${order.id}?success=1&test=true`;
      return res.status(200).json({ 
        url: mockCheckoutUrl,
        orderId: order.id,
        testMode: true 
      });
    }

  logger.info('Checkout session - Creating Stripe session');

    // Create Stripe session with orderId in metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: enrichedItems.map((item: any) => ({
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
      success_url: `${(process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || '3000'}`)}/orders/${order.id}?success=1`,
      cancel_url: `${(process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || '3000'}`)}/checkout?canceled=1`,
      metadata: {
        orderId: order.id.toString(),
        userId: user.id.toString(),
      },
      customer_email: user.email,
    });

  logger.info('Checkout session - Stripe session created', { sessionId: session.id });

    return res.status(200).json({ url: session.url });
  } catch (error) {
  logger.error('Checkout session error:', error, { headers: req.headers });
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
