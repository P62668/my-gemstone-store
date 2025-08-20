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
        const orders = await prisma.order.findMany({
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
          }
        });

        // Transform data to match frontend interface
        const transformedOrders = orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || order.user?.email || 'Unknown',
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          items: order.items.length,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }));

        res.status(200).json(transformedOrders);
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
