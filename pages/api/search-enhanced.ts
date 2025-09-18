import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { performanceCache } from '../../utils/cache';
import { logger } from '../../utils/logger';

interface SearchSuggestion {
  id: number;
  name: string;
  category?: string;
  image?: string;
  price?: number;
  popularity?: number;
  type: 'product' | 'category' | 'trending';
}

interface EnhancedSearchResponse {
  suggestions: SearchSuggestion[];
  trending: SearchSuggestion[];
  categories: { id: number; name: string; count: number }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, limit = '5' } = req.query;
    
    // Parse limit parameter
    const limitNum = parseInt(limit as string, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 20) {
      return res.status(400).json({ error: 'Invalid limit parameter. Must be between 1 and 20.' });
    }

    // Create cache key based on query parameters
    const cacheKey = `enhanced_search_${query || 'empty'}_${limit}`;
    
    // Check if we have cached data
    const cachedData = performanceCache.get(cacheKey);
    if (cachedData) {
      logger.info('Returning cached enhanced search data for key:', cacheKey);
      return res.status(200).json(cachedData);
    }

    logger.info('Fetching fresh enhanced search data for key:', cacheKey);

    // Get search suggestions based on query
    let suggestions: SearchSuggestion[] = [];
    if (query && typeof query === 'string' && query.length > 1) {
      suggestions = await getSearchSuggestions(query, limitNum);
    }

    // Get trending searches
    const trending = await getTrendingSearches(limitNum);

    // Get popular categories
    const categories = await getPopularCategories();

    const response: EnhancedSearchResponse = {
      suggestions,
      trending,
      categories
    };

    // Cache the response for 30 seconds
    performanceCache.set(cacheKey, response, { ttl: 30 });
    
    res.status(200).json(response);
  } catch (error: any) {
    logger.error('Error in enhanced search API', error);
    res.status(500).json({ error: 'Failed to fetch search data. Please try again later.' });
  }
}

// Get search suggestions based on query
async function getSearchSuggestions(query: string, limit: number): Promise<SearchSuggestion[]> {
  try {
    // Get product suggestions
    const productSuggestions = await prisma.gemstone.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        images: true,
        price: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { averageRating: 'desc' },
        { reviewCount: 'desc' },
      ],
      take: Math.ceil(limit * 0.7), // 70% products
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
      take: Math.ceil(limit * 0.3), // 30% categories
    });

    // Transform product suggestions
    const productResults: SearchSuggestion[] = productSuggestions.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category?.name,
      image: Array.isArray(product.images) 
        ? product.images[0] 
        : typeof product.images === 'string' 
          ? JSON.parse(product.images)[0] || '/images/placeholder-gemstone.jpg'
          : '/images/placeholder-gemstone.jpg',
      price: product.price,
      type: 'product',
    }));

    // Transform category suggestions
    const categoryResults: SearchSuggestion[] = categorySuggestions.map((category) => ({
      id: category.id,
      name: category.name,
      type: 'category',
    }));

    // Combine and sort results
    const combinedResults = [...productResults, ...categoryResults];
    
    // Add popularity scores based on position and type
    return combinedResults.map((item, index) => ({
      ...item,
      popularity: Math.max(100 - (index * 10), 10), // Higher score for earlier items
    }));
  } catch (error) {
    logger.error('Error getting search suggestions', error);
    return [];
  }
}

// Get trending searches
async function getTrendingSearches(limit: number): Promise<SearchSuggestion[]> {
  try {
    // Get trending products based on views, purchases, and ratings
    const trendingProducts = await prisma.gemstone.findMany({
      where: {
        active: true,
        stockCount: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        images: true,
        price: true,
        category: {
          select: {
            name: true,
          },
        },
        viewCount: true,
        reviewCount: true,
        averageRating: true,
      },
      orderBy: [
        { viewCount: 'desc' },
        { reviewCount: 'desc' },
        { averageRating: 'desc' },
      ],
      take: limit,
    });

    return trendingProducts.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category?.name,
      image: Array.isArray(product.images) 
        ? product.images[0] 
        : typeof product.images === 'string' 
          ? JSON.parse(product.images)[0] || '/images/placeholder-gemstone.jpg'
          : '/images/placeholder-gemstone.jpg',
      price: product.price,
      popularity: product.viewCount || 0,
      type: 'trending',
    }));
  } catch (error) {
    logger.error('Error getting trending searches', error);
    return [];
  }
}

// Get popular categories
async function getPopularCategories(): Promise<{ id: number; name: string; count: number }[]> {
  try {
    // Get category counts
    const categoryCounts = await prisma.gemstone.groupBy({
      by: ['categoryId'],
      where: { 
        active: true,
        stockCount: { gt: 0 },
      },
      _count: true,
    });

    // Get category details
    const categoriesWithDetails = await prisma.category.findMany({
      where: { 
        active: true,
        id: { in: categoryCounts.map(c => c.categoryId as number) },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Create lookup map for category counts
    const countMap = new Map<number, number>();
    categoryCounts.forEach(c => {
      countMap.set(c.categoryId as number, c._count as number);
    });

    // Combine data and sort by count
    const result = categoriesWithDetails.map(category => ({
      id: category.id,
      name: category.name,
      count: countMap.get(category.id) || 0,
    }));

    return result.sort((a, b) => b.count - a.count);
  } catch (error) {
    logger.error('Error getting popular categories', error);
    return [];
  }
}