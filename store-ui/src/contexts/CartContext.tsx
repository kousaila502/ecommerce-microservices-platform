// src/contexts/CartContext.tsx (FIXED VERSION WITH TOKEN)
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as cartApi from '../api/cart';

interface CartItem {
  productId: number;
  sku: string;
  title: string;
  quantity: number;
  price: number;
  currency: string;
}

interface CartData {
  userId: number;
  items: CartItem[];
  total: number;
  currency: string;
}

interface CartContextType {
  cart: CartData | null;
  cartCount: number;
  isCartSidebarOpen: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  openCartSidebar: () => void;
  closeCartSidebar: () => void;
  toggleCartSidebar: () => void;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  updateCartItem: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user, isAuthenticated, token } = useAuth();
  const [cart, setCart] = useState<CartData | null>(null);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate cart count
  const cartCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  // Memoize refreshCart to prevent infinite loops
  const refreshCart = useCallback(async (): Promise<void> => {
    if (!user?.id || !token) {
      setCart(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cartData = await cartApi.getCart(user.id, token);
      if (cartData) {
        setCart(cartData);
      } else {
        // Set empty cart if API returns null
        setCart({ userId: user.id, items: [], total: 0, currency: 'USD' });
      }
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);
      setError(err.message || 'Failed to fetch cart');
      // Set empty cart on error
      setCart({ userId: user.id, items: [], total: 0, currency: 'USD' });
    } finally {
      setLoading(false);
    }
  }, [user?.id, token]); // Dependencies: only re-create when user ID or token changes

  // Fetch cart when user changes or logs in
  useEffect(() => {
    if (isAuthenticated && user?.id && token) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, user?.id, token, refreshCart]);

  // Memoize other functions to prevent unnecessary re-renders
  const addToCart = useCallback(async (item: Omit<CartItem, 'quantity'> & { quantity?: number }): Promise<void> => {
    if (!user?.id || !token) {
      throw new Error('User must be logged in to add items to cart');
    }

    setLoading(true);
    setError(null);
    try {
      const quantity = item.quantity || 1;
      const addToCartPayload = {
        productId: item.productId,
        sku: item.sku,
        title: item.title,
        quantity,
        price: item.price,
        currency: item.currency,
      };

      const result = await cartApi.addToCart(user.id, addToCartPayload, token);
      if (result) {
        await refreshCart();
        // Auto-open sidebar when item is added
        setIsCartSidebarOpen(true);
      } else {
        throw new Error('Failed to add item to cart');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add item to cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, token, refreshCart]);

  const updateCartItem = useCallback(async (productId: number, quantity: number): Promise<void> => {
    if (!user?.id || !token) return;

    setLoading(true);
    setError(null);
    try {
      if (quantity <= 0) {
        const result = await cartApi.removeFromCart(user.id, productId, token);
        if (!result) {
          throw new Error('Failed to remove item from cart');
        }
      } else {
        const result = await cartApi.updateCartItemQuantity(user.id, productId, quantity, token);
        if (!result) {
          throw new Error('Failed to update cart item');
        }
      }
      await refreshCart();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update cart item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, token, refreshCart]);

  const removeFromCart = useCallback(async (productId: number): Promise<void> => {
    if (!user?.id || !token) return;

    setLoading(true);
    setError(null);
    try {
      const result = await cartApi.removeFromCart(user.id, productId, token);
      if (result) {
        await refreshCart();
      } else {
        throw new Error('Failed to remove item from cart');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove item from cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, token, refreshCart]);

  const clearCart = useCallback(async (): Promise<void> => {
    if (!user?.id || !token) return;

    setLoading(true);
    setError(null);
    try {
      const result = await cartApi.clearCart(user.id, token);
      if (result) {
        setCart({ userId: user.id, items: [], total: 0, currency: 'USD' });
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to clear cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, token]);

  // Memoize sidebar functions
  const openCartSidebar = useCallback((): void => {
    setIsCartSidebarOpen(true);
  }, []);

  const closeCartSidebar = useCallback((): void => {
    setIsCartSidebarOpen(false);
  }, []);

  const toggleCartSidebar = useCallback((): void => {
    setIsCartSidebarOpen(prev => !prev);
  }, []);

  const contextValue: CartContextType = {
    cart,
    cartCount,
    isCartSidebarOpen,
    loading,
    error,
    openCartSidebar,
    closeCartSidebar,
    toggleCartSidebar,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};