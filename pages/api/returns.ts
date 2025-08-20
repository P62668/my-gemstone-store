import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../utils/auth';

import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // For public returns info, return general policy
      return res.status(200).json({
        policy: {
          returnWindow: '30 days',
          conditions: [
            'Item must be in original condition',
            'Original packaging must be intact',
            'Certificate must be included',
            'Return shipping is customer responsibility'
          ],
          process: [
            'Contact customer service within 30 days',
            'Provide order number and reason',
            'Ship item back with tracking',
            'Refund processed within 5-7 business days'
          ],
          exclusions: [
            'Custom or engraved items',
            'Items with signs of wear',
            'Items without original certificate'
          ]
        },
        contactInfo: {
          email: 'returns@kolkata-gems.com',
          phone: '+91-98765-43210',
          address: 'Shankarmala, Kolkata, West Bengal, India'
        }
      });
    } catch (error) {
      console.error('Returns fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch returns' });
    }
  } else if (req.method === 'POST') {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
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
