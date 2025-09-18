import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { logger } from '../../utils/logger';

// Dynamic pricing rules
const PRICING_RULES = {
  // Time-based pricing
  FLASH_SALE_DISCOUNT: 0.15, // 15% off
  SEASONAL_DISCOUNT: 0.10,   // 10% off
  WEEKEND_BUMP: 0.05,        // 5% increase
  
  // Inventory-based pricing
  LOW_STOCK_PREMIUM: 0.20,   // 20% increase for low stock
  OVERSTOCK_DISCOUNT: 0.15,  // 15% off for overstock
  
  // Demand-based pricing
  HIGH_DEMAND_PREMIUM: 0.10, // 10% increase for high demand
  LOW_DEMAND_DISCOUNT: 0.05, // 5% off for low demand
  
  // Thresholds
  LOW_STOCK_THRESHOLD: 5,
  OVERSTOCK_THRESHOLD: 50,
  HIGH_DEMAND_THRESHOLD: 100, // views per week
  LOW_DEMAND_THRESHOLD: 10,   // views per week
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { gemstoneId } = req.query;
      
      if (!gemstoneId) {
        return res.status(400).json({ error: 'Gemstone ID required' });
      }
      
      // Get dynamic price for a specific gemstone
      const dynamicPrice = await calculateDynamicPrice(Number(gemstoneId));
      res.status(200).json({ dynamicPrice });
    } else if (req.method === 'POST') {
      // Update all gemstone prices based on dynamic pricing rules
      await updateAllDynamicPrices();
      res.status(200).json({ message: 'Dynamic prices updated successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    logger.error('Dynamic Pricing API error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Calculate dynamic price for a gemstone
async function calculateDynamicPrice(gemstoneId: number) {
  // Get gemstone details
  const gemstone = await prisma.gemstone.findUnique({
    where: { id: gemstoneId }
  });
  
  if (!gemstone) {
    throw new Error('Gemstone not found');
  }
  
  let dynamicPrice = gemstone.price;
  
  // 1. Time-based pricing
  const now = new Date();
  const dayOfWeek = now.getDay();
  const month = now.getMonth();
  
  // Flash sale on weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    dynamicPrice *= (1 - PRICING_RULES.FLASH_SALE_DISCOUNT);
  }
  
  // Seasonal pricing
  if (month === 11 || month === 0) { // December, January
    dynamicPrice *= (1 - PRICING_RULES.SEASONAL_DISCOUNT);
  }
  
  // Weekend premium
  if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday, Saturday
    dynamicPrice *= (1 + PRICING_RULES.WEEKEND_BUMP);
  }
  
  // 2. Inventory-based pricing
  if (gemstone.stockCount <= PRICING_RULES.LOW_STOCK_THRESHOLD) {
    // Low stock premium
    dynamicPrice *= (1 + PRICING_RULES.LOW_STOCK_PREMIUM);
  } else if (gemstone.stockCount >= PRICING_RULES.OVERSTOCK_THRESHOLD) {
    // Overstock discount
    dynamicPrice *= (1 - PRICING_RULES.OVERSTOCK_DISCOUNT);
  }
  
  // 3. Demand-based pricing
  // Get view count for the past week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const viewCount = await prisma.recentlyViewed.count({
    where: {
      gemstoneId: gemstoneId,
      viewedAt: {
        gte: oneWeekAgo
      }
    }
  });
  
  if (viewCount >= PRICING_RULES.HIGH_DEMAND_THRESHOLD) {
    // High demand premium
    dynamicPrice *= (1 + PRICING_RULES.HIGH_DEMAND_PREMIUM);
  } else if (viewCount <= PRICING_RULES.LOW_DEMAND_THRESHOLD) {
    // Low demand discount
    dynamicPrice *= (1 - PRICING_RULES.LOW_DEMAND_DISCOUNT);
  }
  
  // Ensure price doesn't go below a minimum threshold (e.g., 10% of original)
  const minimumPrice = gemstone.price * 0.1;
  dynamicPrice = Math.max(dynamicPrice, minimumPrice);
  
  // Round to nearest cent
  return Math.round(dynamicPrice * 100) / 100;
}

// Update all gemstone prices based on dynamic pricing rules
async function updateAllDynamicPrices() {
  // Get all active gemstones
  const gemstones = await prisma.gemstone.findMany({
    where: { active: true }
  });
  
  // Update each gemstone's dynamic price
  for (const gemstone of gemstones) {
    try {
      const dynamicPrice = await calculateDynamicPrice(gemstone.id);
      
      // Update the gemstone record with the new dynamic price
      await prisma.gemstone.update({
        where: { id: gemstone.id },
        data: { dynamicPrice }
      });
    } catch (error) {
      logger.error(`Error updating dynamic price for gemstone ${gemstone.id}`, error);
    }
  }
}

export default handler;