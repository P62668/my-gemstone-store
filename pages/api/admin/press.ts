import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { requireAdmin } from '../../../utils/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  if (req.method === 'GET') {
    try {
      const press = await prisma.press.findMany({
        orderBy: { order: 'asc' },
      });
      res.status(200).json(press);
    } catch (error) {
      console.error('Error fetching press:', error);
      res.status(500).json({ error: 'Failed to fetch press' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, content, order, active } = req.body;
      const pressItem = await prisma.press.create({
        data: {
          title,
          content,
          order: order || 0,
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
