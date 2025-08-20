import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, search, sort, featured } = req.query;

    const whereClause: any = {};
    whereClause.active = true;
    // Filter by featured if provided
    if (featured === 'true') {
      whereClause.featured = true;
    }

    // Filter by category if provided
    if (category) {
      whereClause.categoryId = parseInt(category as string);
    }

    // Filter by search term if provided
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { type: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Default sorting
    let orderBy: any = { name: 'asc' };
    if (sort === 'price-low') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-high') {
      orderBy = { price: 'desc' };
    }

    const gemstones = await prisma.gemstone.findMany({
      where: whereClause,
      orderBy,
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

    res.status(200).json(
      gemstones.map((gem) => {
        let parsedImages = [];
        try {
          if (typeof gem.images === 'string' && gem.images.trim()) {
            parsedImages = JSON.parse(gem.images);
          } else if (Array.isArray(gem.images)) {
            parsedImages = gem.images;
          }
        } catch (error) {
          console.error('Error parsing images for gemstone:', gem.id, error);
          parsedImages = [];
        }
        
        return {
          ...gem,
          images: parsedImages,
        };
      }),
    );
  } catch (error) {
    console.error('Error fetching gemstones:', error);
    res.status(500).json({ error: 'Failed to fetch gemstones' });
  }
}
