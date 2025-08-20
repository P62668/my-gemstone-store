import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../../utils/authMiddleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const count = await prisma.wishlistItem.count({
      where: { userId: user.id }
    });

    return res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching wishlist count:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
