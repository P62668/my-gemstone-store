import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { performanceCache as cache, invalidateCacheByTags } from '../../../utils/cache';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        // Create cache key
        const cacheKey = 'all-categories';
        
        // Try to get cached response first
        const cachedResponse = await cache.get(cacheKey);
        if (cachedResponse) {
          return res.status(200).json(cachedResponse);
        }

        // Fetch categories from database
        const categories = await prisma.category.findMany({
          where: { active: true },
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: { gemstones: true },
            },
          },
        });

        // Cache the response for 15 minutes
        await cache.set(cacheKey, categories, { ttl: 900 });

        return res.status(200).json(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
        return;
      }

    case 'POST':
      try {
        const category = await prisma.category.create({
          data: req.body,
        });
        
        // Invalidate categories cache when adding new category
        await invalidateCacheByTags(['categories']);
        
        res.status(201).json(category);
        return;
      } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
        return;
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      return;
  }
}