import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import cookie, { CookieSerializeOptions } from 'cookie';

const SESSION_COOKIE = 'session_wishlist_id';
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
  // Create a new Prisma client for each request to avoid connection issues
  const prisma = new PrismaClient();
  
  try {
    const sessionId = getSessionId(req, res);

    if (req.method === 'GET') {
      try {
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
      } catch (err) {
        console.error('Session wishlist GET error:', err);
        return res.status(500).json({ error: 'Failed to retrieve wishlist items' });
      }
    }

    if (req.method === 'POST') {
      try {
        // Add item to session wishlist
        const { gemstoneId } = req.body;
        if (!gemstoneId) return res.status(400).json({ error: 'Missing gemstoneId' });
        
        // Verify gemstone exists
        const gemstone = await prisma.gemstone.findUnique({ where: { id: gemstoneId } });
        if (!gemstone) return res.status(404).json({ error: 'Gemstone not found' });
        
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
      } catch (err) {
        console.error('Session wishlist POST error:', err);
        return res.status(500).json({ error: 'Failed to add item to wishlist' });
      }
    }

    if (req.method === 'DELETE') {
      try {
        // Remove item from session wishlist
        const { gemstoneId } = req.body;
        if (!gemstoneId) return res.status(400).json({ error: 'Missing gemstoneId' });
        
        await prisma.sessionWishlistItem.deleteMany({ where: { sessionId, gemstoneId } });
        return res.status(200).json({ success: true });
      } catch (err) {
        console.error('Session wishlist DELETE error:', err);
        return res.status(500).json({ error: 'Failed to remove item from wishlist' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Session wishlist error:', error);
    return res.status(500).json({ error: 'Internal server error', message: 'An unexpected error occurred processing your request' });
  } finally {
    // Always disconnect the Prisma client after use
    await prisma.$disconnect();
  }
}