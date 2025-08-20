import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../utils/adminSecurity';

import { prisma } from '../../../lib/prisma';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = await requireAdminAuth(req, res);
    if (!adminUser) {
      return; // Response already sent by requireAdminAuth
    }
  } catch (err: any) {
    return res.status(401).json({ error: 'Authentication required' });
  }

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
}
