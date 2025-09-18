
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../utils/authMiddleware';
import { z } from 'zod';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Strict input validation
    const schema = z.object({
      id: z.string().regex(/^\d+$/),
    });
    let parsed;
    try {
      parsed = schema.parse({ id: req.query.id });
    } catch (err) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }
    const itemId = parseInt(parsed.id, 10);

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId: user.id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Remove the item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    res.status(200).json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
