import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../utils/authMiddleware';
import { prisma } from '../../lib/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.method === 'GET') {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: user.id },
        include: {
          gemstone: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              images: true,
              stockCount: true,
              active: true,
            },
          },
        },
      });

      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      return res.status(200).json({ items: cartItems, total, itemCount });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Cart API error:', error);
    return res.status(500).json({ error: 'Failed to fetch cart' });
  }
}

export default withAuth(handler);
