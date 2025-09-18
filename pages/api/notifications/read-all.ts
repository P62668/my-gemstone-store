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
  
  if (req.method === 'POST') {
    try {
      // Mark all unread notifications as read
      const updated = await prisma.notification.updateMany({
        where: {
          userId: user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });

      return res.status(200).json({ 
        message: `Marked ${updated.count} notifications as read`,
        count: updated.count 
      });
    } catch (error) {
      logger.error('[API/notifications/read-all] POST error', error);
      return res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
});