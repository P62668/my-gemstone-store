
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../utils/authMiddleware';
import { logger } from '../../../utils/logger';
import { z } from 'zod';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Strict input validation
    const schema = z.object({
      itemId: z.number().int().positive(),
      quantity: z.number().int().positive(),
    });
    let parsed;
    try {
      parsed = schema.parse({
        itemId: typeof req.body.itemId === 'string' ? parseInt(req.body.itemId, 10) : req.body.itemId,
        quantity: typeof req.body.quantity === 'string' ? parseInt(req.body.quantity, 10) : req.body.quantity,
      });
    } catch (err) {
      return res.status(400).json({ error: 'Invalid item ID or quantity' });
    }
    const { itemId, quantity } = parsed;

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

    // Update the quantity
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    res.status(200).json({ message: 'Cart updated successfully' });
  } catch (error) {
    logger.error('Error updating cart', error, { url: req.url });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
