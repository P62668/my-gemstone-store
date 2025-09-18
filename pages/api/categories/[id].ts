import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const { id } = req.query;
    const categoryId = parseInt(id as string);

    if (isNaN(categoryId)) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Get gemstone count for this category
    const gemstoneCount = await prisma.gemstone.count({
      where: { 
        categoryId: category.id,
        active: true
      }
    });

    // Get price range for category
    const gemstones = await prisma.gemstone.findMany({
      where: {
        categoryId: category.id,
        active: true
      },
      select: {
        price: true
      },
      orderBy: [
        { price: 'asc' },
        { price: 'desc' }
      ]
    });

    let priceRange = { min: 0, max: 0 };
    if (gemstones.length > 0) {
      priceRange = {
        min: Math.min(...gemstones.map(g => g.price)),
        max: Math.max(...gemstones.map(g => g.price))
      };
    }

    // Get featured gemstones for this category
    const featuredGemstones = await prisma.gemstone.findMany({
      where: { 
        categoryId: category.id,
        active: true,
        featured: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        stockCount: true,
        featured: true
      },
      take: 4
    });

    res.status(200).json({
      category: {
        ...category,
        gemstoneCount,
        priceRange,
        featuredGemstones
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
}