import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../../services/notificationService';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // Get user's orders
    try {
      const orders = await prisma.order.findMany({
        where: {
          userId: parseInt(session.user.id, 10)
        },
        include: {
          items: {
            include: {
              gemstone: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
  } else if (req.method === 'POST') {
    // Create a new order
    try {
      const { items, total, status, paymentStatus, paymentMethod, shippingAddress, couponId } = req.body;

      // Validate input
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items are required' });
      }

      if (typeof total !== 'number' || total < 0) {
        return res.status(400).json({ error: 'Valid total is required' });
      }

      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create the order
      const order = await prisma.order.create({
        data: {
          userId: parseInt(session.user.id, 10),
          orderNumber,
          total,
          status: status || 'pending',
          paymentStatus: paymentStatus || 'pending',
          paymentMethod: paymentMethod || 'card',
          shippingAddress: JSON.stringify(shippingAddress)
        }
      });

      // Create order items
      const orderItems = await Promise.all(
        items.map((item: any) => 
          prisma.orderItem.create({
            data: {
              orderId: order.id,
              gemstoneId: item.gemstoneId,
              quantity: item.quantity,
              price: item.price
            }
          })
        )
      );

      // If a coupon was used, record its usage
      if (couponId) {
        await prisma.userCoupon.create({
          data: {
            userId: parseInt(session.user.id, 10),
            couponId: couponId,
            orderId: order.id
          }
        });

        // Increment the coupon's used count
        await prisma.coupon.update({
          where: { id: couponId },
          data: {
            usedCount: {
              increment: 1
            }
          }
        });
      }

      // Add loyalty points for the purchase (1 point per dollar spent)
      const pointsToAdd = Math.floor(total);
      if (pointsToAdd > 0) {
        try {
          await prisma.loyalty.upsert({
            where: { userId: parseInt(session.user.id, 10) },
            update: {
              points: { increment: pointsToAdd },
            },
            create: {
              userId: parseInt(session.user.id, 10),
              points: pointsToAdd,
              tier: 'Bronze',
            },
          });

          // Check if user qualifies for a higher tier
          const LOYALTY_TIERS = [
            { name: 'Bronze', minPoints: 0 },
            { name: 'Silver', minPoints: 500 },
            { name: 'Gold', minPoints: 1500 },
            { name: 'Platinum', minPoints: 3000 },
          ];

          const updatedLoyalty = await prisma.loyalty.findUnique({
            where: { userId: parseInt(session.user.id, 10) },
          });

          if (updatedLoyalty) {
            const eligibleTiers = LOYALTY_TIERS.filter(tier => updatedLoyalty.points >= tier.minPoints);
            const highestTier = eligibleTiers[eligibleTiers.length - 1];

            if (highestTier && highestTier.name !== updatedLoyalty.tier) {
              // User qualifies for a higher tier
              await prisma.loyalty.update({
                where: { userId: parseInt(session.user.id, 10) },
                data: { tier: highestTier.name },
              });
            }
          }
        } catch (loyaltyError) {
          console.error('Error updating loyalty points:', loyaltyError);
          // Don't fail the order if loyalty update fails
        }
      }

      // Create notification for new order
      try {
        await NotificationService.createOrderNotification(parseInt(session.user.id, 10), order.id, order.status);
      } catch (notificationError) {
        console.error('Error creating order notification:', notificationError);
        // Don't fail the order if notification creation fails
      }

      // Return the created order
      const fullOrder = {
        ...order,
        items: orderItems
      };

      return res.status(201).json(fullOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({ error: 'Failed to create order' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}