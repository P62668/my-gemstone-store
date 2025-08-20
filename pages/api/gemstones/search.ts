import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

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
          { certificate: { contains: searchTerm } },
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

      // Build order by
      let orderBy: any = {};
      switch (sortBy) {
        case 'price':
          orderBy.price = sortOrder;
          break;
        case 'newest':
          orderBy.createdAt = 'desc';
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
          },
          orderBy,
          skip,
          take: limitNum,
        }),
        prisma.gemstone.count({ where }),
      ]);

      // Add default ratings and parse images
      const gemstonesWithRating = gemstones.map((gemstone) => {
        let parsedImages = [];
        try {
          if (typeof gemstone.images === 'string' && gemstone.images.trim()) {
            parsedImages = JSON.parse(gemstone.images);
          } else if (Array.isArray(gemstone.images)) {
            parsedImages = gemstone.images;
          }
        } catch (error) {
          console.error('Error parsing images for gemstone:', gemstone.id, error);
          parsedImages = [];
        }
        
        return {
          ...gemstone,
          images: parsedImages,
          rating: 4.5,
          reviewCount: 0,
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
          certificates: certificateFacets,
        },
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Failed to search gemstones' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
