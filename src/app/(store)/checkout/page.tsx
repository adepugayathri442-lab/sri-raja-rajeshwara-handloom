import React from 'react';
import type { Metadata } from 'next';
import { CheckoutPlaceholder } from '@/components/checkout/CheckoutPlaceholder';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Wholesale Checkout & Confirmation | Sri Raja Rajeshwara Handloom',
  description: 'Confirm your wholesale dispatch order via online payment or direct WhatsApp confirmation.',
};

export default function CheckoutPage() {
  return (
    <ProtectedRoute redirectTo="/login?next=/checkout">
      <CheckoutPlaceholder />
    </ProtectedRoute>
  );
}
