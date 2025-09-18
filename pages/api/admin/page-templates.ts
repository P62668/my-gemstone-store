import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../utils/authMiddleware';
import { prisma } from '../../../lib/prisma';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ error: 'Authentication required' });
  } catch (err: any) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      const templates = await prisma.pageTemplate.findMany({
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, description, content } = req.body;

      // Validate required fields
      if (!name || !content) {
        return res.status(400).json({ error: 'Name and content are required' });
      }

      // Check if template name already exists
      const existingTemplate = await prisma.pageTemplate.findUnique({
        where: { name },
      });

      if (existingTemplate) {
        return res.status(400).json({ error: 'A template with this name already exists' });
      }

      const template = await prisma.pageTemplate.create({
        data: {
          name,
          description: description || null,
          content: content || {},
        },
      });

      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAdminAuth(handler);