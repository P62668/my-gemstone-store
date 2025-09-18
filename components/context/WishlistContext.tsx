import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { toast } from 'react-hot-toast';
import LoadingOverlay from '../ui/LoadingOverlay';

interface WishlistItem {
  id: number;
  gemstoneId: number;
  gemstone?: any;
  createdAt?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (gemstoneId: number) => Promise<void>;
  removeFromWishlist: (gemstoneId: number) => Promise<void>;
  isInWishlist: (gemstoneId: number) => boolean;
  loading: boolean;
  error: string;
  setError: (msg: string) => void;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  isInWishlist: () => false,
  loading: false,
  error: '',
  setError: () => {},
  refreshWishlist: async () => {},
});

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Detect if user is logged in (simple check, can be improved)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    apiClient.get('/api/auth/session', { credentials: 'include' })
      .then(res => setIsAuthenticated(!!(res.data as any)?.user))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    setError('');
    try {
      const url = isAuthenticated ? '/api/users/wishlist' : '/api/session-wishlist';
      const res = await apiClient.get(url, { credentials: 'include' });
      if (res.ok) {
        setItems(Array.isArray(res.data) ? res.data : []);
      } else if (res.status === 401 && isAuthenticated) {
        // If server says unauthorized, try session endpoint for fallback
        const fallback = await apiClient.get('/api/session-wishlist', { credentials: 'include' });
        if (fallback.ok) setItems(Array.isArray(fallback.data) ? fallback.data : []);
        else {
          setItems([]);
          setError('Failed to fetch wishlist (guest fallback)');
          toast.error('Failed to fetch wishlist. Please try again.');
        }
      } else {
        setItems([]);
        setError('Failed to fetch wishlist');
        toast.error('Failed to fetch wishlist. Please try again.');
      }
    } catch (err: any) {
      setItems([]);
      setError(err?.message || 'Error loading wishlist');
      toast.error('Error loading wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const addToWishlist = async (gemstoneId: number) => {
    setLoading(true);
    setError('');
    try {
      const url = isAuthenticated ? '/api/users/wishlist' : '/api/session-wishlist';
      const res = await apiClient.post(url, { gemstoneId }, { credentials: 'include' });
      if (res.ok) {
        await fetchWishlist();
        toast.success(
          <div className="flex items-center">
            <span>Added to wishlist!</span>
          </div>
        );
      } else if (res.status === 401 && isAuthenticated) {
        // fallback to session
        const fallback = await apiClient.post('/api/session-wishlist', { gemstoneId }, { credentials: 'include' });
        if (fallback.ok) {
          await fetchWishlist();
          toast.success(
            <div className="flex items-center">
              <span>Added to wishlist!</span>
            </div>
          );
        } else {
          setError(
            fallback.data && typeof fallback.data === 'object' && 'error' in fallback.data && typeof (fallback.data as any).error === 'string'
              ? (fallback.data as any).error
              : 'Add to wishlist failed (guest fallback)'
          );
          toast.error('Failed to add to wishlist. Please try again.');
        }
      } else {
        setError(
          res.data && typeof res.data === 'object' && 'error' in res.data && typeof (res.data as any).error === 'string'
            ? (res.data as any).error
            : 'Add to wishlist failed'
        );
        toast.error('Failed to add to wishlist. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Add to wishlist error');
      toast.error('Failed to add to wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (gemstoneId: number) => {
    setLoading(true);
    setError('');
    try {
      const url = isAuthenticated ? '/api/users/wishlist' : '/api/session-wishlist';
      const res = await apiClient.delete(url, {
        credentials: 'include',
        body: JSON.stringify({ gemstoneId }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        await fetchWishlist();
        toast.success('Removed from wishlist');
      } else if (res.status === 401 && isAuthenticated) {
        const fallback = await apiClient.delete('/api/session-wishlist', {
          credentials: 'include',
          body: JSON.stringify({ gemstoneId }),
          headers: { 'Content-Type': 'application/json' },
        });
        if (fallback.ok) {
          await fetchWishlist();
          toast.success('Removed from wishlist');
        } else {
          setError(
            fallback.data && typeof fallback.data === 'object' && 'error' in fallback.data && typeof (fallback.data as any).error === 'string'
              ? (fallback.data as any).error
              : 'Remove from wishlist failed (guest fallback)'
          );
          toast.error('Failed to remove from wishlist. Please try again.');
        }
      } else {
        setError(
          res.data && typeof res.data === 'object' && 'error' in res.data && typeof (res.data as any).error === 'string'
            ? (res.data as any).error
            : 'Remove from wishlist failed'
        );
        toast.error('Failed to remove from wishlist. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Remove from wishlist error');
      toast.error('Failed to remove from wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if a gemstone is in the wishlist
  const isInWishlist = (gemstoneId: number) => {
    return items.some(item => item.gemstoneId === gemstoneId);
  };

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, loading, error, setError, refreshWishlist: fetchWishlist }}>
      {children}
      <LoadingOverlay 
        message="Updating wishlist..." 
        isVisible={loading} 
      />
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);