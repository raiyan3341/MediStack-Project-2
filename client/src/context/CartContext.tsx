'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

export interface CartItemProduct {
  _id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  image?: string;
}

export interface CartItem {
  product: CartItemProduct;
  quantity: number;
  subtotal: number;
  isOutOfStock: boolean;
}

interface CartContextType {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, organization } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isApprovedOrg =
    (user?.role === 'organization' && organization?.verificationStatus === 'approved') ||
    user?.role === 'admin' ||
    user?.role === 'owner';

  const refreshCart = async () => {
    if (!user || !isApprovedOrg) {
      setItems([]);
      setTotalAmount(0);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.get('/orders/cart');
      if (res.success) {
        setItems(res.items || []);
        setTotalAmount(res.totalAmount || 0);
      }
    } catch (err) {
      console.warn('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user, organization]);

  const addToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
    try {
      const res = await api.post('/orders/cart', { productId, quantity });
      if (res.success) {
        await refreshCart();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding to cart:', err);
      return false;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      await api.post('/orders/cart', { productId, quantity });
      await refreshCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await api.delete(`/orders/cart/${productId}`);
      await refreshCart();
    } catch (err) {
      console.error('Error removing cart item:', err);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/orders/cart');
      setItems([]);
      setTotalAmount(0);
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalAmount,
        itemCount,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

