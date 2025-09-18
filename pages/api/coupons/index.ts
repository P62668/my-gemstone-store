import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only admins can access all coupon operations
  if (req.method === 'GET' && session.user.role === 'admin') {
    // Get all coupons (admin only)
    try {
      const coupons = await prisma.coupon.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      return res.status(200).json(coupons);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch coupons' });
    }
  } else if (req.method === 'POST' && session.user.role === 'admin') {
    // Create a new coupon (admin only)
    try {
      const {
        code,
        name,
        description,
        discountType,
        discountValue,
        minimumAmount,
        maximumDiscount,
        usageLimit,
        validFrom,
        validTo,
        active,
        onePerUser
      } = req.body;

      // Validate required fields
      if (!code || !name || !discountType || !discountValue || !validFrom || !validTo) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate discount type
      if (discountType !== 'percentage' && discountType !== 'fixed') {
        return res.status(400).json({ error: 'Invalid discount type' });
      }

      // Validate discount value
      if (discountValue <= 0) {
        return res.status(400).json({ error: 'Discount value must be greater than 0' });
      }

      // Validate dates
      if (new Date(validFrom) >= new Date(validTo)) {
        return res.status(400).json({ error: 'Valid from date must be before valid to date' });
      }

      // Check if coupon code already exists
      const existingCoupon = await prisma.coupon.findUnique({
        where: { code }
      });

      if (existingCoupon) {
        return res.status(400).json({ error: 'Coupon code already exists' });
      }

      const coupon = await prisma.coupon.create({
        data: {
          code,
          name,
          description,
          discountType,
          discountValue,
          minimumAmount,
          maximumDiscount,
          usageLimit,
          validFrom: new Date(validFrom),
          validTo: new Date(validTo),
          active,
          onePerUser
        }
      });

      return res.status(201).json(coupon);
    } catch (error) {
      console.error('Error creating coupon:', error);
      return res.status(500).json({ error: 'Failed to create coupon' });
    }
  } else if (req.method === 'GET') {
    // Get active coupons for users
    try {
      const coupons = await prisma.coupon.findMany({
        where: {
          active: true,
          validFrom: {
            lte: new Date()
          },
          validTo: {
            gte: new Date()
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return res.status(200).json(coupons);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch coupons' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}