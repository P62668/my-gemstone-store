import { SearchManager } from '../../utils/search';
import { vi, beforeEach, describe, it, expect } from 'vitest';

// Simple mock implementation that doesn't require complex setup
const mockPrisma = {
  gemstone: {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
};

// Mock the entire prisma module
vi.mock('../../lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('Enhanced Search Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchGemstones', () => {
    it('should handle search with no results', async () => {
      mockPrisma.gemstone.findMany.mockResolvedValueOnce([]);
      mockPrisma.gemstone.count.mockResolvedValueOnce(0);

      const result = await SearchManager.searchGemstones('nonexistent', {}, 1, 10);
      
      expect(result.results).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(0);
    });

    it('should handle search errors gracefully', async () => {
      mockPrisma.gemstone.findMany.mockRejectedValueOnce(new Error('Database error'));
      mockPrisma.gemstone.count.mockRejectedValueOnce(new Error('Database error'));

      const result = await SearchManager.searchGemstones('ruby', {}, 1, 10);
      
      expect(result.results).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return empty array for queries with less than 2 characters', async () => {
      const suggestions = await SearchManager.getSearchSuggestions('r', 5);
      
      expect(suggestions).toEqual([]);
    });

    it('should handle suggestion errors gracefully', async () => {
      mockPrisma.gemstone.findMany.mockRejectedValueOnce(new Error('Database error'));

      const suggestions = await SearchManager.getSearchSuggestions('ruby', 5);
      
      expect(suggestions).toEqual([]);
    });
  });

  describe('getPopularSearchTerms', () => {
    it('should handle errors gracefully and return empty array', async () => {
      mockPrisma.gemstone.findMany.mockRejectedValueOnce(new Error('Database error'));

      const popularTerms = await SearchManager.getPopularSearchTerms(3);
      
      expect(popularTerms).toEqual([]);
    });
  });
});