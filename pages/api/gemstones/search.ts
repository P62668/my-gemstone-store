import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { logger } from '../../../utils/logger';
import { performanceCache } from '../../../utils/cache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const {
        q,
        category,
        minPrice,
        maxPrice,
        inStock,
        rating,
        sortBy = 'name',
        sortOrder = 'asc',
        page = '1',
        limit = '20',
        featured,
        discount,
        certification,
        color,
        clarity,
        cut,
        origin,
        weightMin,
        weightMax,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Create cache key based on query parameters
      const cacheKey = `search_${q || 'all'}_${category || 'all'}_${minPrice || 'min'}_${maxPrice || 'max'}_${inStock || 'all'}_${rating || 'all'}_${sortBy}_${sortOrder}_${page}_${limit}_${featured || 'all'}_${certification || 'all'}_${color || 'all'}_${clarity || 'all'}_${cut || 'all'}_${origin || 'all'}_${weightMin || 'min'}_${weightMax || 'max'}`;
      
      // Check if we have cached data
      const cachedData = performanceCache.get(cacheKey);
      if (cachedData) {
        logger.info('Returning cached search data for key:', cacheKey);
        return res.status(200).json(cachedData);
      }
      
      logger.info('Fetching fresh search data for key:', cacheKey);

      // Build where clause
      const where: any = {
        active: true,
      };

      // Search query
      if (q) {
        const searchTerm = (q as string).toLowerCase();
        where.OR = [
          { name: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { certificate: { contains: searchTerm } },
          { color: { contains: searchTerm } },
          { clarity: { contains: searchTerm } },
          { cut: { contains: searchTerm } },
          { origin: { contains: searchTerm } },
        ];
      }

      // Category filter
      if (category) {
        where.categoryId = parseInt(category as string, 10);
      }

      // Price range
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice as string);
        if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
      }

      // Stock filter
      if (inStock === 'true') {
        where.stockCount = { gt: 0 };
      } else if (inStock === 'false') {
        where.stockCount = { lte: 0 };
      }

      // Featured filter
      if (featured === 'true') {
        where.featured = true;
      }

      // Certificate filter
      if (certification) {
        where.certificate = { contains: (certification as string).toLowerCase() };
      }

      // Color filter
      if (color) {
        where.color = { equals: color as string };
      }

      // Clarity filter
      if (clarity) {
        where.clarity = { equals: clarity as string };
      }

      // Cut filter
      if (cut) {
        where.cut = { equals: cut as string };
      }

      // Origin filter
      if (origin) {
        where.origin = { equals: origin as string };
      }

      // Weight range
      if (weightMin || weightMax) {
        where.weight = {};
        if (weightMin) where.weight.gte = parseFloat(weightMin as string);
        if (weightMax) where.weight.lte = parseFloat(weightMax as string);
      }

      // Build order by
      let orderBy: any = {};
      switch (sortBy) {
        case 'price-low':
          orderBy.price = 'asc';
          break;
        case 'price-high':
          orderBy.price = 'desc';
          break;
        case 'newest':
          orderBy.createdAt = 'desc';
          break;
        case 'featured':
          orderBy.featured = 'desc';
          break;
        case 'rating':
          orderBy.averageRating = 'desc';
          break;
        case 'popular':
          orderBy.viewCount = 'desc';
          break;
        default:
          orderBy.name = sortOrder;
      }

      // Execute query
      const [gemstones, total] = await Promise.all([
        prisma.gemstone.findMany({
          where,
          // Use select instead of include for better performance
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            salePrice: true,
            images: true,
            categoryId: true,
            stockCount: true,
            featured: true,
            cashOnDelivery: true,
            createdAt: true,
            weight: true,
            color: true,
            clarity: true,
            cut: true,
            origin: true,
            certificate: true,
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
          orderBy,
          skip,
          take: limitNum,
        }),
        prisma.gemstone.count({ where }),
      ]);

      // Add default ratings and parse images
      const gemstonesWithRating = gemstones.map((gemstone) => {
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
        
        return {
          ...gemstone,
          images: parsedImages,
          rating: gemstone.averageRating || 4.5,
          reviewCount: gemstone.reviewCount || 0,
        };
      });

      // Get facets for filtering
      const facets = await Promise.all([
        prisma.gemstone.groupBy({
          by: ['categoryId'],
          where,
          _count: { categoryId: true },
        }),
        prisma.gemstone.groupBy({
          by: ['certificate'],
          where,
          _count: { certificate: true },
        }),
        prisma.gemstone.groupBy({
          by: ['color'],
          where,
          _count: { color: true },
        }),
        prisma.gemstone.groupBy({
          by: ['clarity'],
          where,
          _count: { clarity: true },
        }),
        prisma.gemstone.groupBy({
          by: ['cut'],
          where,
          _count: { cut: true },
        }),
        prisma.gemstone.groupBy({
          by: ['origin'],
          where,
          _count: { origin: true },
        }),
      ]);

      const categoryFacets = await Promise.all(
        facets[0].map(async (facet) => {
          const category = await prisma.category.findUnique({
            where: { id: facet.categoryId },
            select: { name: true },
          });
          return {
            id: facet.categoryId,
            name: category?.name || 'Unknown',
            count: facet._count.categoryId,
          };
        }),
      );

      const certificateFacets = facets[1].map((facet) => ({
        certificate: facet.certificate,
        count: facet._count.certificate,
      }));

      const colorFacets = facets[2].map((facet) => ({
        color: facet.color,
        count: facet._count.color,
      }));

      const clarityFacets = facets[3].map((facet) => ({
        clarity: facet.clarity,
        count: facet._count.clarity,
      }));

      const cutFacets = facets[4].map((facet) => ({
        cut: facet.cut,
        count: facet._count.cut,
      }));

      const originFacets = facets[5].map((facet) => ({
        origin: facet.origin,
        count: facet._count.origin,
      }));

      const response = {
        gemstones: gemstonesWithRating,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
        facets: {
          categories: categoryFacets,
          certificates: certificateFacets,
          colors: colorFacets,
          clarities: clarityFacets,
          cuts: cutFacets,
          origins: originFacets,
        },
      };

      // Cache the response for 5 minutes (300 seconds)
      performanceCache.set(cacheKey, response, { ttl: 300 });
      
      res.status(200).json(response);
    } catch (error) {
      logger.error('Search error', error);
      res.status(500).json({ error: 'Failed to search gemstones' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}