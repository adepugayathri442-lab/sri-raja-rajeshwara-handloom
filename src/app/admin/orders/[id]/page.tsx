import React from 'react';
import type { Metadata } from 'next';
import { AdminOrderDetailView } from '@/components/admin/AdminOrderDetailView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order #${id} Operations | Admin Portal`,
    description: 'Inspect wholesale order line items, verify delivery consignments, and update dispatch status.',
  };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminOrderDetailView orderId={id} />;
}
