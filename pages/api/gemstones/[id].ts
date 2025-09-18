import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { logger } from '../../../utils/logger';

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
        relatedGems.map((g) => {
          let parsedImages: string[] = [];
          try {
            if (typeof g.images === 'string' && g.images.trim()) {
              parsedImages = JSON.parse(g.images);
            } else if (Array.isArray(g.images)) {
              parsedImages = g.images as string[];
            }
          } catch (error) {
            logger.error('Error parsing images for gemstone', error, { gemstoneId: g.id });
            parsedImages = [];
          }
          
          return {
            ...g,
            images: parsedImages,
          };
        }),
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
        recommendedGems.map((g) => {
          let parsedImages: string[] = [];
          try {
            if (typeof g.images === 'string' && g.images.trim()) {
              parsedImages = JSON.parse(g.images);
            } else if (Array.isArray(g.images)) {
              parsedImages = g.images as string[];
            }
          } catch (error) {
            logger.error('Error parsing images for gemstone', error, { gemstoneId: g.id });
            parsedImages = [];
          }
          
          return {
            ...g,
            images: parsedImages,
          };
        }),
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
    let parsedImages: string[] = [];
    try {
      if (typeof gemstone.images === 'string' && gemstone.images.trim()) {
        parsedImages = JSON.parse(gemstone.images);
      } else if (Array.isArray(gemstone.images)) {
        parsedImages = gemstone.images as string[];
      }
    } catch (error) {
      logger.error('Error parsing images for gemstone', error, { gemstoneId: gemstone.id });
      parsedImages = [];
    }
    
    res.status(200).json({
      ...gemstone,
      images: parsedImages,
    });
  } catch (error) {
    logger.error('Error fetching gemstone', error, { id });
    res.status(500).json({ error: 'Failed to fetch gemstone' });
  }
}