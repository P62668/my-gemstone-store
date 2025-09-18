import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { toast } from 'react-hot-toast';

interface LoyaltyTier {
  id: number;
  name: string;
  minPoints: number;
  discountPercent: number;
  benefits: string[];
}

interface LoyaltyData {
  points: number;
  tier: string;
  nextTier: LoyaltyTier | null;
  progress: number;
  benefits: string[];
}

interface LoyaltyContextType {
  loyalty: LoyaltyData | null;
  loading: boolean;
  error: string;
  fetchLoyalty: () => Promise<void>;
  addLoyaltyPoints: (points: number, orderId?: number) => Promise<void>;
  setError: (msg: string) => void;
}

const LoyaltyContext = createContext<LoyaltyContextType>({
  loyalty: null,
  loading: false,
  error: '',
  fetchLoyalty: async () => {},
  addLoyaltyPoints: async () => {},
  setError: () => {},
});

export const LoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLoyalty = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/api/loyalty');
      if (res.ok) {
        setLoyalty(res.data as LoyaltyData);
      } else {
        setError('Failed to fetch loyalty data');
      }
    } catch (err) {
      setError('Error fetching loyalty data');
      console.error('Error fetching loyalty data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addLoyaltyPoints = async (points: number, orderId?: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/api/loyalty', { points, orderId });
      if (res.ok) {
        const loyaltyData = res.data as LoyaltyData & { upgraded?: boolean; message?: string };
        setLoyalty(loyaltyData);
        if (loyaltyData.upgraded) {
          toast.success(loyaltyData.message || `Congratulations! You've been upgraded to ${loyaltyData.tier} tier.`);
        } else {
          toast.success(`Added ${points} loyalty points to your account!`);
        }
      } else {
        const errorMsg = (res.data as any)?.error || 'Failed to add loyalty points';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Error adding loyalty points';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error adding loyalty points:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoyaltyContext.Provider
      value={{
        loyalty,
        loading,
        error,
        fetchLoyalty,
        addLoyaltyPoints,
        setError,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = () => useContext(LoyaltyContext);