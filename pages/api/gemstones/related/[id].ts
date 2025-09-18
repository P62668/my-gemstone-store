import type { NextApiRequest, NextApiResponse } from 'next';
// Use singleton pattern for Prisma client
import { prisma } from '../../../../lib/prisma';
import { logger } from '../../../../utils/logger';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const gemstoneId = parseInt(id as string, 10);

  if (isNaN(gemstoneId)) {
    return res.status(400).json({ error: 'Invalid gemstone ID' });
  }

  try {
    // Get the current gemstone to find its category
    const currentGemstone = await prisma.gemstone.findUnique({
      where: { id: gemstoneId },
      include: { category: true },
    });

    if (!currentGemstone) {
      return res.status(404).json({ error: 'Gemstone not found' });
    }

    // Find related gemstones from the same category, excluding the current one
    const relatedGemstones = await prisma.gemstone.findMany({
      where: {
        categoryId: currentGemstone.categoryId,
        id: { not: gemstoneId },
        active: true,
      },
      include: {
        category: true,
      },
      take: 6, // Limit to 6 related items
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // If we don't have enough from the same category, add some from other categories
    if (relatedGemstones.length < 6) {
      const additionalGemstones = await prisma.gemstone.findMany({
        where: {
          categoryId: { not: currentGemstone.categoryId },
          id: { not: gemstoneId },
          active: true,
        },
        include: {
          category: true,
        },
        take: 6 - relatedGemstones.length,
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      relatedGemstones.push(...additionalGemstones);
    }

    // Process images for each gemstone
    const processedGemstones = relatedGemstones.map((gemstone) => ({
      ...gemstone,
      images: typeof gemstone.images === 'string'
        ? gemstone.images.split(',').map((img) => img.trim())
        : Array.isArray(gemstone.images)
          ? gemstone.images
          : [],
    }));

    res.status(200).json(processedGemstones);
  } catch (error) {
    logger.error('Error fetching related gemstones', error, { id });
    res.status(500).json({ error: 'Failed to fetch related gemstones' });
  }
}
