import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { performanceCache as cache } from '../../../utils/cache';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    // Create cache key
    const cacheKey = 'featured-gemstones';
    
    // Try to get cached response first
    const cachedResponse = await cache.get(cacheKey);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }

    // Fetch featured gemstones from database
    const featuredGemstones = await prisma.gemstone.findMany({
      where: { 
        featured: true,
        active: true 
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    const response = {
      gemstones: featuredGemstones,
      timestamp: new Date().toISOString(),
    };

    // Cache the response for 10 minutes
    await cache.set(cacheKey, response, { ttl: 600 });

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching featured gemstones:', error);
    res.status(500).json({ error: 'Failed to fetch featured gemstones' });
    return;
  }
}