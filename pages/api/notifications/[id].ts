import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../utils/authMiddleware';
import { prisma } from '../../../lib/prisma';
import { logger } from '../../../utils/logger';

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  const { id } = req.query;
  
  // This should never happen due to withAuth middleware, but we'll check for type safety
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const notificationId = Number(id);
  if (isNaN(notificationId)) {
    return res.status(400).json({ error: 'Invalid notification ID' });
  }

  if (req.method === 'GET') {
    try {
      // Get specific notification
      const notification = await prisma.notification.findUnique({
        where: {
          id: notificationId,
          userId: user.id,
        },
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      return res.status(200).json(notification);
    } catch (error) {
      logger.error('[API/notifications/[id]] GET error', error);
      return res.status(500).json({ error: 'Failed to fetch notification' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { read } = req.body;

      // Update notification
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId: user.id,
        },
        data: {
          read: read !== undefined ? Boolean(read) : undefined,
        },
      });

      return res.status(200).json(notification);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Notification not found' });
      }
      logger.error('[API/notifications/[id]] PATCH error', error);
      return res.status(500).json({ error: 'Failed to update notification' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Delete notification
      await prisma.notification.delete({
        where: {
          id: notificationId,
          userId: user.id,
        },
      });

      return res.status(204).end();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Notification not found' });
      }
      logger.error('[API/notifications/[id]] DELETE error', error);
      return res.status(500).json({ error: 'Failed to delete notification' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
});