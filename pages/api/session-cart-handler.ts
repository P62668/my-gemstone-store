import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';
import { CookieSerializeOptions } from 'cookie';
// Zod schemas for input validation
const addSchema = z.object({ gemstoneId: z.number(), quantity: z.number().int().min(1).optional() });
const updateSchema = z.object({ gemstoneId: z.number(), quantity: z.number().int().min(1) });
const removeSchema = z.object({ gemstoneId: z.number() });
import { v4 as uuidv4 } from 'uuid';
import cookie from 'cookie';

const SESSION_COOKIE = 'session_id';
const SESSION_COOKIE_OPTIONS: CookieSerializeOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

function getSessionId(req: NextApiRequest, res: NextApiResponse): string {
  let sessionId = req.cookies[SESSION_COOKIE];
  if (!sessionId) {
    sessionId = uuidv4();
    res.setHeader('Set-Cookie', cookie.serialize(SESSION_COOKIE, sessionId, SESSION_COOKIE_OPTIONS));
  }
  return sessionId;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sessionId = getSessionId(req, res);

    if (req.method === 'GET') {
      try {
        // Get session cart items
        const sessionCart = await prisma.sessionCart.findUnique({
          where: { sessionId },
          include: {
            items: {
              include: {
                gemstone: true,
              },
            },
          },
        });
        return res.status(200).json(sessionCart?.items || []);
      } catch (err) {
        console.error('Session cart GET error:', err);
        return res.status(500).json({ error: 'Failed to retrieve cart items' });
      }
    }

    if (req.method === 'POST') {
      // Add item to session cart
      try {
        const parse = addSchema.safeParse(req.body);
        if (!parse.success) {
          return res.status(400).json({ error: 'Invalid input', details: parse.error.errors });
        }
        const { gemstoneId, quantity = 1 } = parse.data;
        // Always fetch price from DB for security
        const gemstone = await prisma.gemstone.findUnique({ where: { id: gemstoneId } });
        if (!gemstone) return res.status(404).json({ error: 'Gemstone not found' });
        const price = gemstone.price;

        await prisma.sessionCart.upsert({
          where: { sessionId },
          update: {},
          create: { sessionId },
        });
        const existing = await prisma.sessionCartItem.findUnique({
          where: { sessionId_gemstoneId: { sessionId, gemstoneId } },
        });
        if (existing) {
          await prisma.sessionCartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + quantity },
          });
        } else {
          await prisma.sessionCartItem.create({
            data: { sessionId, gemstoneId, quantity, price },
          });
        }
        return res.status(200).json({ success: true });
      } catch (err: any) {
        console.error('Session cart POST error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    if (req.method === 'DELETE') {
      // Remove item from session cart
      try {
        const parse = removeSchema.safeParse(req.body);
        if (!parse.success) {
          return res.status(400).json({ error: 'Invalid input', details: parse.error.errors });
        }
        const { gemstoneId } = parse.data;
        await prisma.sessionCartItem.deleteMany({ where: { sessionId, gemstoneId } });
        return res.status(200).json({ success: true });
      } catch (err: any) {
        console.error('Session cart DELETE error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    if (req.method === 'PUT') {
      // Update quantity
      try {
        const parse = updateSchema.safeParse(req.body);
        if (!parse.success) {
          return res.status(400).json({ error: 'Invalid input', details: parse.error.errors });
        }
        const { gemstoneId, quantity } = parse.data;
        await prisma.sessionCartItem.updateMany({ where: { sessionId, gemstoneId }, data: { quantity } });
        return res.status(200).json({ success: true });
      } catch (err: any) {
        console.error('Session cart PUT error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Session cart error:', error);
    return res.status(500).json({ error: 'Internal server error', message: 'An unexpected error occurred processing your request' });
  }
}