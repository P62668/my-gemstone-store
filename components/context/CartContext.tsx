import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiClient } from '../../utils/apiClient';
import { CartItem } from '../../interfaces';
import { performanceCache, CACHE_KEYS } from '../../utils/clientCache';
import { toast } from 'react-hot-toast';
import LoadingOverlay from '../ui/LoadingOverlay';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  error: string;
  setError: (msg: string) => void;
  refresh: () => Promise<void>;
  addToCart: (product: { id: number; price?: number }, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
  getCartTotal: () => number;
  getCartSubtotal: () => number; // New method to get subtotal before discounts
}

const noop = async () => {};

const CartContext = createContext<CartContextType>({
  items: [],
  loading: false,
  error: '',
  setError: () => {},
  refresh: noop,
  addToCart: noop,
  removeFromCart: noop,
  updateQuantity: noop,
  clearCart: noop,
  getCartCount: () => 0,
  getCartTotal: () => 0,
  getCartSubtotal: () => 0,
});

// Simple in-memory cache to reduce repeated requests during a short interval
let cartCache: { items: CartItem[]; timestamp: number } | null = null;
const CACHE_DURATION_MS = 30_000;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    setError('');
    try {
      const res = await apiClient.get<CartItem[] | { items: CartItem[] }>(getApiBase(), { credentials: 'include' });
      if (res?.ok) {
        // Handle both response formats: array or object with items property
        const data = Array.isArray(res.data) ? res.data : (res.data?.items || []);
        setItems(data);
        cartCache = { items: data, timestamp: Date.now() };
      } else if (res?.status === 401 && isAuthenticated) {
        // fallback to session cart for guests
        const fallback = await apiClient.get<CartItem[] | { items: CartItem[] }>('/api/session-cart', { credentials: 'include' });
        if (fallback.ok) {
          // Handle both response formats: array or object with items property
          const data = Array.isArray(fallback.data) ? fallback.data : (fallback.data?.items || []);
          setItems(data);
          cartCache = { items: data, timestamp: Date.now() };
        } else {
          setError('Failed to fetch cart (guest fallback)');
          toast.error('Failed to fetch cart. Please try again.');
        }
      } else if (res) {
        setError('Failed to fetch cart');
        toast.error('Failed to fetch cart. Please try again.');
      }
    } catch (err) {
      setError('Error loading cart');
      toast.error('Error loading cart. Please try again.');
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
    // Optimistic update for instant UI response
    const optimisticItem: CartItem = {
      id: Date.now(), // temporary ID
      quantity,
      gemstoneId: product.id,
      price: product.price || 0,
      gemstone: { id: product.id, price: product.price || 0 } as any
    };
    
    setItems(prev => [...prev, optimisticItem]);

    setLoading(true);
    setError('');
    try {
      const payload = { productId: product.id, gemstoneId: product.id, quantity };
      if (typeof product.price === 'number') (payload as any).price = product.price;
      
      // For authenticated users, use the REST API endpoints
      // For guests, use the session-cart handler with different HTTP methods
      let res;
      if (isAuthenticated) {
        res = await apiClient.post(`${getApiBase()}/add`, payload, { credentials: 'include' });
      } else {
        res = await apiClient.post(getApiBase(), payload, { credentials: 'include' });
      }
      
      if (res?.ok) {
        cartCache = null;
        await load(true);
        toast.success(
          <div className="flex items-center">
            <span>Added {quantity} item{quantity > 1 ? 's' : ''} to cart!</span>
          </div>
        );
      } else if (res?.status === 401 && isAuthenticated) {
        // try session add
        const fallback = await apiClient.post('/api/session-cart', payload, { credentials: 'include' });
        if (fallback.ok) {
          cartCache = null;
          await load(true);
          toast.success(
            <div className="flex items-center">
              <span>Added {quantity} item{quantity > 1 ? 's' : ''} to cart!</span>
            </div>
          );
        } else {
          // Revert optimistic update
          setItems(prev => prev.filter(item => item.id !== optimisticItem.id));
          setError(
            fallback.data && typeof fallback.data === 'object' && 'error' in fallback.data && typeof (fallback.data as any).error === 'string'
              ? (fallback.data as any).error
              : 'Add to cart failed (guest fallback)'
          );
          toast.error('Failed to add to cart. Please try again.');
        }
      } else {
        // Revert optimistic update
        setItems(prev => prev.filter(item => item.id !== optimisticItem.id));
        setError(
          res?.data && typeof res.data === 'object' && 'error' in res.data && typeof (res.data as any).error === 'string'
            ? (res.data as any).error
            : 'Add to cart failed'
        );
        toast.error('Failed to add to cart. Please try again.');
      }

    } catch (err: any) {
      // Revert optimistic update
      setItems(prev => prev.filter(item => item.id !== optimisticItem.id));
      setError(err?.message || 'Add to cart error');
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    // Optimistic update for instant UI response
    const removedItem = items.find(item => item.id === itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));

    setLoading(true);
    setError('');
    try {
      // For authenticated users, use the REST API endpoints
      // For guests, use the session-cart handler with DELETE method and body
      let res;
      if (isAuthenticated) {
        res = await apiClient.delete(`${getApiBase()}/remove?id=${itemId}`, { credentials: 'include' });
      } else {
        res = await apiClient.delete(getApiBase(), { 
          credentials: 'include',
          body: JSON.stringify({ gemstoneId: itemId })
        });
      }
      
      if (res?.ok) {
        cartCache = null;
        toast.success('Item removed from cart');
      } else {
        // Revert optimistic update
        if (removedItem) {
          setItems(prev => [...prev, removedItem]);
        }
        setError(
          res?.data && typeof res.data === 'object' && 'error' in res.data && typeof (res.data as any).error === 'string'
            ? (res.data as any).error
            : 'Remove from cart failed'
        );
        toast.error('Failed to remove item from cart. Please try again.');
      }
    } catch (err: any) {
      // Revert optimistic update
      if (removedItem) {
        setItems(prev => [...prev, removedItem]);
      }
      setError(err?.message || 'Remove from cart error');
      toast.error('Failed to remove item from cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    // Optimistic update for instant UI response
    const previousQuantity = items.find(item => item.id === itemId)?.quantity;
    setItems(prev => prev.map(it => (it.id === itemId ? { ...it, quantity } : it)));

    setLoading(true);
    setError('');
    try {
      // For authenticated users, use the REST API endpoints
      // For guests, use the session-cart handler with PUT method
      let res;
      if (isAuthenticated) {
        res = await apiClient.put(
          `${getApiBase()}/update`,
          { itemId, quantity },
          { credentials: 'include' }
        );
      } else {
        res = await apiClient.put(
          getApiBase(),
          { gemstoneId: itemId, quantity },
          { credentials: 'include' }
        );
      }
      
      if (res?.ok) {
        cartCache = null;
        if (quantity === 0) {
          toast.success('Item removed from cart');
        } else {
          toast.success('Quantity updated');
        }
      } else {
        // Revert optimistic update
        if (previousQuantity !== undefined) {
          setItems(prev => prev.map(it => (it.id === itemId ? { ...it, quantity: previousQuantity } : it)));
        }
        setError(
          res?.data && typeof res.data === 'object' && 'error' in res.data && typeof (res.data as any).error === 'string'
            ? (res.data as any).error
            : 'Update quantity failed'
        );
        toast.error('Failed to update quantity. Please try again.');
      }
    } catch (err: any) {
      // Revert optimistic update
      if (previousQuantity !== undefined) {
        setItems(prev => prev.map(it => (it.id === itemId ? { ...it, quantity: previousQuantity } : it)));
      }
      setError(err?.message || 'Update quantity error');
      toast.error('Failed to update quantity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    setError('');
    try {
      // For authenticated users, use the REST API endpoints
      // For guests, we need to handle this differently as session-cart doesn't have a clear endpoint
      let res;
      if (isAuthenticated) {
        res = await apiClient.delete(`${getApiBase()}/clear`, { credentials: 'include' });
      } else {
        // For session cart, we need to remove all items one by one or implement a clear endpoint
        // For now, we'll remove all items individually
        const removePromises = items.map(item => 
          apiClient.delete(getApiBase(), { 
            credentials: 'include',
            body: JSON.stringify({ gemstoneId: item.gemstoneId })
          })
        );
        await Promise.all(removePromises);
        res = { ok: true, data: null } as any;
      }
      
      if (res?.ok) {
        setItems([]);
        cartCache = null;
        toast.success('Cart cleared');
      } else {
        setError(
          res?.data && typeof res.data === 'object' && 'error' in res.data && typeof (res.data as any).error === 'string'
            ? (res.data as any).error
            : 'Clear cart failed'
        );
        toast.error('Failed to clear cart. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Clear cart error');
      toast.error('Failed to clear cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCartCount = () => items.reduce((acc, it) => acc + (it.quantity || 0), 0);
  const getCartSubtotal = () => items.reduce((acc, it) => acc + ((it.gemstone?.price || 0) * (it.quantity || 0)), 0);
  const getCartTotal = () => getCartSubtotal(); // For now, total equals subtotal. Will be updated when discounts are applied

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        error,
        setError,
        refresh,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
        getCartSubtotal
      }}
    >
      {children}
      <LoadingOverlay 
        message="Updating cart..." 
        isVisible={loading} 
      />
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);