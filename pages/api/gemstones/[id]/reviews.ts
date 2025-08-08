import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '../../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing gemstone id' });

  if (req.method === 'GET') {
    // Fetch reviews for a gemstone
    try {
      const reviews = await prisma.review.findMany({
        where: { gemstoneId: Number(id) },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(reviews);
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: 'Failed to fetch reviews', details: err.message || err });
    }
  }

  if (req.method === 'POST') {
    // Authenticated reviews only; reviewer must have purchased the product
    let user;
    try {
      user = getUserFromRequest(req);
    } catch (err: any) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { rating, comment } = req.body as { rating?: number; comment?: string };
    if (!rating || !comment) {
      return res.status(400).json({ error: 'Missing required fields: rating, comment' });
    }

    try {
      // Ensure gemstone exists
      const gemstone = await prisma.gemstone.findUnique({ where: { id: Number(id) } });
      if (!gemstone) return res.status(404).json({ error: 'Gemstone not found' });

      // Verify the user has a PAID order containing this gemstone
      const purchased = await prisma.orderItem.findFirst({
        where: {
          gemstoneId: Number(id),
          order: {
            // Only allow reviews for completed/paid orders
            status: 'paid',
            userId: user.id,
          },
        },
      });

      if (!purchased) {
        return res.status(403).json({ error: 'Only verified buyers can review this product' });
      }

      // Get user display name
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true },
      });

      const review = await prisma.review.create({
        data: {
          gemstoneId: Number(id),
          userId: user.id,
          userName: dbUser?.name || 'Verified Buyer',
          rating: Number(rating),
          comment,
        },
      });
      return res.status(201).json(review);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to add review', details: err.message || err });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
