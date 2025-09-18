import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        active: true,
      }
    });

    // Get additional information for each category
    const categoriesWithDetails = await Promise.all(
      categories.map(async (category) => {
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

        return {
          ...category,
          gemstoneCount,
          priceRange
        };
      })
    );

    return res.status(200).json(categoriesWithDetails);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
}