import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../utils/authMiddleware';
import { prisma } from '../../../lib/prisma';

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
        const { name, role, company, content, rating, image, active } = req.body;
        
        // Validate required fields
        if (!name || !content) {
          return res.status(400).json({ error: 'Name and content are required' });
        }

        const testimonial = await prisma.testimonial.create({
          data: {
            name,
            role: role || null,
            company: company || null,
            content,
            rating: rating ? parseInt(rating as string) : 5,
            image: image || null,
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
    console.error('Authentication error:', err);
    return res.status(401).json({ error: 'Authentication required' });
  }
}

export default withAdminAuth(handler);