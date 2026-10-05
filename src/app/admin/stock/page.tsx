import React from 'react';
import type { Metadata } from 'next';
import { AdminStockView } from '@/components/admin/AdminStockView';

export const metadata: Metadata = {
  title: 'Stock & Inventory Control | Admin Portal',
  description: 'Track live piece balances, manage low stock thresholds, and update product inventory.',
};

export default function AdminStockPage() {
  return <AdminStockView />;
}
