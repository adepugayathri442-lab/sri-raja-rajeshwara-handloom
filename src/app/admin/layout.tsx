import React from 'react';
import type { Metadata } from 'next';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'Merchant Admin Portal | Sri Raja Rajeshwara Handloom',
  description: 'Wholesale B2B management dashboard for products, stock, orders, and delivery charges.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
