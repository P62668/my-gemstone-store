import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, AuthenticatedRequest } from '../../../utils/authMiddleware';
import { prisma } from '../../../lib/prisma';
import { logger } from '../../../utils/logger';

export default withAdminAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '20', userId, type, read } = req.query;
      
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      const skip = (pageNum - 1) * limitNum;
      
      const where: any = {};
      
      if (userId) {
        where.userId = parseInt(userId as string);
      }
      
      if (type) {
        where.type = type;
      }
      
      if (read !== undefined) {
        where.read = read === 'true';
      }
      
      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limitNum,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
        prisma.notification.count({ where }),
      ]);
      
      return res.status(200).json({
        notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      logger.error('[API/admin/notifications] GET error', error);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  } else if (req.method === 'POST') {
    try {
      const { userId, title, message, type = 'info', orderId, link } = req.body;
      
      // Validate input
      if (!userId || !title || !message) {
        return res.status(400).json({ error: 'User ID, title, and message are required' });
      }
      
      // Create notification
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          orderId,
          link,
        },
      });
      
      return res.status(201).json(notification);
    } catch (error) {
      logger.error('[API/admin/notifications] POST error', error);
      return res.status(500).json({ error: 'Failed to create notification' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (id) {
        // Delete specific notification
        const notificationId = parseInt(id as string);
        if (isNaN(notificationId)) {
          return res.status(400).json({ error: 'Invalid notification ID' });
        }
        
        await prisma.notification.delete({
          where: { id: notificationId },
        });
        
        return res.status(204).end();
      } else {
        // Delete all notifications (with confirmation)
        const { confirm } = req.body;
        if (confirm !== true) {
          return res.status(400).json({ error: 'Confirmation required to delete all notifications' });
        }
        
        await prisma.notification.deleteMany();
        
        return res.status(204).end();
      }
    } catch (error) {
      logger.error('[API/admin/notifications] DELETE error', error);
      return res.status(500).json({ error: 'Failed to delete notification(s)' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
});