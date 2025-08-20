import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../utils/authMiddleware';
import { prisma } from '../../../lib/prisma';

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    res.setHeader('Allow', ['GET', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }
  const { id, history } = req.query;

  const orderId = Number(id);
  if (isNaN(orderId)) {
    res.status(400).json({ error: 'Invalid order ID' });
    return;
  }

  const user = req.user;
  if (!user || !user.id) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  // Handle PATCH request for order cancellation
  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;

      if (status !== 'cancelled') {
        res.status(400).json({ error: 'Only cancellation is allowed' });
        return;
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      // Only allow if user owns the order or is admin
      if (order.userId !== user.id && user.role !== 'admin') {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      // Check if order can be cancelled
      if (order.status === 'delivered' || order.status === 'cancelled') {
        res.status(400).json({ error: 'Order cannot be cancelled' });
        return;
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
                  certificate: true,
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
            images:
              typeof item.gemstone.images === 'string'
                ? item.gemstone.images
                  ? item.gemstone.images.split(',').map((img) => img.trim())
                  : []
                : Array.isArray(item.gemstone.images)
                ? item.gemstone.images
                : [],
          },
        })),
      };

      res.status(200).json(parsedOrder);
      return;
    } catch (error) {
      console.error('[API/orders/[id]] PATCH error:', error);
      res.status(500).json({ error: 'Failed to update order' });
      return;
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
                certificate: true,
                images: true,
              },
            },
          },
        },
      },
    });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    // Only allow if user owns the order or is admin
    if (order.userId !== user.id && user.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    // Parse gemstone images
    const parsedOrder = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        gemstone: {
          ...item.gemstone,
          images:
            typeof item.gemstone.images === 'string'
              ? item.gemstone.images
                ? item.gemstone.images.split(',').map((img) => img.trim())
                : []
              : Array.isArray(item.gemstone.images)
              ? item.gemstone.images
              : [],
        },
      })),
    };
    if (history) {
      const statusHistory = await prisma.orderStatusHistory.findMany({
        where: { orderId },
        orderBy: { createdAt: 'asc' },
      });
      res.status(200).json({ order: parsedOrder, history: statusHistory });
      return;
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
});
