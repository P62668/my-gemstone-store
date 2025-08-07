import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  if (req.method === 'PUT') {
    const { featuredIds, action, productId } = req.body;

    try {
      // Handle individual product toggle
      if (action === 'toggle' && productId) {
        const product = await prisma.gemstone.findUnique({
          where: { id: productId },
        });

        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        await prisma.gemstone.update({
          where: { id: productId },
          data: { featured: !product.featured },
        });

        return res.status(200).json({
          message: `Product ${product.featured ? 'unfeatured' : 'featured'} successfully`,
          featured: !product.featured,
        });
      }

      // Handle bulk update (existing functionality)
      if (Array.isArray(featuredIds)) {
        // Set featured=false for all products first
        await prisma.gemstone.updateMany({
          data: { featured: false },
        });

        // Set featured=true for selected products
        if (featuredIds.length > 0) {
          await prisma.gemstone.updateMany({
            where: { id: { in: featuredIds } },
            data: { featured: true },
          });
        }

        return res.status(200).json({
          message: 'Featured products updated successfully',
          updatedCount: featuredIds.length,
        });
      }

      return res.status(400).json({ error: 'Invalid request format' });
    } catch (error) {
      console.error('Featured update error:', error);
      return res.status(500).json({ error: 'Failed to update featured products' });
    }
  } else if (req.method === 'GET') {
    try {
      const featuredProducts = await prisma.gemstone.findMany({
        where: { featured: true },
        select: { id: true, name: true, featured: true },
      });

      return res.status(200).json(featuredProducts);
    } catch (error) {
      console.error('Featured fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch featured products' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
