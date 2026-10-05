import React from 'react';
import type { Metadata } from 'next';
import { AdminCustomerList } from '@/components/admin/AdminCustomerList';

export const metadata: Metadata = {
  title: 'Merchant Buyers & Retailers | Admin Portal',
  description: 'View registered cloth stores, verify trade details, and inspect historical wholesale purchase volumes.',
};

export default function AdminCustomersPage() {
  return <AdminCustomerList />;
}
