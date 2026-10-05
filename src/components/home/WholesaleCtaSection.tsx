import React from 'react';
import { ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';
import { getGeneralEnquiryUrl } from '@/lib/whatsapp';

export function WholesaleCtaSection() {
  const whatsappHref = getGeneralEnquiryUrl('I would like to request wholesale rates and availability.');

  return (
    <section className="py-16 sm:py-20 bg-primary text-white relative overflow-hidden border-b border-primary-light/40">
      {/* Subtle traditional loom weave motif */}
      <div className="absolute inset-0 opacity-10 bg-textile-pattern pointer-events-none" />

      <Container size="xl" className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-semibold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Direct Wholesale Supply</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Ready to Source Quality Textiles for Your Business?
          </h2>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Whether you operate a retail cloth showroom, supply rural markets, manage temple trust requirements, or purchase for institutional distribution, we provide transparent fixed piece rates and dependable dispatch.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              href="/wholesale-enquiry"
              variant="accent"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Submit Wholesale Enquiry
            </Button>

            <Button
              href={whatsappHref}
              isExternal={true}
              variant="whatsapp"
              size="lg"
              leftIcon={<MessageCircle className="w-5 h-5 fill-current" />}
              className="w-full sm:w-auto"
            >
              WhatsApp Price List Enquiry
            </Button>
          </div>

          <div className="mt-10 pt-6 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>GST Invoicing Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Transport / Parcel Tracking Provided</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>No Forced Quantity Tiers</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
