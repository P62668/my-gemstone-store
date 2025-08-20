import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiClient } from '../../utils/apiClient';

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
  loading: boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  loading: false,
  refreshWishlist: async () => {},
});

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  // Detect if user is logged in (simple check, can be improved)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    apiClient.get('/api/auth/session', { credentials: 'include' })
      .then(res => setIsAuthenticated(!!(res.data as any)?.user))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const url = isAuthenticated ? '/api/users/wishlist' : '/api/session-wishlist';
      const res = await apiClient.get(url, { credentials: 'include' });
      if (res.ok) {
        setItems(Array.isArray(res.data) ? res.data : []);
      } else if (res.status === 401 && isAuthenticated) {
        // If server says unauthorized, try session endpoint for fallback
        const fallback = await apiClient.get('/api/session-wishlist', { credentials: 'include' });
        if (fallback.ok) setItems(Array.isArray(fallback.data) ? fallback.data : []);
        else setItems([]);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
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
    try {
      const url = isAuthenticated ? '/api/users/wishlist' : '/api/session-wishlist';
      const res = await apiClient.post(url, { gemstoneId }, { credentials: 'include' });
      if (res.ok) await fetchWishlist();
      else if (res.status === 401 && isAuthenticated) {
        // fallback to session
        const fallback = await apiClient.post('/api/session-wishlist', { gemstoneId }, { credentials: 'include' });
        if (fallback.ok) await fetchWishlist();
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (gemstoneId: number) => {
    setLoading(true);
    try {
      const url = isAuthenticated ? '/api/users/wishlist' : '/api/session-wishlist';
      const res = await apiClient.delete(url, {
        credentials: 'include',
        body: JSON.stringify({ gemstoneId }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) await fetchWishlist();
      else if (res.status === 401 && isAuthenticated) {
        const fallback = await apiClient.delete('/api/session-wishlist', {
          credentials: 'include',
          body: JSON.stringify({ gemstoneId }),
          headers: { 'Content-Type': 'application/json' },
        });
        if (fallback.ok) await fetchWishlist();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, loading, refreshWishlist: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
