// src/contexts/CartContext.tsx (NEW FILE)
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartData | null>(null);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate cart count
  const cartCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  // Fetch cart when user changes or logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, user?.id]);

  const refreshCart = async (): Promise<void> => {
    if (!user?.id) {
      setCart(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cartData = await cartApi.getCart(user.id);
      setCart(cartData);
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);
      setError(err.message || 'Failed to fetch cart');
      // Set empty cart on error
      setCart({ userId: user.id, items: [], total: 0, currency: 'USD' });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'quantity'> & { quantity?: number }): Promise<void> => {
    if (!user?.id) {
      throw new Error('User must be logged in to add items to cart');
    }

    setLoading(true);
    setError(null);
    try {
      const quantity = item.quantity || 1;
      await cartApi.addToCart(user.id, { ...item, quantity });
      await refreshCart();
      
      // Auto-open sidebar when item is added
      setIsCartSidebarOpen(true);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add item to cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId: number, quantity: number): Promise<void> => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      if (quantity <= 0) {
        await cartApi.removeFromCart(user.id, productId);
      } else {
        await cartApi.updateCartItem(user.id, productId, quantity);
      }
      await refreshCart();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update cart item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: number): Promise<void> => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      await cartApi.removeFromCart(user.id, productId);
      await refreshCart();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove item from cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async (): Promise<void> => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      await cartApi.clearCart(user.id);
      setCart({ userId: user.id, items: [], total: 0, currency: 'USD' });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to clear cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openCartSidebar = (): void => {
    setIsCartSidebarOpen(true);
  };

  const closeCartSidebar = (): void => {
    setIsCartSidebarOpen(false);
  };

  const toggleCartSidebar = (): void => {
    setIsCartSidebarOpen(prev => !prev);
  };

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