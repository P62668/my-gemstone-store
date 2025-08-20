import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../utils/authMiddleware';

// Use singleton pattern for Prisma client
import { prisma } from '../../../lib/prisma';



export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  if (!user || !user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.method === 'GET') {
    try {
      const recentlyViewed = await prisma.recentlyViewed.findMany({
        where: { userId: user.id },
        include: { gemstone: true },
        orderBy: { viewedAt: 'desc' },
        take: 20,
      });
      return res.status(200).json(recentlyViewed);
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: 'Failed to fetch recently viewed', details: err.message || err });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
});
