import React from 'react';
import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { HomeBannerSlider } from '@/components/home/HomeBannerSlider';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { WholesaleCtaSection } from '@/components/home/WholesaleCtaSection';
import { AboutSection } from '@/components/home/AboutSection';
import { ContactCtaSection } from '@/components/home/ContactCtaSection';

export const metadata: Metadata = {
  title: 'Sri Raja Rajeshwara Handloom | Wholesale Cloth Merchant',
  description:
    'Authentic wholesale textiles supplied to retail shops, resellers, and bulk buyers across India. Fixed piece rates for Towels, Lungies, Traditional Cloth, Dhoties, and Shawls.',
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Amazon-style Homepage Banner Carousel */}
      <HomeBannerSlider />

      {/* 3. Product Categories */}
      <CategoryGrid />

      {/* 3. Featured Products Placeholder */}
      <FeaturedProductsSection />

      {/* 4. Why Choose Us */}
      <WhyChooseUs />

      {/* 5. Wholesale Enquiry CTA */}
      <WholesaleCtaSection />

      {/* 6. About Business */}
      <AboutSection />

      {/* 7. Contact CTA */}
      <ContactCtaSection />
    </div>
  );
}
