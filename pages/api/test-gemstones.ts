import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('Testing gemstones API...');
      
      const gemstones = await prisma.gemstone.findMany({
        where: { active: true },
        include: { category: true },
        take: 5,
      });
      
      console.log('Found gemstones:', gemstones.length);
      
      res.status(200).json({
        count: gemstones.length,
        gemstones: gemstones,
      });
    } catch (error) {
      console.error('Test API error:', error);
      res.status(500).json({ error: 'Failed to fetch gemstones' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
