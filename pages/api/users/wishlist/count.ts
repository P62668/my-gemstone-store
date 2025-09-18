import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../utils/getUser';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getUserFromRequest(req, res);
    if (!user) {
      // If no authenticated user, return 0 count instead of 401
      return res.status(200).json({ count: 0 });
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

export default handler;
