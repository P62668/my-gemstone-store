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
      const press = await prisma.press.findMany({
        orderBy: { date: 'desc' },
      });
      res.status(200).json(press);
    } catch (error) {
      console.error('Error fetching press:', error);
      res.status(500).json({ error: 'Failed to fetch press' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, content, active } = req.body;
      const pressItem = await prisma.press.create({
        data: {
          title,
          content,
          date: new Date(),
          active: active !== undefined ? active : true,
        },
      });
      res.status(201).json(pressItem);
    } catch (error) {
      console.error('Error creating press item:', error);
      res.status(500).json({ error: 'Failed to create press item' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
