import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAdminAuth } from '../../../utils/adminSecurity';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Authenticate admin user
    const adminUser = await requireAdminAuth(req, res);
    if (!adminUser) {
      return; // Response already sent by requireAdminAuth
    }

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
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Admin orders API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
