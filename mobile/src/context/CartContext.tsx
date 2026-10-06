import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MobileCartItem {
  productId: string;
  name: string;
  slug: string;
  productCode: string;
  categoryName: string;
  pricePerPiece: number;
  imageUrl?: string | null;
  stockQuantity: number;
  quantity: number;
}

interface CartContextValue {
  items: MobileCartItem[];
  totalPieces: number;
  subtotal: number;
  itemCount: number;
  addItem: (product: Omit<MobileCartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = 'srr_wholesale_cart_mobile_v1';

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<MobileCartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(CART_STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) setItems(parsed);
          } catch (e) {
            console.warn('Failed to parse cart storage:', e);
          }
        }
      })
      .finally(() => setIsInitialized(true));
  }, []);

  // Save cart to storage whenever items change (after initial load)
  useEffect(() => {
    if (!isInitialized) return;
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch((err) =>
      console.warn('Failed to save cart to storage:', err)
    );
  }, [items, isInitialized]);

  const addItem = useCallback(
    (product: Omit<MobileCartItem, 'quantity'>, quantity: number = 1) => {
      if (quantity <= 0) return;
      setItems((prev) => {
        const index = prev.findIndex((i) => i.productId === product.productId);
        if (index > -1) {
          const updated = [...prev];
          const newQty = updated[index].quantity + quantity;
          updated[index] = {
            ...updated[index],
            quantity: newQty,
          };
          return updated;
        } else {
          return [...prev, { ...product, quantity }];
        }
      });
    },
    []
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.productId !== productId);
      }
      return prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalPieces = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.pricePerPiece * item.quantity, 0),
    [items]
  );

  const itemCount = items.length;

  const value = useMemo(
    () => ({
      items,
      totalPieces,
      subtotal,
      itemCount,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, totalPieces, subtotal, itemCount, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
