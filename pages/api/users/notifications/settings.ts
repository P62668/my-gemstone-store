import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../../utils/authMiddleware';
import { prisma } from '../../../../lib/prisma';
import { logger } from '../../../../utils/logger';

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  
  if (req.method === 'GET') {
    try {
      // For now, we're using default settings since we don't have a separate settings model
      // In a real implementation, you would store these in the database
      const defaultSettings = {
        emailNotifications: true,
        smsNotifications: false,
        orderUpdates: true,
        promotionalEmails: true,
      };
      
      return res.status(200).json(defaultSettings);
    } catch (error) {
      logger.error('[API/users/notifications/settings] GET error', error);
      return res.status(500).json({ error: 'Failed to fetch notification settings' });
    }
  } else if (req.method === 'POST') {
    try {
      const { emailNotifications, smsNotifications, orderUpdates, promotionalEmails } = req.body;
      
      // For now, we're just returning success since we don't have a separate settings model
      // In a real implementation, you would store these in the database
      const settings = {
        emailNotifications: emailNotifications !== undefined ? Boolean(emailNotifications) : true,
        smsNotifications: smsNotifications !== undefined ? Boolean(smsNotifications) : false,
        orderUpdates: orderUpdates !== undefined ? Boolean(orderUpdates) : true,
        promotionalEmails: promotionalEmails !== undefined ? Boolean(promotionalEmails) : true,
      };
      
      return res.status(200).json(settings);
    } catch (error) {
      logger.error('[API/users/notifications/settings] POST error', error);
      return res.status(500).json({ error: 'Failed to update notification settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
});