import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  if (req.method === 'GET') {
    try {
      const gemstones = await prisma.gemstone.findMany({
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Process the gemstones to handle images field properly
      const processedGemstones = gemstones.map((gem) => ({
        ...gem,
        images: (() => {
          if (Array.isArray(gem.images)) return gem.images;
          if (typeof gem.images === 'string') {
            try {
              const parsed = JSON.parse(gem.images);
              if (Array.isArray(parsed)) return parsed;
              if (typeof parsed === 'string') return [parsed];
            } catch {
              if (gem.images.trim().startsWith('/')) return [gem.images.trim()];
              return [];
            }
          }
          return [];
        })(),
      }));

      res.status(200).json(processedGemstones);
    } catch (error) {
      console.error('Error fetching gemstones:', error);
      res.status(500).json({ error: 'Failed to fetch gemstones' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, type, description, price, images, certification, categoryId, active, order } =
        req.body;
      const gemstone = await prisma.gemstone.create({
        data: {
          name,
          type,
          description,
          price: parseFloat(price),
          images: JSON.stringify(images || []),
          certification,
          categoryId: categoryId ? parseInt(categoryId) : null,
        },
        include: {
          category: true,
        },
      });
      res.status(201).json(gemstone);
    } catch (error) {
      console.error('Error creating gemstone:', error);
      res.status(500).json({ error: 'Failed to create gemstone' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
