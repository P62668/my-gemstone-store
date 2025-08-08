import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const user = getUserFromRequest(req);

      const returns = await prisma.return.findMany({
        where: { userId: user.id },
        include: {
          order: {
            include: {
              items: {
                include: {
                  gemstone: true,
                },
              },
            },
          },
        },
        orderBy: { returnDate: 'desc' },
      });

      res.status(200).json(returns);
    } catch (error) {
      console.error('Returns fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch returns' });
    }
  } else if (req.method === 'POST') {
    try {
      const user = getUserFromRequest(req);
      const { orderId, reason } = req.body;

      if (!orderId || !reason) {
        return res.status(400).json({ error: 'Order ID and reason are required' });
      }

      // Verify order belongs to user
      const order = await prisma.order.findFirst({
        where: { id: parseInt(orderId), userId: user.id },
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check if return already exists
      const existingReturn = await prisma.return.findFirst({
        where: { orderId: parseInt(orderId) },
      });

      if (existingReturn) {
        return res.status(400).json({ error: 'Return already exists for this order' });
      }

      const returnRequest = await prisma.return.create({
        data: {
          orderId: parseInt(orderId),
          userId: user.id,
          reason,
        },
        include: {
          order: {
            include: {
              items: {
                include: {
                  gemstone: true,
                },
              },
            },
          },
        },
      });

      res.status(201).json(returnRequest);
    } catch (error) {
      console.error('Return creation error:', error);
      res.status(500).json({ error: 'Failed to create return request' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
