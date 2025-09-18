import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
    return;
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { code, cartTotal } = req.body;

    // Validate input
    if (!code || typeof cartTotal !== 'number' || cartTotal < 0) {
      res.status(400).json({ error: 'Invalid coupon code or cart total' });
      return;
    }

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (!coupon) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }

    // Check if coupon is active
    if (!coupon.active) {
      res.status(400).json({ error: 'Coupon is not active' });
      return;
    }

    // Check if coupon is valid within date range
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      res.status(400).json({ error: 'Coupon is not valid at this time' });
      return;
    }

    // Check if coupon has minimum amount requirement
    if (coupon.minimumAmount && cartTotal < coupon.minimumAmount) {
      res.status(400).json({ 
        error: `Minimum cart amount of $${coupon.minimumAmount.toFixed(2)} required for this coupon` 
      });
      return;
    }

    // Check if coupon has usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ error: 'Coupon usage limit exceeded' });
      return;
    }

    // Check if user has already used this coupon (if onePerUser is true)
    if (coupon.onePerUser) {
      const userCoupons = await prisma.userCoupon.findMany({
        where: {
          userId: parseInt(session.user.id, 10),
          couponId: coupon.id,
          orderId: null // Not yet associated with an order
        }
      });

      if (userCoupons.length > 0) {
        res.status(400).json({ error: 'You have already used this coupon' });
        return;
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      // Apply maximum discount limit if set
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    // Return coupon details and discount amount
    res.status(200).json({
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      discountedTotal: parseFloat((cartTotal - discountAmount).toFixed(2))
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ error: 'Failed to apply coupon' });
  }
}