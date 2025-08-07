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
  const bannerId = parseInt(id as string);

  if (req.method === 'PATCH') {
    try {
      const { title, image, link, order, active } = req.body;
      const banner = await prisma.banner.update({
        where: { id: bannerId },
        data: {
          title,
          image,
          link,
          order,
          active,
        },
      });
      res.status(200).json(banner);
    } catch (error) {
      console.error('Error updating banner:', error);
      res.status(500).json({ error: 'Failed to update banner' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.banner.delete({
        where: { id: bannerId },
      });
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting banner:', error);
      res.status(500).json({ error: 'Failed to delete banner' });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
