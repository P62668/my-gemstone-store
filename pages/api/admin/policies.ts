import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../utils/authMiddleware';
import { prisma } from '../../../lib/prisma';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ success: false, error: 'Authentication required' });

    if (req.method === 'GET') {
      try {
        const policies = await prisma.policy.findMany({
          orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(policies);
      } catch (error) {
        console.error('Error fetching policies:', error);
        res.status(500).json({ error: 'Failed to fetch policies' });
      }
    } else if (req.method === 'POST') {
      try {
        const { title, slug, content, type, status } = req.body;
        
        // Validate required fields
        if (!title || !content || !type) {
          return res.status(400).json({ error: 'Title, content, and type are required' });
        }

        // Generate slug if not provided
        const finalSlug = slug || title.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');

        const policy = await prisma.policy.create({
          data: {
            title,
            slug: finalSlug,
            content,
            type,
            status: status || 'active',
          },
        });

        res.status(201).json(policy);
      } catch (error) {
        console.error('Error creating policy:', error);
        res.status(500).json({ error: 'Failed to create policy' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err: any) {
    console.error('Authentication error:', err);
    return res.status(401).json({ error: 'Authentication required' });
  }
}

export default withAdminAuth(handler);