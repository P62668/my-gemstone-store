import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../utils/authMiddleware';
import { NotificationService } from '../../../services/notificationService';
import { logger } from '../../../utils/logger';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Get all notification templates
      const templates = await NotificationService.getAllTemplates();
      return res.status(200).json(templates);
    } else if (req.method === 'POST') {
      // Create or update notification template
      const { name, subject, body, type } = req.body;
      
      if (!name || !subject || !body || !type) {
        return res.status(400).json({ error: 'Name, subject, body, and type are required' });
      }
      
      const template = await NotificationService.upsertNotificationTemplate(name, subject, body, type);
      return res.status(200).json(template);
    } else if (req.method === 'DELETE') {
      // Delete notification template
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Template ID is required' });
      }
      
      await NotificationService.deleteTemplate(Number(id));
      return res.status(204).end();
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    logger.error('[API/admin/notification-templates] Error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});