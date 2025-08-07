import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  const { id } = req.query;
  const testimonialId = parseInt(id as string);

  if (req.method === 'PATCH') {
    try {
      const { name, content, order, active } = req.body;
      const testimonial = await prisma.testimonial.update({
        where: { id: testimonialId },
        data: {
          name,
          content,
          order,
          active,
        },
      });
      res.status(200).json(testimonial);
    } catch (error) {
      console.error('Error updating testimonial:', error);
      res.status(500).json({ error: 'Failed to update testimonial' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.testimonial.delete({
        where: { id: testimonialId },
      });
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      res.status(500).json({ error: 'Failed to delete testimonial' });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
