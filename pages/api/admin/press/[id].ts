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
  const pressId = parseInt(id as string);

  if (req.method === 'PATCH') {
    try {
      const { title, content, order, active } = req.body;
      const pressItem = await prisma.press.update({
        where: { id: pressId },
        data: {
          title,
          content,
          order,
          active,
        },
      });
      res.status(200).json(pressItem);
    } catch (error) {
      console.error('Error updating press item:', error);
      res.status(500).json({ error: 'Failed to update press item' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.press.delete({
        where: { id: pressId },
      });
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting press item:', error);
      res.status(500).json({ error: 'Failed to delete press item' });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
