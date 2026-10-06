import React from 'react';
import type { Metadata } from 'next';
import { CartView } from '@/components/cart/CartView';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Wholesale Cart | Sri Raja Rajeshwara Handloom',
  description: 'Manage your wholesale textile piece order with transparent fixed piece pricing.',
};

export default function CartPage() {
  return (
    <ProtectedRoute redirectTo="/login?next=/cart">
      <CartView />
    </ProtectedRoute>
  );
}
