import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

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
    // Add a new review (requires userId, userName, rating, comment)
    const { userId, userName, rating, comment } = req.body;
    if (!userId || !userName || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const review = await prisma.review.create({
        data: {
          gemstoneId: Number(id),
          userId: Number(userId),
          userName,
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
