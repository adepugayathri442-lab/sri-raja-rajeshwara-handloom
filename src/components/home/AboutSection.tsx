import React from 'react';
import { CheckCircle2, ArrowRight, Award, Compass, HeartHandshake } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Button } from '@/components/common/Button';
import { businessConfig } from '@/config/business';

export function AboutSection() {
  return (
    <section className="py-16 sm:py-24 bg-cream border-b border-border">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Visual/Textile Heritage Narrative Block (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 sm:p-10 rounded-2xl bg-primary text-white border border-accent/40 shadow-md relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent/15 rounded-full blur-2xl" />
              
              <span className="text-xs font-semibold uppercase tracking-widest text-accent block mb-2">
                Merchant Heritage & Commitment
              </span>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight mb-4">
                SRI RAJA RAJESHWARA
                <span className="block text-sm font-sans font-medium text-white/70 mt-1 uppercase tracking-wider">
                  Handloom Wholesale Cloth Merchant
                </span>
              </h3>

              <div className="h-0.5 w-16 bg-accent mb-6" />

              <p className="text-sm text-white/85 leading-relaxed">
                &ldquo;{businessConfig.tagline}&rdquo;
              </p>

              <div className="mt-8 pt-6 border-t border-white/20 space-y-3 text-xs text-white/80">
                <div className="flex items-center gap-2.5">
                  <HeartHandshake className="w-4 h-4 text-accent shrink-0" />
                  <span>Direct weaver & master-loom partnerships</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-accent shrink-0" />
                  <span>Strict quality inspection before dispatch</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-accent shrink-0" />
                  <span>Reliable supply network across all Indian states</span>
                </div>
              </div>
            </div>
          </div>

          {/* Business Details & Mission (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <SectionHeading
              eyebrow="About Our Business"
              title="Dedicated to Wholesale Cloth Merchants & Bulk Buyers"
              subtitle="We bridge the gap between traditional weaving centers and commercial cloth retailers with honest wholesale piece rates and uncompromised fabric quality."
              align="left"
              className="mb-6 sm:mb-8"
            />

            <div className="space-y-4 text-sm sm:text-base text-muted leading-relaxed">
              <p>
                <strong className="text-charcoal font-semibold">{businessConfig.name}</strong> is established with a singular, unyielding focus: to deliver genuine, high-utility traditional textiles directly to businesses at wholesale prices without intermediate retail markups.
              </p>

              <p>
                Unlike conventional retail stores or flashy multi-brand portals, our operational structure is built specifically for trade clients. We supply retail cloth shops, regional wholesalers, garment resellers, temple trusts, and charitable institutions who require dependable, repeatable fabric quality.
              </p>

              <p>
                Our core philosophy centers on <strong className="text-charcoal font-semibold">One Fixed Wholesale Rate Per Piece</strong> with the flexibility for customers to order any quantity that matches their business cash flow and shelf turnover.
              </p>
            </div>

            {/* Core Values Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-charcoal/90">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Zero retail conflict — we never undercut our retail partners</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-charcoal/90">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Transparent billing with full GST compliance</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-charcoal/90">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Dedicated bales & protective transport packing</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-charcoal/90">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Personal merchant assistance for custom orders</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Button
                href="/about"
                variant="outline"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Learn More About Our Business
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
