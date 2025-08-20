import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../utils/adminSecurity';

import { prisma } from '../../../lib/prisma';

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
