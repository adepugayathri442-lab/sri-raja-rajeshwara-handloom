import React from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { CategoryList } from '@/components/categories/CategoryList';
import { CategoryNavigation } from '@/components/categories/CategoryNavigation';

export const metadata: Metadata = {
  title: 'Wholesale Categories | Sri Raja Rajeshwara Handloom',
  description:
    'Explore our 5 core wholesale categories: Towels, Lungies, Traditional Cloth, Dhoties, and Shawls. Supplied to retail cloth merchants across India.',
};

export default function CategoriesPage() {
  return (
    <div className="py-12 sm:py-16 bg-cream/40 min-h-screen">
      <Container size="xl">
        <SectionHeading
          eyebrow="Core Classifications"
          title="Wholesale Textile Categories"
          subtitle="Explore the 5 core categories of traditional handloom and powerloom products supplied at fixed piece rates to businesses and institutions across India."
        />

        <div className="mb-10">
          <CategoryNavigation activeSlug="all" />
        </div>

        <CategoryList />
      </Container>
    </div>
  );
}
