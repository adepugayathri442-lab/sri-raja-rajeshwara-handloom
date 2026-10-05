import React from 'react';
import type { Metadata } from 'next';
import { ShieldCheck, Award, Compass } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { siteConfig } from '@/config/site';
import { businessConfig } from '@/config/business';

export const metadata: Metadata = {
  title: 'About Our Wholesale Business | Sri Raja Rajeshwara Handloom',
  description:
    'Learn about Sri Raja Rajeshwara Handloom Wholesale Cloth Merchant: authentic traditional textiles, fixed piece rates, and dependable supply to retail shops across India.',
};

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-20 bg-cream/30 min-h-screen">
      <Container size="xl">
        <SectionHeading
          eyebrow="Merchant Profile"
          title="About Sri Raja Rajeshwara Handloom"
          subtitle="A dedicated B2B wholesale cloth merchant bridging traditional textile looms and commercial retailers across India with complete pricing transparency."
        />

        {/* Narrative Grid */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Main Heritage Card */}
          <Card variant="default" className="p-8 sm:p-12 border-border bg-surface shadow-xs">
            <div className="inline-flex items-center gap-2 mb-3">
              <Badge variant="primary" size="sm">Wholesale Cloth Merchant</Badge>
              <Badge variant="accent" size="sm">Pan-India Supply</Badge>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary mb-4">
              &ldquo;{businessConfig.tagline}&rdquo;
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-muted leading-relaxed">
              <p>
                <strong className="text-charcoal font-semibold">{siteConfig.name}</strong> operates as a wholesale merchant dedicated to the distribution of traditional Indian cotton and handloom textiles. We specialize in supplying core utility and ceremonial staples: high-absorbency towels, quality daily lungies, sacred and unstitched traditional cloth, ceremonial dhoties, and felicitation shawls.
              </p>

              <p>
                Unlike retail fashion boutiques or multi-tier distributor chains, our entire merchant infrastructure is designed specifically for commercial trade buyers. We work directly with retail cloth store proprietors, village garment merchants, regional textile distributors, temple administration offices, and corporate institutional buyers.
              </p>
            </div>
          </Card>

          {/* Pillars of our Wholesale Model */}
          <div>
            <h2 className="text-xl font-serif font-bold text-primary text-center mb-6">
              Our Core Wholesale Business Pillars
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="subtle" className="p-6 border-border bg-surface flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-md bg-primary-subtle text-primary flex items-center justify-center mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-primary text-base mb-2">
                    100% Wholesale Focus
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    We never sell retail to the public or compete with our shopkeeper customers. Our loyalty remains strictly with trade partners.
                  </p>
                </div>
              </Card>

              <Card variant="subtle" className="p-6 border-border bg-surface flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-md bg-accent/20 text-accent-hover flex items-center justify-center mb-4">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-primary text-base mb-2">
                    Fixed Piece Rates
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Every SKU has a single fixed wholesale rate per piece. Shopkeepers can order 10 pieces or 500 pieces at the exact same transparent wholesale rate.
                  </p>
                </div>
              </Card>

              <Card variant="subtle" className="p-6 border-border bg-surface flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-md bg-primary-subtle text-primary flex items-center justify-center mb-4">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-primary text-base mb-2">
                    Pan-India Logistics
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Well-established transport partnerships ensure secure bale dispatch, parcel booking, and doorstep logistics to every state and town across India.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Action Banner */}
          <div className="p-8 rounded-xl bg-primary text-white text-center space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Partner with Sri Raja Rajeshwara Handloom Today
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto">
              Strengthen your shop inventory with dependable traditional textiles sourced at honest merchant rates.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button href="/wholesale-enquiry" variant="accent" size="md">
                Submit Wholesale Enquiry
              </Button>
              <Button href="/products" variant="secondary" size="md">
                Browse Wholesale Catalogue
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
