import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { performanceCache as cache, invalidateCacheByTags } from '../../../utils/cache';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        // Extract query parameters
        const {
          page = '1',
          limit = '12',
          category,
          minPrice,
          maxPrice,
          sortBy = 'createdAt',
          sortOrder = 'desc',
          search,
          featured,
          certificate,
        } = req.query;

        // Create cache key based on query parameters
        const cacheKey = `gemstones:${JSON.stringify(req.query)}`;
        
        // Try to get cached response
        const cachedResponse = await cache.get(cacheKey);
        if (cachedResponse) {
          res.status(200).json(cachedResponse);
          return;
        }

        // Convert to numbers
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build where clause
        const where: any = {};

        // Add category filter
        if (category) {
          where.categoryId = parseInt(category as string);
        }

        // Add price range filters
        if (minPrice || maxPrice) {
          where.price = {};
          if (minPrice) where.price.gte = parseFloat(minPrice as string);
          if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
        }

        // Add search filter
        if (search) {
          where.OR = [
            { name: { contains: search as string } },
            { description: { contains: search as string } },
            { color: { contains: search as string } },
            { cut: { contains: search as string } },
            { clarity: { contains: search as string } },
          ];
        }

        // Add featured filter
        if (featured) {
          where.featured = featured === 'true';
        }

        // Add certificate filter
        if (certificate) {
          where.certificate = certificate as string;
        }

        // Build orderBy clause
        const orderBy: any = {};
        if (sortBy === 'price') {
          orderBy.price = sortOrder;
        } else if (sortBy === 'name') {
          orderBy.name = sortOrder;
        } else {
          orderBy.createdAt = sortOrder;
        }

        // Fetch gemstones with pagination
        const gemstones = await prisma.gemstone.findMany({
          where,
          orderBy,
          skip,
          take: limitNum,
          include: {
            category: true,
          }
        });

        // Get total count for pagination
        const total = await prisma.gemstone.count({ 
          where
        });

        // Prepare response
        const response = {
          gemstones,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalItems: total,
            itemsPerPage: limitNum,
          },
        };

        // Cache the response for 5 minutes
        await cache.set(cacheKey, response, { ttl: 300 });

        res.status(200).json(response);
        return;
      } catch (error) {
        console.error('Error fetching gemstones:', error);
        res.status(500).json({ error: 'Failed to fetch gemstones' });
        return;
      }

    case 'POST':
      try {
        const gemstone = await prisma.gemstone.create({
          data: req.body,
        });
        
        // Invalidate gemstone cache when adding new gemstone
        await invalidateCacheByTags(['gemstones']);
        
        res.status(201).json(gemstone);
        return;
      } catch (error) {
        console.error('Error creating gemstone:', error);
        res.status(500).json({ error: 'Failed to create gemstone' });
        return;
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      return;
  }
}