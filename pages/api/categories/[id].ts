import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;
    const categoryId = parseInt(id as string);

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        gemstones: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            images: true,
            stockCount: true,
            featured: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({
      category,
      gemstoneCount: category.gemstones.length
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  } finally {
    await prisma.$disconnect();
  }
}
