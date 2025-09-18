import { SearchManager } from '../../utils/search';
import { vi, beforeEach, describe, it, expect } from 'vitest';

// Simple mock implementation that doesn't require complex setup
const mockPrisma = {
  gemstone: {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    count: vi.fn().mockResolvedValue(0),
  },
  order: {
    findMany: vi.fn().mockResolvedValue([]),
  },
  recentlyViewed: {
    findMany: vi.fn().mockResolvedValue([]),
  },
};

// Mock the entire prisma module
vi.mock('../../lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('AI-Powered Recommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRecommendations', () => {
    it('should handle errors gracefully and return empty array', async () => {
      mockPrisma.gemstone.findMany.mockRejectedValueOnce(new Error('Database error'));
      
      const recommendations = await SearchManager.getRecommendations();
      expect(recommendations).toEqual([]);
    });
  });

  describe('getRelatedProducts', () => {
    it('should return empty array when gemstone is not found', async () => {
      mockPrisma.gemstone.findUnique.mockResolvedValueOnce(null);
      
      const relatedProducts = await SearchManager.getRelatedProducts(999);
      expect(relatedProducts).toEqual([]);
    });
  });

  describe('getTrendingProducts', () => {
    it('should handle errors gracefully and return empty array', async () => {
      mockPrisma.gemstone.findMany.mockRejectedValueOnce(new Error('Database error'));
      
      const trendingProducts = await SearchManager.getTrendingProducts(5);
      expect(trendingProducts).toEqual([]);
    });
  });
});