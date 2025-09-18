import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAdminAuth } from '../../../utils/authMiddleware';
import { logger } from '../../../utils/logger';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ success: false, error: 'Authentication required' });

    if (req.method === 'GET') {
      try {
        const { page = '1', limit = '20', active = 'all' } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (active === 'true') {
          where.active = true;
        } else if (active === 'false') {
          where.active = false;
        }

        const [shippingMethods, total] = await Promise.all([
          prisma.shipping.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNum,
          }),
          prisma.shipping.count({ where }),
        ]);

        // Get statistics
        const stats = await prisma.shipping.aggregate({
          _count: { id: true },
          _sum: { price: true },
        });

        const activeCount = await prisma.shipping.count({
          where: { active: true },
        });

        res.status(200).json({
          shippingMethods,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
          stats: {
            total: stats._count.id,
            active: activeCount,
            averagePrice: stats._sum.price ? stats._sum.price / stats._count.id : 0,
          },
        });
      } catch (error) {
        logger.error('Error fetching shipping methods', error, {
          message: 'Failed to fetch shipping methods',
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        });
        res.status(500).json({ error: 'Failed to fetch shipping methods' });
      }
    } else if (req.method === 'POST') {
      try {
        const { name, description, price, freeAbove, active } = req.body;

        // Validate required fields
        if (!name || !price) {
          return res.status(400).json({
            success: false,
            error: 'Name and price are required'
          });
        }

        const shippingMethod = await prisma.shipping.create({
          data: {
            name: name.trim(),
            description: description?.trim() || null,
            price: parseFloat(price),
            freeAbove: freeAbove ? parseFloat(freeAbove) : null,
            active: active !== undefined ? Boolean(active) : true,
          },
        });

        logger.info('Shipping method created successfully', {
          message: 'Shipping method created',
          shippingMethodId: shippingMethod.id,
          shippingMethodName: shippingMethod.name,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        });

        res.status(201).json(shippingMethod);
      } catch (error: any) {
        logger.error('Error creating shipping method', error, {
          message: 'Failed to create shipping method',
          requestBody: req.body,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        });

        // Handle specific Prisma errors
        if (error.code === 'P2002') {
          res.status(409).json({ error: 'A shipping method with this name already exists' });
        } else {
          res.status(500).json({ error: 'Failed to create shipping method' });
        }
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logger.error('API Handler Error', req, error as Error);
    const statusCode = (error as any)?.statusCode || 500;
    const message = (error as any)?.message || 'Internal server error';
    res.status(statusCode).json({
      success: false,
      error: message,
    });
  }
}

export default withAdminAuth(handler);