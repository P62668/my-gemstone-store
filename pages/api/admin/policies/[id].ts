import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../utils/auth';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  const { id } = req.query;
  const policyId = parseInt(id as string);

  if (isNaN(policyId)) {
    return res.status(400).json({ error: 'Invalid policy ID' });
  }

  if (req.method === 'GET') {
    try {
      const policy = await prisma.policy.findUnique({
        where: { id: policyId },
      });

      if (!policy) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      res.status(200).json(policy);
    } catch (error) {
      console.error('Error fetching policy:', error);
      res.status(500).json({ error: 'Failed to fetch policy' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, slug, content, type, status } = req.body;
      
      // Validate required fields
      if (!title || !content || !type) {
        return res.status(400).json({ error: 'Title, content, and type are required' });
      }

      // Generate slug if not provided
      const finalSlug = slug || title.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');

      const policy = await prisma.policy.update({
        where: { id: policyId },
        data: {
          title,
          slug: finalSlug,
          content,
          type,
          status: status || 'active',
          updatedAt: new Date(),
        },
      });

      res.status(200).json(policy);
    } catch (error) {
      console.error('Error updating policy:', error);
      res.status(500).json({ error: 'Failed to update policy' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.policy.delete({
        where: { id: policyId },
      });
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting policy:', error);
      res.status(500).json({ error: 'Failed to delete policy' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}