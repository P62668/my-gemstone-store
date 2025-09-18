
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../utils/authMiddleware';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from authenticated request
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated, use /api/session-cart for guests' });
    }

    // Strict input validation
    const schema = z.object({
      productId: z.number().int().positive(),
      quantity: z.number().int().positive().default(1),
    });
    let parsed;
    try {
      parsed = schema.parse({
        productId: typeof req.body.productId === 'string' ? parseInt(req.body.productId, 10) : req.body.productId,
        quantity: typeof req.body.quantity === 'string' ? parseInt(req.body.quantity, 10) : req.body.quantity,
      });
    } catch (err) {
      return res.status(400).json({ error: 'Invalid product ID or quantity' });
    }
    const { productId, quantity } = parsed;

    // Check if product exists
    const product = await prisma.gemstone.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Check if product is in stock
    if (product.stockCount < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        gemstoneId: productId,
      },
    });
    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;
      if (product.stockCount < newQuantity) {
        return res.status(400).json({ error: 'Insufficient stock for requested quantity' });
      }
      await prisma.cartItem.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: newQuantity,
          price: product.price,
        },
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          userId: user.id,
          gemstoneId: productId,
          quantity,
          price: product.price,
        },
      });
    }

    return res.status(200).json({ message: 'Added to cart' });
  } catch (error) {
    // Improved error logging
    console.error('Cart add error:', error);
    return res.status(500).json({ error: 'Failed to add to cart' });
  }
}

// TODO: Add CSRF protection and rate limiting middleware here for production
export default withAuth(handler);
