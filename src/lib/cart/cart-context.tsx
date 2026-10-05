'use client';

/**
 * Wholesale Cart Context & State Manager
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Rules:
 * - 100% Wholesale single fixed rate per piece.
 * - Total = pricePerPiece * quantity.
 * - No quantity-based pricing tiers or discounts.
 * - Persisted in localStorage for guest and authenticated merchants.
 */

import React, { createContext, useContext, useMemo, useCallback, useSyncExternalStore } from 'react';
import type { WholesaleCartItem } from '@/types';

interface CartContextType {
  items: WholesaleCartItem[];
  addItem: (item: Omit<WholesaleCartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  syncCartItems: (updatedItems: WholesaleCartItem[]) => void;
  clearCart: () => void;
  totalPieces: number;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'srr_wholesale_cart_v1';
const CART_CHANGE_EVENT = 'srr_wholesale_cart_change';

function getCartSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  try {
    return localStorage.getItem(CART_STORAGE_KEY) || '[]';
  } catch {
    return '[]';
  }
}

function getServerSnapshot(): string {
  return '[]';
}

function subscribeToCart(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener(CART_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(CART_CHANGE_EVENT, callback);
  };
}

function persistCart(items: WholesaleCartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  } catch (e) {
    console.error('Failed to save cart to localStorage:', e);
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cartRaw = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerSnapshot);

  const items = useMemo(() => {
    try {
      const parsed = JSON.parse(cartRaw);
      return Array.isArray(parsed) ? (parsed as WholesaleCartItem[]) : [];
    } catch {
      return [];
    }
  }, [cartRaw]);

  const addItem = useCallback((item: Omit<WholesaleCartItem, 'quantity'>, quantity = 1) => {
    if (quantity <= 0) return;
    const current = [...items];
    const existingIndex = current.findIndex((i) => i.productId === item.productId);
    if (existingIndex > -1) {
      current[existingIndex] = {
        ...current[existingIndex],
        quantity: current[existingIndex].quantity + quantity,
      };
    } else {
      current.push({ ...item, quantity });
    }
    persistCart(current);
  }, [items]);

  const removeItem = useCallback((productId: string) => {
    const updated = items.filter((i) => i.productId !== productId);
    persistCart(updated);
  }, [items]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    const updated = items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    persistCart(updated);
  }, [items, removeItem]);

  const clearCart = useCallback(() => {
    persistCart([]);
  }, []);

  const syncCartItems = useCallback((updatedItems: WholesaleCartItem[]) => {
    persistCart(updatedItems);
  }, []);

  const totalPieces = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.pricePerPiece * item.quantity, 0);
  }, [items]);

  const itemCount = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        syncCartItems,
        clearCart,
        totalPieces,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
