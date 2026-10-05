import React from 'react';
import type { Metadata } from 'next';
import { CustomerOrderDetailView } from '@/components/account/CustomerOrderDetailView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order #${id} Consignment | Sri Raja Rajeshwara Handloom`,
    description: `Track wholesale consignment details and dispatch status for order #${id}.`,
  };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerOrderDetailView orderId={id} />;
}
