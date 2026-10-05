import React from 'react';
import type { Metadata } from 'next';
import { AdminOrderList } from '@/components/admin/AdminOrderList';

export const metadata: Metadata = {
  title: 'Wholesale Orders Management | Admin Portal',
  description: 'Manage Sri Raja Rajeshwara Handloom customer orders, dispatch status, and consignments.',
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  return <AdminOrderList initialStatus={resolvedParams.status} />;
}
