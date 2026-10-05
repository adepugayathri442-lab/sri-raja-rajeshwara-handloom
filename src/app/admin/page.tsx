import React from 'react';
import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Sri Raja Rajeshwara Handloom',
  description: 'Merchant dashboard for managing wholesale catalogue, stock levels, and product images.',
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
