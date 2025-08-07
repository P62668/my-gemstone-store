import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-06-30.basil' });
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const prisma = new PrismaClient();

function getUserIdFromReq(req: NextApiRequest): number | null {
  const { cookie } = req.headers;
  if (!cookie) return null;
  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (!tokenMatch) return null;
  try {
    const decoded = jwt.verify(tokenMatch[1], JWT_SECRET) as { id: number };
    return decoded.id;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided' });
  }
  try {
    // Calculate total
    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    // Create pending order in DB
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: 'pending',
        items: {
          create: items.map((item: any) => ({
            gemstoneId: item.gemstoneId || 1, // fallback if gemstoneId missing
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
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${req.headers.origin}/orders?success=1`,
      cancel_url: `${req.headers.origin}/checkout?canceled=1`,
      metadata: { userId: String(userId), orderId: String(order.id) },
    });
    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
