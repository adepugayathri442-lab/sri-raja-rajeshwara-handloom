import React from 'react';
import type { Metadata } from 'next';
import { getCategories } from '@/lib/supabase/catalog';
import { AdminProductList } from '@/components/admin/AdminProductList';

export const metadata: Metadata = {
  title: 'Products Management | Admin Portal',
  description: 'Manage Sri Raja Rajeshwara Handloom wholesale products, piece rates, stock, and photography.',
};

export default async function AdminProductsPage() {
  const categories = await getCategories();

  return <AdminProductList categories={categories} />;
}
