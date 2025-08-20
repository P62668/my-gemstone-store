import { NextApiRequest, NextApiResponse } from 'next';
import { processGemstonesData } from '../../../utils/dataProcessor';

import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const featuredGemstones = await prisma.gemstone.findMany({
      where: { 
        featured: true,
        active: true 
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: 8,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Process the data to ensure consistency
    const processedGemstones = processGemstonesData(featuredGemstones);

    return res.status(200).json({
      featured: processedGemstones,
      count: processedGemstones.length
    });
  } catch (error) {
    console.error('Error fetching featured gemstones:', error);
    return res.status(500).json({ error: 'Failed to fetch gemstones' });
  } finally {
    await prisma.$disconnect();
  }
}
