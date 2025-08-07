import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
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
