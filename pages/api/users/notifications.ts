import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cookie } = req.headers;
  if (!cookie) return res.status(401).json({ error: 'Not authenticated' });
  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (!tokenMatch) return res.status(401).json({ error: 'Not authenticated' });
  const token = tokenMatch[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id: number };
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  if (req.method === 'GET') {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: decoded.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      return res.status(200).json(notifications);
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: 'Failed to fetch notifications', details: err.message || err });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
