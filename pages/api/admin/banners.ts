import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  if (req.method === 'GET') {
    try {
      const banners = await prisma.banner.findMany({
        orderBy: { order: 'asc' },
      });
      res.status(200).json(banners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      res.status(500).json({ error: 'Failed to fetch banners' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, image, link, order, active } = req.body;
      const banner = await prisma.banner.create({
        data: {
          title,
          image,
          link,
          order: order || 0,
          active: active !== undefined ? active : true,
        },
      });
      res.status(201).json(banner);
    } catch (error) {
      console.error('Error creating banner:', error);
      res.status(500).json({ error: 'Failed to create banner' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
