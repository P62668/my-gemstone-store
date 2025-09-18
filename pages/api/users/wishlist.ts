import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../utils/authMiddleware';

import { prisma } from '../../../lib/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated, use /api/session-wishlist for guests' });
  }

  if (req.method === 'GET') {
    try {
      const wishlistItems = await prisma.wishlistItem.findMany({
        where: { userId: user.id },
        include: { gemstone: true },
      });

      res.status(200).json(wishlistItems);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { gemstoneId } = req.body;

      if (!gemstoneId) {
        return res.status(400).json({ error: 'Gemstone ID is required' });
      }

      // Check if gemstone exists
      const gemstone = await prisma.gemstone.findUnique({
        where: { id: parseInt(gemstoneId) },
      });

      if (!gemstone) {
        return res.status(404).json({ error: 'Gemstone not found' });
      }

      // Check if already in wishlist
      const existingItem = await prisma.wishlistItem.findFirst({
        where: {
          userId: user.id,
          gemstoneId: parseInt(gemstoneId),
        },
      });

      if (existingItem) {
        return res.status(400).json({ error: 'Item already in wishlist' });
      }

      // Add to wishlist
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          userId: user.id,
          gemstoneId: parseInt(gemstoneId),
        },
        include: { gemstone: true },
      });

      res.status(200).json(wishlistItem);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { gemstoneId } = req.body;

      if (!gemstoneId) {
        return res.status(400).json({ error: 'Gemstone ID is required' });
      }

      await prisma.wishlistItem.deleteMany({
        where: {
          userId: user.id,
          gemstoneId: parseInt(gemstoneId),
        },
      });

      res.status(200).json({ message: 'Item removed from wishlist' });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
