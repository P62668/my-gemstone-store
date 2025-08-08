import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    res.setHeader('Allow', ['GET', 'PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { id, history } = req.query;
  let user;
  try {
    user = getUserFromRequest(req);
  } catch (err: any) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const orderId = Number(id);
  if (isNaN(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  // Handle PATCH request for order cancellation
  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;

      if (status !== 'cancelled') {
        return res.status(400).json({ error: 'Only cancellation is allowed' });
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Only allow if user owns the order or is admin
      if (order.userId !== user.id && user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Check if order can be cancelled
      if (order.status === 'delivered' || order.status === 'cancelled') {
        return res.status(400).json({ error: 'Order cannot be cancelled' });
      }

      // Update order status
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'cancelled' },
        include: {
          items: {
            include: {
              gemstone: {
                select: {
                  name: true,
                  type: true,
                  images: true,
                },
              },
            },
          },
        },
      });

      // Add to status history
      await prisma.orderStatusHistory.create({
        data: {
          orderId: orderId,
          status: 'cancelled',
          comment: `Order cancelled by ${user.role === 'admin' ? 'Admin' : 'Customer'}`,
        },
      });

      // Parse gemstone images
      const parsedOrder = {
        ...updatedOrder,
        items: updatedOrder.items.map((item) => ({
          ...item,
          gemstone: {
            ...item.gemstone,
            images: Array.isArray(item.gemstone.images)
              ? item.gemstone.images
              : JSON.parse(item.gemstone.images || '[]'),
          },
        })),
      };

      return res.status(200).json(parsedOrder);
    } catch (error) {
      console.error('[API/orders/[id]] PATCH error:', error);
      return res.status(500).json({ error: 'Failed to update order' });
    }
  }
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            gemstone: {
              select: {
                name: true,
                type: true,
                images: true,
              },
            },
          },
        },
      },
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // Only allow if user owns the order or is admin
    if (order.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Parse gemstone images
    const parsedOrder = {
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
    };
    if (history) {
      const statusHistory = await prisma.orderStatusHistory.findMany({
        where: { orderId },
        orderBy: { createdAt: 'asc' },
      });
      return res.status(200).json({ order: parsedOrder, history: statusHistory });
    }
    res.status(200).json(parsedOrder);
  } catch (error) {
    console.error('[API/orders/[id]] 500 error:', {
      error,
      orderId,
      user,
      query: req.query,
      stack: (error as any)?.stack,
    });
    res
      .status(500)
      .json({ error: 'Failed to fetch order', details: (error as any)?.message || error });
  }
}
