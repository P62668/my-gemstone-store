import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { performanceCache } from '../../utils/cache';
import { logger } from '../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { limit = '10' } = req.query;
      
      // Parse limit parameter
      const limitNum = parseInt(limit as string, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        return res.status(400).json({ error: 'Invalid limit parameter. Must be between 1 and 50.' });
      }

      // Create cache key based on query parameters
      const cacheKey = `trending_products_${limit}`;
      
      // Check if we have cached data
      const cachedData = await performanceCache.get(cacheKey);
      if (cachedData) {
        logger.info('Returning cached trending products data for key:', cacheKey);
        return res.status(200).json(cachedData);
      }

      logger.info('Fetching fresh trending products data for key:', cacheKey);

      // Get trending products based on views, purchases, and ratings
      const trendingProducts = await prisma.gemstone.findMany({
        where: {
          active: true,
          stockCount: { gt: 0 },
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          images: true,
          categoryId: true,
          stockCount: true,
          featured: true,
          cashOnDelivery: true,
          createdAt: true,
          averageRating: true,
          reviewCount: true,
          viewCount: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { viewCount: 'desc' },
          { reviewCount: 'desc' },
          { averageRating: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limitNum,
      });

      // Transform results
      const response = trendingProducts.map((product) => {
        // Parse images
        let images: string[] = [];
        try {
          if (Array.isArray(product.images)) {
            images = product.images;
          } else if (typeof product.images === 'string') {
            images = JSON.parse(product.images);
          }
        } catch (error) {
          console.error('Error parsing images for product', error, { productId: product.id });
          images = ['/images/placeholder-gemstone.jpg'];
        }
        
        // Ensure we have at least one image
        if (images.length === 0) {
          images = ['/images/placeholder-gemstone.jpg'];
        }
        
        return {
          ...product,
          images,
          // Ensure JSON-serializable values for dates
          createdAt: typeof product.createdAt === 'string' ? product.createdAt : product.createdAt?.toISOString?.() ?? null,
        };
      });

      // Cache the response for 30 seconds
      await performanceCache.set(cacheKey, response, { ttl: 30 });
      
      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error fetching trending products', error);
      // Send more detailed error information in development
      if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({ 
          error: 'Failed to fetch trending products',
          details: error.message || 'Unknown error'
        });
      }
      res.status(500).json({ error: 'Failed to fetch trending products. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}