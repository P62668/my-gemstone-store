import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { performanceCache } from '../../utils/cache';
import { logger } from '../../utils/logger';

// Define types for our suggestions
interface BaseSuggestion {
  id: number;
  name: string;
  type: 'product' | 'category' | 'attribute';
}

interface ProductSuggestion extends BaseSuggestion {
  type: 'product';
  category?: string;
  price: number;
  rating: number;
  reviewCount: number;
  popularity: number;
  image: string;
}

interface CategorySuggestion extends BaseSuggestion {
  type: 'category';
}

interface AttributeSuggestion extends BaseSuggestion {
  type: 'attribute';
}

type SearchSuggestion = ProductSuggestion | CategorySuggestion | AttributeSuggestion;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { query, limit = '10' } = req.query;
      
      // Parse limit parameter
      const limitNum = parseInt(limit as string, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 20) {
        return res.status(400).json({ error: 'Invalid limit parameter. Must be between 1 and 20.' });
      }

      // Require query parameter
      if (!query || typeof query !== 'string' || query.length < 2) {
        return res.status(400).json({ error: 'Query parameter required with minimum 2 characters.' });
      }

      // Create cache key based on query parameters
      const cacheKey = `search_suggestions_${query}_${limit}`;
      
      // Check if we have cached data
      const cachedData = performanceCache.get(cacheKey);
      if (cachedData) {
        logger.info('Returning cached search suggestions data for key:', cacheKey);
        return res.status(200).json(cachedData);
      }

      logger.info('Fetching fresh search suggestions data for key:', cacheKey);

      // Get product suggestions with enhanced matching
      const productSuggestions = await prisma.gemstone.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { color: { contains: query } },
            { clarity: { contains: query } },
            { cut: { contains: query } },
            { origin: { contains: query } },
            { certificate: { contains: query } },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          images: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          averageRating: true,
          reviewCount: true,
          viewCount: true,
        },
        orderBy: [
          { featured: 'desc' },
          { averageRating: 'desc' },
          { reviewCount: 'desc' },
          { viewCount: 'desc' },
        ],
        take: Math.ceil(limitNum * 0.6), // 60% products
      });

      // Get category suggestions
      const categorySuggestions = await prisma.category.findMany({
        where: {
          active: true,
          name: { contains: query },
        },
        select: {
          id: true,
          name: true,
        },
        take: Math.ceil(limitNum * 0.2), // 20% categories
      });

      // Get attribute suggestions (colors, clarities, etc.)
      const attributeSuggestions = await prisma.gemstone.findMany({
        where: {
          active: true,
          OR: [
            { color: { contains: query } },
            { clarity: { contains: query } },
            { cut: { contains: query } },
            { origin: { contains: query } },
          ],
        },
        select: {
          color: true,
          clarity: true,
          cut: true,
          origin: true,
        },
        take: Math.ceil(limitNum * 0.2), // 20% attributes
      });

      // Extract unique attributes
      const colors = [...new Set(attributeSuggestions.map(a => a.color).filter(Boolean))] as string[];
      const clarities = [...new Set(attributeSuggestions.map(a => a.clarity).filter(Boolean))] as string[];
      const cuts = [...new Set(attributeSuggestions.map(a => a.cut).filter(Boolean))] as string[];
      const origins = [...new Set(attributeSuggestions.map(a => a.origin).filter(Boolean))] as string[];

      // Combine all attributes
      const allAttributes = [...colors, ...clarities, ...cuts, ...origins].slice(0, Math.ceil(limitNum * 0.2));

      // Transform results
      const allSuggestions: SearchSuggestion[] = [
        ...productSuggestions.map(product => ({
          id: product.id,
          name: product.name,
          type: 'product' as const,
          category: product.category?.name,
          price: product.price,
          rating: product.averageRating || 0,
          reviewCount: product.reviewCount || 0,
          popularity: product.viewCount || 0,
          image: Array.isArray(product.images) 
            ? product.images[0] 
            : typeof product.images === 'string' 
              ? JSON.parse(product.images)[0] || '/images/placeholder-gemstone.jpg'
              : '/images/placeholder-gemstone.jpg',
        })),
        ...categorySuggestions.map(category => ({
          id: category.id,
          name: category.name,
          type: 'category' as const,
        })),
        ...allAttributes.map((attr, index) => ({
          id: index + 1000, // Offset to avoid conflicts
          name: attr,
          type: 'attribute' as const,
        }))
      ];

      // Filter and sort suggestions
      const suggestions = allSuggestions
        .sort((a, b) => {
          // For products, sort by popularity
          if (a.type === 'product' && b.type === 'product') {
            const productA = a as ProductSuggestion;
            const productB = b as ProductSuggestion;
            return productB.popularity - productA.popularity;
          }
          // For categories and attributes, sort by name
          return a.name.localeCompare(b.name);
        })
        .slice(0, limitNum);

      // Cache the suggestions for 30 seconds
      performanceCache.set(cacheKey, suggestions, { ttl: 30 });
      
      res.status(200).json(suggestions);
    } catch (error) {
      logger.error('Search suggestions error', error);
      res.status(500).json({ error: 'Failed to generate search suggestions' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}