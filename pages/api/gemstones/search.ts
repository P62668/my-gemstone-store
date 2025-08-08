import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      q = '', // search query
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
      type,
      certification,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

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
        { type: { contains: searchTerm } },
        { certification: { contains: searchTerm } },
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

    // Rating filter
    if (rating) {
      where.rating = { gte: parseFloat(rating as string) };
    }

    // Featured filter
    if (featured === 'true') {
      where.featured = true;
    }

    // Discount filter
    if (discount === 'true') {
      where.discount = { gt: 0 };
    }

    // Type filter
    if (type) {
      where.type = type as string;
    }

    // Certification filter
    if (certification) {
      where.certification = { contains: (certification as string).toLowerCase() };
    }

    // Build order by
    let orderBy: any = {};
    switch (sortBy) {
      case 'price':
        orderBy.price = sortOrder;
        break;
      case 'rating':
        orderBy.rating = sortOrder;
        break;
      case 'newest':
        orderBy.createdAt = 'desc';
        break;
      case 'popular':
        orderBy.views = 'desc';
        break;
      case 'featured':
        orderBy.featured = 'desc';
        break;
      case 'stock':
        orderBy.stockCount = 'desc';
        break;
      default:
        orderBy.name = sortOrder;
    }

    // Execute query
    const [gemstones, total] = await Promise.all([
      prisma.gemstone.findMany({
        where,
        include: {
          category: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.gemstone.count({ where }),
    ]);

    // Calculate average ratings
    const gemstonesWithRating = gemstones.map((gemstone) => {
      const avgRating =
        gemstone.reviews.length > 0
          ? gemstone.reviews.reduce((sum, review) => sum + review.rating, 0) /
            gemstone.reviews.length
          : 0;

      return {
        ...gemstone,
        rating: avgRating,
        reviewCount: gemstone.reviews.length,
        reviews: undefined, // Remove reviews from response
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
        by: ['type'],
        where,
        _count: { type: true },
      }),
      prisma.gemstone.groupBy({
        by: ['certification'],
        where,
        _count: { certification: true },
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

    const typeFacets = facets[1].map((facet) => ({
      type: facet.type,
      count: facet._count.type,
    }));

    const certificationFacets = facets[2].map((facet) => ({
      certification: facet.certification,
      count: facet._count.certification,
    }));

    res.status(200).json({
      gemstones: gemstonesWithRating,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      facets: {
        categories: categoryFacets,
        types: typeFacets,
        certifications: certificationFacets,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search gemstones' });
  }
}
