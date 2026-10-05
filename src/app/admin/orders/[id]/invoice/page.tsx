import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getAdminOrderById } from '@/lib/supabase/admin-operations';
import { OrderInvoiceView } from '@/components/admin/OrderInvoiceView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Invoice #${id} | Sri Raja Rajeshwara Handloom`,
    description: 'Wholesale B2B Commercial Tax Invoice and Consignment Bill.',
  };
}

export default async function AdminOrderInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sParams = await searchParams;
  const action = typeof sParams?.action === 'string' ? sParams.action : undefined;

  const order = await getAdminOrderById(id);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="p-8 bg-surface rounded-xl border border-border shadow-xs space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h1 className="text-xl font-serif font-bold text-primary">Wholesale Order Not Found</h1>
          <p className="text-xs text-muted leading-relaxed">
            Could not retrieve invoice details for order identifier &ldquo;{id}&rdquo;. Please verify that the order exists in the database.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-hover"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Orders</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <OrderInvoiceView order={order} autoPrint={action === 'print'} />;
}
