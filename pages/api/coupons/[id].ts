import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    res.status(400).json({ error: 'Invalid coupon ID' });
    return;
  }

  const couponId = parseInt(id, 10);

  if (isNaN(couponId)) {
    res.status(400).json({ error: 'Invalid coupon ID' });
    return;
  }

  if (req.method === 'GET') {
    // Get a specific coupon
    try {
      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId }
      });

      if (!coupon) {
        res.status(404).json({ error: 'Coupon not found' });
        return;
      }

      // Only admins can see inactive coupons
      if (!coupon.active && session.user.role !== 'admin') {
        res.status(404).json({ error: 'Coupon not found' });
        return;
      }

      res.status(200).json(coupon);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch coupon' });
    }
  } else if (req.method === 'PUT' && session.user.role === 'admin') {
    // Update a coupon (admin only)
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

      // Validate discount type if provided
      if (discountType && discountType !== 'percentage' && discountType !== 'fixed') {
        res.status(400).json({ error: 'Invalid discount type' });
        return;
      }

      // Validate discount value if provided
      if (discountValue !== undefined && discountValue <= 0) {
        res.status(400).json({ error: 'Discount value must be greater than 0' });
        return;
      }

      // Validate dates if provided
      if (validFrom && validTo && new Date(validFrom) >= new Date(validTo)) {
        res.status(400).json({ error: 'Valid from date must be before valid to date' });
        return;
      }

      // Check if coupon code already exists (for other coupons)
      if (code) {
        const existingCoupon = await prisma.coupon.findUnique({
          where: { code }
        });

        if (existingCoupon && existingCoupon.id !== couponId) {
          res.status(400).json({ error: 'Coupon code already exists' });
          return;
        }
      }

      const coupon = await prisma.coupon.update({
        where: { id: couponId },
        data: {
          code,
          name,
          description,
          discountType,
          discountValue,
          minimumAmount,
          maximumDiscount,
          usageLimit,
          validFrom: validFrom ? new Date(validFrom) : undefined,
          validTo: validTo ? new Date(validTo) : undefined,
          active,
          onePerUser
        }
      });

      res.status(200).json(coupon);
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Coupon not found' });
        return;
      }
      console.error('Error updating coupon:', error);
      res.status(500).json({ error: 'Failed to update coupon' });
    }
  } else if (req.method === 'DELETE' && session.user.role === 'admin') {
    // Delete a coupon (admin only)
    try {
      await prisma.coupon.delete({
        where: { id: couponId }
      });

      res.status(204).end();
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Coupon not found' });
        return;
      }
      console.error('Error deleting coupon:', error);
      res.status(500).json({ error: 'Failed to delete coupon' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}