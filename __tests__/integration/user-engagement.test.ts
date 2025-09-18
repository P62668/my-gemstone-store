import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getPersonalizedOffers } from '../../utils/personalizedOffers';
import { SearchManager } from '../../utils/search';

describe('User Engagement Features Integration', () => {
  describe('Personalized Offers System', () => {
    it('should return generic offers for anonymous users', async () => {
      const offers = await getPersonalizedOffers();
      
      expect(offers).toHaveLength(2);
      expect(offers[0].title).toBe('Welcome Offer');
      expect(offers[0].discountPercentage).toBe(10);
      expect(offers[1].title).toBe('Flash Sale');
      expect(offers[1].discountPercentage).toBe(15);
    });
  });

  describe('Search System', () => {
    it('should have search functionality available', () => {
      // Test that the SearchManager is properly exported and has the expected methods
      expect(SearchManager).toBeDefined();
      expect(typeof SearchManager.searchGemstones).toBe('function');
      expect(typeof SearchManager.getSearchSuggestions).toBe('function');
    });
  });

  describe('Recommendation System', () => {
    it('should have recommendation functionality available', () => {
      // Test that the SearchManager has recommendation methods
      expect(typeof SearchManager.getRecommendations).toBe('function');
      expect(typeof SearchManager.getRelatedProducts).toBe('function');
      expect(typeof SearchManager.getTrendingProducts).toBe('function');
    });
  });
});