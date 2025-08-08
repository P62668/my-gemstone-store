import type { NextApiRequest, NextApiResponse } from 'next';
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
      const { page = '1', limit = '20', lowStock = 'false', outOfStock = 'false' } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (lowStock === 'true') {
        where.stockCount = { lte: 5, gt: 0 };
      } else if (outOfStock === 'true') {
        where.stockCount = { lte: 0 };
      }

      const [gemstones, total] = await Promise.all([
        prisma.gemstone.findMany({
          where,
          include: {
            category: true,
          },
          orderBy: { stockCount: 'asc' },
          skip,
          take: limitNum,
        }),
        prisma.gemstone.count({ where }),
      ]);

      // Get inventory statistics
      const stats = await prisma.gemstone.aggregate({
        _count: { id: true },
        _sum: { stockCount: true },
        _avg: { stockCount: true },
      });

      const lowStockCount = await prisma.gemstone.count({
        where: { stockCount: { lte: 5, gt: 0 } },
      });

      const outOfStockCount = await prisma.gemstone.count({
        where: { stockCount: { lte: 0 } },
      });

      res.status(200).json({
        gemstones,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
        stats: {
          totalProducts: stats._count.id,
          totalStock: stats._sum.stockCount || 0,
          averageStock: stats._avg.stockCount || 0,
          lowStockCount,
          outOfStockCount,
        },
      });
    } catch (error) {
      console.error('Inventory fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, stockCount, lowStockThreshold, sku } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const updateData: any = {};
      if (stockCount !== undefined) updateData.stockCount = parseInt(stockCount);
      if (lowStockThreshold !== undefined)
        updateData.lowStockThreshold = parseInt(lowStockThreshold);
      if (sku !== undefined) updateData.sku = sku;

      const gemstone = await prisma.gemstone.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: { category: true },
      });

      res.status(200).json({ gemstone });
    } catch (error) {
      console.error('Inventory update error:', error);
      res.status(500).json({ error: 'Failed to update inventory' });
    }
  } else if (req.method === 'POST') {
    try {
      const { action, gemstoneIds, quantity } = req.body;

      if (!action || !gemstoneIds || !Array.isArray(gemstoneIds)) {
        return res.status(400).json({ error: 'Invalid request data' });
      }

      const updates = gemstoneIds.map((id: number) => {
        const updateData: any = {};

        if (action === 'add') {
          updateData.stockCount = { increment: quantity || 1 };
        } else if (action === 'subtract') {
          updateData.stockCount = { decrement: quantity || 1 };
        } else if (action === 'set') {
          updateData.stockCount = quantity || 0;
        }

        return prisma.gemstone.update({
          where: { id },
          data: updateData,
        });
      });

      await prisma.$transaction(updates);

      res.status(200).json({ message: 'Inventory updated successfully' });
    } catch (error) {
      console.error('Bulk inventory update error:', error);
      res.status(500).json({ error: 'Failed to update inventory' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
