import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiClient } from '../../utils/apiClient';
import { CartItem } from '../../interfaces';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  refresh: () => Promise<void>;
  addToCart: (product: { id: number; price?: number }, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
  getCartTotal: () => number;
}

const noop = async () => {};

const CartContext = createContext<CartContextType>({
  items: [],
  loading: false,
  refresh: noop,
  addToCart: noop,
  removeFromCart: noop,
  updateQuantity: noop,
  clearCart: noop,
  getCartCount: () => 0,
  getCartTotal: () => 0,
});

// Simple in-memory cache to reduce repeated requests during a short interval
let cartCache: { items: CartItem[]; timestamp: number } | null = null;
const CACHE_DURATION_MS = 30_000;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // detect authentication (non-blocking)
  useEffect(() => {
    let mounted = true;
    apiClient
      .get('/api/auth/session', { credentials: 'include' })
      .then(res => {
        if (!mounted) return;
        const hasUser = !!(res?.data as any)?.user;
        setIsAuthenticated(hasUser);
      })
      .catch(() => {
        if (!mounted) return;
        setIsAuthenticated(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const getApiBase = () => (isAuthenticated ? '/api/cart' : '/api/session-cart');

  const load = async (force = false) => {
    if (loadingRef.current) return;
    if (!force && cartCache && Date.now() - cartCache.timestamp < CACHE_DURATION_MS) {
      setItems(cartCache.items);
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await apiClient.get<CartItem[]>(getApiBase(), { credentials: 'include' });
      if (res?.ok) {
        const data = res.data || [];
        setItems(data);
        cartCache = { items: data, timestamp: Date.now() };
      } else if (res?.status === 401 && isAuthenticated) {
        // fallback to session cart for guests
        const fallback = await apiClient.get<CartItem[]>('/api/session-cart', { credentials: 'include' });
        if (fallback.ok) {
          const data = fallback.data || [];
          setItems(data);
          cartCache = { items: data, timestamp: Date.now() };
        } else {
          console.warn('Failed to fetch cart (fallback):', fallback.status);
        }
      } else if (res) {
        console.warn('Failed to fetch cart:', res.status, res.data);
      }
    } catch (err) {
      console.warn('Error loading cart:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  // Refresh when auth status changes (login/logout)
  useEffect(() => {
    if (isAuthenticated === null) return; // still detecting
    load(true).catch(() => {});
  }, [isAuthenticated]);

  const refresh = async () => load(true);

  const addToCart = async (product: { id: number; price?: number }, quantity: number) => {
    setLoading(true);
    try {
      const payload: any = { productId: product.id, gemstoneId: product.id, quantity };
      if (typeof product.price === 'number') payload.price = product.price;
      const res = await apiClient.post(`${getApiBase()}/add`, payload, { credentials: 'include' });
      if (res?.ok) {
        cartCache = null;
        await load(true);
      } else if (res?.status === 401 && isAuthenticated) {
        // try session add
        const fallback = await apiClient.post('/api/session-cart/add', payload, { credentials: 'include' });
        if (fallback.ok) {
          cartCache = null;
          await load(true);
        } else {
          console.warn('Add to cart fallback failed', fallback.status, fallback.data);
        }
      } else {
        console.warn('Add to cart failed', res?.status, res?.data);
      }
    } catch (err) {
      console.warn('Add to cart error', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    setLoading(true);
    try {
      const res = await apiClient.delete(`${getApiBase()}/remove?id=${itemId}`, { credentials: 'include' });
      if (res?.ok) {
        setItems(prev => prev.filter(i => i.id !== itemId));
        cartCache = null;
      } else {
        console.warn('Remove from cart failed', res?.status);
      }
    } catch (err) {
      console.warn('Remove from cart error', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    setLoading(true);
    try {
      const res = await apiClient.put(
        `${getApiBase()}/update`,
        { itemId, quantity },
        { credentials: 'include' }
      );
      if (res?.ok) {
        setItems(prev => prev.map(it => (it.id === itemId ? { ...it, quantity } : it)));
        cartCache = null;
      } else {
        console.warn('Update quantity failed', res?.status);
      }
    } catch (err) {
      console.warn('Update quantity error', err);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const res = await apiClient.delete(`${getApiBase()}/clear`, { credentials: 'include' });
      if (res?.ok) {
        setItems([]);
        cartCache = null;
      } else {
        console.warn('Clear cart failed', res?.status);
      }
    } catch (err) {
      console.warn('Clear cart error', err);
    } finally {
      setLoading(false);
    }
  };

  const getCartCount = () => items.reduce((acc, it) => acc + (it.quantity || 0), 0);
  const getCartTotal = () => items.reduce((acc, it) => acc + ((it.gemstone?.price || 0) * (it.quantity || 0)), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        refresh,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
