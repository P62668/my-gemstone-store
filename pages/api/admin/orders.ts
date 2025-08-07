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
      const orders = await prisma.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              gemstone: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      const parsedOrders = orders.map((order) => ({
        ...order,
        items: order.items.map((item) => ({
          ...item,
          gemstone: {
            ...item.gemstone,
            images: Array.isArray(item.gemstone.images)
              ? item.gemstone.images
              : JSON.parse(item.gemstone.images || '[]'),
          },
        })),
      }));
      console.log(
        '[API/admin/orders] orders.length:',
        parsedOrders.length,
        'orders:',
        parsedOrders,
      );
      res.status(200).json(parsedOrders);
    } catch (error) {
      console.error('[API/admin/orders] Error fetching orders:', error, error?.stack);
      res.status(500).json({ error: 'Failed to fetch orders', details: error?.message || error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
