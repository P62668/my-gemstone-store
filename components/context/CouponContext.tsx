import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { toast } from 'react-hot-toast';

interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumAmount: number | null;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  validFrom: string;
  validTo: string;
  active: boolean;
  onePerUser: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AppliedCoupon {
  coupon: Coupon;
  discountAmount: number;
  discountedTotal: number;
}

interface CouponContextType {
  coupons: Coupon[];
  appliedCoupon: AppliedCoupon | null;
  loading: boolean;
  error: string;
  fetchCoupons: () => Promise<void>;
  applyCoupon: (code: string, cartTotal: number) => Promise<AppliedCoupon | null>;
  removeCoupon: () => void;
  setError: (msg: string) => void;
}

const CouponContext = createContext<CouponContextType>({
  coupons: [],
  appliedCoupon: null,
  loading: false,
  error: '',
  fetchCoupons: async () => {},
  applyCoupon: async () => null,
  removeCoupon: () => {},
  setError: () => {},
});

export const CouponProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/api/coupons');
      if (res.ok) {
        setCoupons(res.data as Coupon[]);
      } else {
        setError('Failed to fetch coupons');
      }
    } catch (err) {
      setError('Error fetching coupons');
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (code: string, cartTotal: number): Promise<AppliedCoupon | null> => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/api/coupons/apply', { code, cartTotal });
      if (res.ok) {
        const appliedCouponData = res.data as AppliedCoupon;
        setAppliedCoupon(appliedCouponData);
        toast.success(`Coupon "${code}" applied successfully!`);
        return appliedCouponData;
      } else {
        const errorMsg = (res.data as any)?.error || 'Failed to apply coupon';
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }
    } catch (err) {
      const errorMsg = 'Error applying coupon';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error applying coupon:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  return (
    <CouponContext.Provider
      value={{
        coupons,
        appliedCoupon,
        loading,
        error,
        fetchCoupons,
        applyCoupon,
        removeCoupon,
        setError,
      }}
    >
      {children}
    </CouponContext.Provider>
  );
};

export const useCoupon = () => useContext(CouponContext);