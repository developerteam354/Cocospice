'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, CartItem } from '../types';

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  phone: string;
}

export const EMPTY_ADDRESS: Address = {
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  postcode: '',
  phone: '',
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem, selectedOptions?: Record<string, string>) => void;
  updateQuantity: (index: number, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  totalItems: number;
  orderType: 'delivery' | 'collection';
  setOrderType: (type: 'delivery' | 'collection') => void;
  orderNote: string;
  setOrderNote: (note: string) => void;
  shippingAddress: Address;
  setShippingAddress: (address: Address) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'delivery' | 'collection'>('delivery');
  const [orderNote, setOrderNote] = useState('');
  const [shippingAddress, setShippingAddress] = useState<Address>(EMPTY_ADDRESS);

  const addToCart = (item: MenuItem, selectedOptions?: Record<string, string>) => {
    setCart((prev) => {
      const existing = prev.find((c) => 
        c.id === item.id && 
        JSON.stringify(c.selectedOptions) === JSON.stringify(selectedOptions)
      );
      if (existing) {
        return prev.map((c) => (
          c.id === item.id && JSON.stringify(c.selectedOptions) === JSON.stringify(selectedOptions) 
            ? { ...c, quantity: c.quantity + 1 } 
            : c
        ));
      }
      return [...prev, { ...item, quantity: 1, selectedOptions }];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      return prev.map((c, i) => {
        if (i === index) {
          return { ...c, quantity: Math.max(0, c.quantity + delta) };
        }
        return c;
      }).filter(c => c.quantity > 0);
    });
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, clearCart, cartTotal, totalItems, orderType, setOrderType, orderNote, setOrderNote, shippingAddress, setShippingAddress }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
