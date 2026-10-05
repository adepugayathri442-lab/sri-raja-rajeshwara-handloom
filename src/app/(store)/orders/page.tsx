import React from 'react';
import type { Metadata } from 'next';
import { CustomerOrderList } from '@/components/account/CustomerOrderList';

export const metadata: Metadata = {
  title: 'My Wholesale Orders | Sri Raja Rajeshwara Handloom',
  description: 'Track ongoing textile dispatches, view consignment bilti slips, and download invoices.',
};

export default function OrdersPage() {
  return <CustomerOrderList />;
}
