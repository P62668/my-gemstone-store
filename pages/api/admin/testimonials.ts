import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAdminAuth } from '../../../utils/authMiddleware';
import { requireEnv, getEnv } from '../../../utils/env';

// Ensure we read secrets consistently (not used directly here but keep pattern)
const JWT_SECRET = process.env.NODE_ENV === 'production' ? requireEnv('JWT_SECRET') : getEnv('JWT_SECRET') || 'dev-secret';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ success: false, error: 'Authentication required' });

    if (req.method === 'GET') {
      try {
        const testimonials = await prisma.testimonial.findMany({
          orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(testimonials);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
      }
    } else if (req.method === 'POST') {
      try {
        const { name, content, order, active } = req.body;
        const testimonial = await prisma.testimonial.create({
          data: {
            name,
            content,
            rating: 5,
            active: active !== undefined ? active : true,
          },
        });
        res.status(201).json(testimonial);
      } catch (error) {
        console.error('Error creating testimonial:', error);
        res.status(500).json({ error: 'Failed to create testimonial' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err: any) {
    return res.status(401).json({ error: 'Authentication required' });
  }
}

export default withAdminAuth(handler);
