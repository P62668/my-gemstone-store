import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import cookie from 'cookie';

const SESSION_COOKIE = 'session_id';
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
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
  const sessionId = getSessionId(req, res);

  if (req.method === 'GET') {
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
  }

  if (req.method === 'POST') {
    // Add item to session cart
    const { gemstoneId, quantity = 1, price } = req.body;
    if (!gemstoneId || !price) return res.status(400).json({ error: 'Missing gemstoneId or price' });
    let sessionCart = await prisma.sessionCart.upsert({
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
  }

  if (req.method === 'DELETE') {
    // Remove item from session cart
    const { gemstoneId } = req.body;
    if (!gemstoneId) return res.status(400).json({ error: 'Missing gemstoneId' });
    await prisma.sessionCartItem.deleteMany({ where: { sessionId, gemstoneId } });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'PUT') {
    // Update quantity
    const { gemstoneId, quantity } = req.body;
    if (!gemstoneId || typeof quantity !== 'number') return res.status(400).json({ error: 'Missing gemstoneId or quantity' });
    await prisma.sessionCartItem.updateMany({ where: { sessionId, gemstoneId }, data: { quantity } });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
