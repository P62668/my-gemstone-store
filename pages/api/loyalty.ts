import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../utils/authMiddleware';
import prisma from '../../lib/prisma';
import { logger } from '../../utils/logger';

interface LoyaltyTier {
  id: number;
  name: string;
  minPoints: number;
  discountPercent: number;
  benefits: string[];
}

const LOYALTY_TIERS: LoyaltyTier[] = [
  { id: 1, name: 'Bronze', minPoints: 0, discountPercent: 0, benefits: ['Exclusive access to sales'] },
  { id: 2, name: 'Silver', minPoints: 500, discountPercent: 5, benefits: ['5% discount', 'Early access to new collections'] },
  { id: 3, name: 'Gold', minPoints: 1500, discountPercent: 10, benefits: ['10% discount', 'Free shipping', 'Personal shopping assistant'] },
  { id: 4, name: 'Platinum', minPoints: 3000, discountPercent: 15, benefits: ['15% discount', 'Free shipping & returns', 'Personal shopping assistant', 'Exclusive events'] },
];

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    if (req.method === 'GET') {
      // Get user's loyalty points and tier
      const loyalty = await prisma.loyalty.findUnique({
        where: { userId: user.id },
      });

      if (!loyalty) {
        // Create loyalty record if it doesn't exist
        const newLoyalty = await prisma.loyalty.create({
          data: {
            userId: user.id,
            points: 0,
            tier: 'Bronze',
          },
        });
        return res.status(200).json({
          points: newLoyalty.points,
          tier: newLoyalty.tier,
          nextTier: LOYALTY_TIERS[1],
          progress: 0,
          benefits: LOYALTY_TIERS[0].benefits,
        });
      }

      // Determine current tier
      const currentTier = LOYALTY_TIERS.find(tier => tier.name === loyalty.tier) || LOYALTY_TIERS[0];
      const currentTierIndex = LOYALTY_TIERS.findIndex(tier => tier.name === loyalty.tier);
      const nextTier = currentTierIndex < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[currentTierIndex + 1] : null;
      
      // Calculate progress to next tier
      let progress = 0;
      if (nextTier) {
        const pointsNeeded = nextTier.minPoints - currentTier.minPoints;
        const pointsEarned = loyalty.points - currentTier.minPoints;
        progress = Math.min(100, Math.max(0, (pointsEarned / pointsNeeded) * 100));
      }

      res.status(200).json({
        points: loyalty.points,
        tier: loyalty.tier,
        nextTier,
        progress,
        benefits: currentTier.benefits,
      });
    } else if (req.method === 'POST') {
      // Add points to user's account (typically called after a purchase)
      const { points, orderId } = req.body;

      if (!points || typeof points !== 'number' || points <= 0) {
        return res.status(400).json({ error: 'Valid points value required' });
      }

      // Add points to user's account
      const updatedLoyalty = await prisma.loyalty.upsert({
        where: { userId: user.id },
        update: {
          points: { increment: points },
        },
        create: {
          userId: user.id,
          points: points,
          tier: 'Bronze',
        },
      });

      // Check if user qualifies for a higher tier
      const eligibleTiers = LOYALTY_TIERS.filter(tier => updatedLoyalty.points >= tier.minPoints);
      const highestTier = eligibleTiers[eligibleTiers.length - 1];
      
      if (highestTier && highestTier.name !== updatedLoyalty.tier) {
        // User qualifies for a higher tier
        await prisma.loyalty.update({
          where: { userId: user.id },
          data: { tier: highestTier.name },
        });
        
        // Return updated information with tier upgrade notification
        res.status(200).json({
          points: updatedLoyalty.points + points,
          tier: highestTier.name,
          upgraded: true,
          message: `Congratulations! You've been upgraded to ${highestTier.name} tier.`,
        });
      } else {
        res.status(200).json({
          points: updatedLoyalty.points + points,
          tier: updatedLoyalty.tier,
        });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    logger.error('Loyalty API error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);