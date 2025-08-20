import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../utils/adminSecurity';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = await requireAdminAuth(req, res);
    if (!adminUser) {
      return; // Response already sent by requireAdminAuth
    }
  } catch (err: any) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      const { status, page = '1', limit = '20' } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const [returns, total] = await Promise.all([
        prisma.return.findMany({
          where,
          include: {
            order: {
              include: {
                user: {
                  select: { firstName: true, lastName: true, email: true },
                },
                items: {
                  include: {
                    gemstone: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.return.count({ where }),
      ]);

      res.status(200).json({
        returns,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error('Returns fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch returns' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, status, refundAmount, refundMethod, notes } = req.body;

      if (!id || !status) {
        return res.status(400).json({ error: 'Return ID and status are required' });
      }

      const updateData: any = {
        status,
        processedAt: new Date(),
      };

      if (refundAmount !== undefined) updateData.refundAmount = parseFloat(refundAmount);
      if (refundMethod) updateData.refundMethod = refundMethod;
      if (notes) updateData.notes = notes;

      const returnRequest = await prisma.return.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          order: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true },
              },
              items: {
                include: {
                  gemstone: true,
                },
              },
            },
          },
        },
      });

      // If approved, update order status (refund handling would be done separately)
      if (status === 'approved' && refundAmount) {
        // Update order to reflect return status
        await prisma.order.update({
          where: { id: returnRequest.orderId },
          data: { 
            status: 'returned',
            updatedAt: new Date()
          },
        });
      }

      res.status(200).json(returnRequest);
    } catch (error) {
      console.error('Return update error:', error);
      res.status(500).json({ error: 'Failed to update return' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
