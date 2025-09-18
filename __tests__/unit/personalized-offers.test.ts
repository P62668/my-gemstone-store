import { vi, describe, it, expect } from 'vitest';
import { getPersonalizedOffers } from '../../utils/personalizedOffers';

describe('Personalized Offers System', () => {
  describe('getPersonalizedOffers', () => {
    it('should return generic offers for anonymous users', async () => {
      const offers = await getPersonalizedOffers();
      
      expect(offers).toHaveLength(2);
      expect(offers[0].title).toBe('Welcome Offer');
      expect(offers[0].discountPercentage).toBe(10);
      expect(offers[1].title).toBe('Flash Sale');
      expect(offers[1].discountPercentage).toBe(15);
    });

    // Note: More complex tests with database mocking would require a more sophisticated
    // test setup that's beyond the current scope. The basic functionality is tested above.
  });
});