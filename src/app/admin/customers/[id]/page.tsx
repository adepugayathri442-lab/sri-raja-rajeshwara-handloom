import React from 'react';
import type { Metadata } from 'next';
import { AdminCustomerDetailView } from '@/components/admin/AdminCustomerDetailView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Merchant Customer #${id} | Admin Portal`,
    description: 'Inspect merchant credentials, registered shop address, and historical wholesale order records.',
  };
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminCustomerDetailView customerId={id} />;
}
