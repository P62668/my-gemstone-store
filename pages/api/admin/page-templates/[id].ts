import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../../utils/authMiddleware';
import { prisma } from '../../../../lib/prisma';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ error: 'Authentication required' });
  } catch (err: any) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;
  const templateId = parseInt(id as string);

  if (req.method === 'GET') {
    try {
      const template = await prisma.pageTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.status(200).json(template);
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, description, content } = req.body;

      // Validate required fields
      if (!name || !content) {
        return res.status(400).json({ error: 'Name and content are required' });
      }

      // Check if another template with the same name exists
      const existingTemplate = await prisma.pageTemplate.findFirst({
        where: {
          name,
          NOT: {
            id: templateId,
          },
        },
      });

      if (existingTemplate) {
        return res.status(400).json({ error: 'A template with this name already exists' });
      }

      const template = await prisma.pageTemplate.update({
        where: { id: templateId },
        data: {
          name,
          description: description || null,
          content: content || {},
          updatedAt: new Date(),
        },
      });

      res.status(200).json(template);
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.pageTemplate.delete({
        where: { id: templateId },
      });

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAdminAuth(handler);