import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../utils/authMiddleware';
import { prisma } from '../../../lib/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user;
    if (!user) {
      return res.status(200).json({ count: 0 });
    }
    const count = await prisma.cartItem.aggregate({
      where: { userId: user.id },
      _sum: { quantity: true },
    });
    return res.status(200).json({ count: count._sum.quantity || 0 });
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
