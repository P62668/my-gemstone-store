import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Gemstone } from '../../interfaces';

export type CartItem = Gemstone & { quantity: number };

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Gemstone, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};

// Helper function to safely access localStorage
const getStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return [];
  }
};

// Helper function to safely save to localStorage
const saveCartToStorage = (cart: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on client-side only
  useEffect(() => {
    const storedCart = getStoredCart();
    setCart(storedCart);
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever cart changes (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      saveCartToStorage(cart);
    }
  }, [cart, isInitialized]);

  const addToCart = (item: Gemstone, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + quantity } : ci,
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((ci) => ci.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCart((prev) => prev.map((ci) => (ci.id === id ? { ...ci, quantity } : ci)));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
