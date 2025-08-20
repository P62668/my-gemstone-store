import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const press = await prisma.press.findMany({
      where: { active: true },
      orderBy: { date: 'desc' },
    });
    res.status(200).json(press);
  } catch {
    res.status(500).json({ error: 'Failed to fetch press' });
  }
}
