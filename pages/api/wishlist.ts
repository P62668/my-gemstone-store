import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../utils/authMiddleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      const wishlistItems = await prisma.wishlistItem.findMany({
        where: { userId: user.id },
        include: {
          gemstone: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.status(200).json(wishlistItems);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { gemstoneId } = req.body;

      if (!gemstoneId || typeof gemstoneId !== 'number') {
        return res.status(400).json({ error: 'Invalid gemstone ID' });
      }

      // Check if gemstone exists
      const gemstone = await prisma.gemstone.findUnique({
        where: { id: gemstoneId },
      });

      if (!gemstone) {
        return res.status(404).json({ error: 'Gemstone not found' });
      }

      // Check if already in wishlist
      const existingItem = await prisma.wishlistItem.findFirst({
        where: {
          userId: user.id,
          gemstoneId,
        },
      });

      if (existingItem) {
        return res.status(409).json({ error: 'Item already in wishlist' });
      }

      // Add to wishlist
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          userId: user.id,
          gemstoneId,
        },
        include: {
          gemstone: {
            include: {
              category: true,
            },
          },
        },
      });

      res.status(201).json(wishlistItem);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body;

      if (!id || typeof id !== 'number') {
        return res.status(400).json({ error: 'Invalid item ID' });
      }

      // Verify the wishlist item belongs to the user
      const wishlistItem = await prisma.wishlistItem.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!wishlistItem) {
        return res.status(404).json({ error: 'Wishlist item not found' });
      }

      // Remove from wishlist
      await prisma.wishlistItem.delete({
        where: { id },
      });

      res.status(200).json({ message: 'Item removed from wishlist successfully' });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
