import React from 'react';
import type { Metadata } from 'next';
import { getCategories, getProducts } from '@/lib/supabase/catalog';
import { getAllCatalogueItems } from '@/lib/supabase/image-catalogue';
import { HomeProductCatalogue } from '@/components/home/HomeProductCatalogue';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Sri Raja Rajeshwara Handloom | Wholesale Cloth Merchant',
  description:
    'Authentic wholesale textiles supplied to retail shops, resellers, and bulk buyers across India. Fixed piece rates for Towels, Lungies, Traditional Cloth, Dhoties, and Shawls.',
};

export default async function HomePage() {
  // Concurrently fetch real database categories, image catalogue items, and normal products
  const [categories, catalogueItems, { products }] = await Promise.all([
    getCategories(),
    getAllCatalogueItems(),
    getProducts({ limit: 100, sortBy: 'newest' }),
  ]);

  return (
    <div className="min-h-screen bg-cream/30">
      <HomeProductCatalogue
        categories={categories}
        catalogueItems={catalogueItems}
        products={products}
      />
    </div>
  );
}
