import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import cookie from 'cookie';

const SESSION_COOKIE = 'session_wishlist_id';
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
    // Get session wishlist items
    const sessionWishlist = await prisma.sessionWishlist.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            gemstone: true,
          },
        },
      },
    });
    return res.status(200).json(sessionWishlist?.items || []);
  }

  if (req.method === 'POST') {
    // Add item to session wishlist
    const { gemstoneId } = req.body;
    if (!gemstoneId) return res.status(400).json({ error: 'Missing gemstoneId' });
    let sessionWishlist = await prisma.sessionWishlist.upsert({
      where: { sessionId },
      update: {},
      create: { sessionId },
    });
    const existing = await prisma.sessionWishlistItem.findUnique({
      where: { sessionId_gemstoneId: { sessionId, gemstoneId } },
    });
    if (!existing) {
      await prisma.sessionWishlistItem.create({
        data: { sessionId, gemstoneId },
      });
    }
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    // Remove item from session wishlist
    const { gemstoneId } = req.body;
    if (!gemstoneId) return res.status(400).json({ error: 'Missing gemstoneId' });
    await prisma.sessionWishlistItem.deleteMany({ where: { sessionId, gemstoneId } });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
