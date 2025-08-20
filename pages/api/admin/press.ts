import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../utils/authMiddleware';

import { prisma } from '../../../lib/prisma';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ success: false, error: 'Authentication required' });
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

export default withAdminAuth(handler);
