import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, related, recommended } = req.query;
  if (related === 'true') {
    // Fetch related gemstones (same category, exclude current)
    try {
      const gemstone = await prisma.gemstone.findUnique({ where: { id: Number(id) } });
      if (!gemstone || !gemstone.categoryId) return res.status(200).json([]);
      const relatedGems = await prisma.gemstone.findMany({
        where: {
          categoryId: gemstone.categoryId,
          id: { not: Number(id) },
          active: true,
        },
        take: 6,
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(
        relatedGems.map((g) => ({
          ...g,
          images: Array.isArray(g.images) ? g.images : JSON.parse(g.images || '[]'),
        })),
      );
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch related gemstones' });
    }
  }
  if (recommended === 'true') {
    // Fetch recommended gemstones (featured, exclude current)
    try {
      const recommendedGems = await prisma.gemstone.findMany({
        where: {
          featured: true,
          id: { not: Number(id) },
          active: true,
        },
        take: 6,
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(
        recommendedGems.map((g) => ({
          ...g,
          images: Array.isArray(g.images) ? g.images : JSON.parse(g.images || '[]'),
        })),
      );
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch recommended gemstones' });
    }
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const gemstone = await prisma.gemstone.findUnique({
      where: { id: Number(id) },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
    if (!gemstone) {
      return res.status(404).json({ error: 'Gemstone not found' });
    }
    res.status(200).json({
      ...gemstone,
      images: Array.isArray(gemstone.images)
        ? gemstone.images
        : JSON.parse(gemstone.images || '[]'),
    });
  } catch (error) {
    console.error('Error fetching gemstone:', error);
    res.status(500).json({ error: 'Failed to fetch gemstone' });
  }
}
