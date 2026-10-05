import React from 'react';
import type { Metadata } from 'next';
import { getCategories } from '@/lib/supabase/catalog';
import { ProductForm } from '@/components/admin/ProductForm';

export const metadata: Metadata = {
  title: 'Add Wholesale Product | Admin Portal',
  description: 'Create a new wholesale product entry with SKU, fixed piece rate, stock, and photography.',
};

export default async function NewProductPage() {
  const categories = await getCategories();

  return <ProductForm categories={categories} isEdit={false} />;
}
