import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProductCatalogView } from '@/components/products/ProductCatalogView';
import { getCategories } from '@/lib/supabase/catalog';

export const metadata: Metadata = {
  title: 'Wholesale Products Catalogue | Sri Raja Rajeshwara Handloom',
  description:
    'Authentic wholesale textiles supplied at transparent fixed piece rates for retail shops, resellers, and institutions across India. Towels, Lungies, Traditional Cloth, Dhoties, and Shawls.',
  keywords: [
    'wholesale textiles',
    'wholesale cloth merchant',
    'wholesale towels',
    'wholesale lungies',
    'wholesale dhoties',
    'wholesale shawls',
    'traditional cloth wholesale',
    'fixed piece rate',
    'Nizamabad handloom wholesale',
  ],
};

export default async function ProductsPage() {
  const categories = await getCategories();

  return (
    <div className="py-10 sm:py-16 bg-cream/40 min-h-screen">
      <Container size="xl">
        <SectionHeading
          eyebrow="Commercial Textile Inventory"
          title="Wholesale Products Catalogue"
          subtitle="Fixed wholesale rates per piece across all 12 textile categories. Transparent pricing with no tier barriers or bulk discounts — order any quantity needed for your business."
        />

        <Suspense
          fallback={
            <div className="space-y-6 animate-pulse">
              <div className="h-28 bg-surface rounded-xl border border-border" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-72 bg-surface rounded-xl border border-border" />
                ))}
              </div>
            </div>
          }
        >
          <ProductCatalogView categories={categories} />
        </Suspense>
      </Container>
    </div>
  );
}
