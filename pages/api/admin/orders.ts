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
        const { page = '1', limit = '20', status = 'all', paymentStatus = 'all' } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (status !== 'all') {
          where.status = status;
        }
        if (paymentStatus !== 'all') {
          where.paymentStatus = paymentStatus;
        }

        const [orders, total] = await Promise.all([
          prisma.order.findMany({
            where,
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              },
              items: {
                include: {
                  gemstone: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            skip,
            take: limitNum
          }),
          prisma.order.count({ where })
        ]);

        // Get statistics
        const stats = await prisma.order.aggregate({
          _count: { id: true },
          _sum: { total: true },
        });

        const pendingCount = await prisma.order.count({
          where: { status: 'pending' },
        });

        const shippedCount = await prisma.order.count({
          where: { status: 'shipped' },
        });

        const deliveredCount = await prisma.order.count({
          where: { status: 'delivered' },
        });

        const cancelledCount = await prisma.order.count({
          where: { status: 'cancelled' },
        });

        // Transform data to match frontend interface
        const transformedOrders = orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || order.user?.email || 'Unknown',
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          trackingNumber: order.trackingNumber,
          items: order.items.length,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }));

        res.status(200).json({
          orders: transformedOrders,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
          stats: {
            total: stats._count.id,
            totalValue: stats._sum.total || 0,
            pending: pendingCount,
            shipped: shippedCount,
            delivered: deliveredCount,
            cancelled: cancelledCount,
          }
        });
      } catch (error) {
        logger.error('Error fetching orders', error, {
          message: 'Failed to fetch orders',
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        });
        res.status(500).json({ error: 'Failed to fetch orders' });
      }
    } else {
      res.setHeader('Allow', ['GET']);
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
