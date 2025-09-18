import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../utils/authMiddleware';
import { prisma } from '../../../lib/prisma';
import { logger } from '../../../utils/logger';

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  
  // This should never happen due to withAuth middleware, but we'll check for type safety
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.method === 'GET') {
    try {
      // Get user's notifications
      const notifications = await prisma.notification.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20, // Limit to 20 most recent notifications
      });

      return res.status(200).json(notifications);
    } catch (error) {
      logger.error('[API/notifications] GET error', error);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, message, type = 'info', orderId, link } = req.body;

      // Validate input
      if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
      }

      // Create notification
      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          title,
          message,
          type,
          orderId,
          link,
        },
      });

      return res.status(201).json(notification);
    } catch (error) {
      logger.error('[API/notifications] POST error', error);
      return res.status(500).json({ error: 'Failed to create notification' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
});