import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../utils/authMiddleware';
import { prisma } from '../../../lib/prisma';

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.method === 'GET') {
      // Get cart items
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
              active: true
            }
          }
        }
      });

      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      res.status(200).json({
        items: cartItems,
        total,
        itemCount: cartItems.length
      });

    } else if (req.method === 'PUT') {
      // Update cart item quantity
      const { itemId, quantity } = req.body;

      if (!itemId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid item ID or quantity' });
      }

      const cartItem = await prisma.cartItem.findFirst({
        where: { id: itemId, userId: user.id },
        include: { gemstone: true }
      });

      if (!cartItem) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      if (quantity > cartItem.gemstone.stockCount) {
        return res.status(400).json({ 
          error: `Only ${cartItem.gemstone.stockCount} units available` 
        });
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity }
      });

      res.status(200).json({ success: true, message: 'Cart updated successfully' });

    } else if (req.method === 'DELETE') {
      // Remove item from cart
      const { itemId } = req.body;

      if (!itemId) {
        return res.status(400).json({ error: 'Item ID is required' });
      }

      await prisma.cartItem.deleteMany({
        where: { id: itemId, userId: user.id }
      });

      res.status(200).json({ success: true, message: 'Item removed from cart' });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Cart items API error:', error);
    res.status(500).json({ error: 'Failed to process cart items' });
  }
});
