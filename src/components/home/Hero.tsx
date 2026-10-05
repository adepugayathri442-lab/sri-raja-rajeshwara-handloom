import React from 'react';
import { ArrowRight, MessageCircle, ShieldCheck, Check, Layers, Truck } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Container } from '@/components/common/Container';
import { getGeneralEnquiryUrl } from '@/lib/whatsapp';
import { businessConfig } from '@/config/business';

export function Hero() {
  const whatsappHref = getGeneralEnquiryUrl();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream via-surface to-cream border-b border-border py-16 sm:py-20 lg:py-24">
      {/* Decorative Traditional Accent Weave Elements */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <Container size="xl" className="relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow / Tag */}
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge variant="accent" size="md">
              100% Wholesale Cloth Merchant • Nizamabad
            </Badge>
          </div>

          {/* Prominent Brand Name */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-primary tracking-tight leading-[1.12] uppercase">
            Sri Raja Rajeshwara <span className="text-primary block sm:inline">Handloom</span>
          </h1>

          {/* Secondary Tagline */}
          <p className="mt-3 text-sm sm:text-base md:text-lg text-charcoal/80 font-medium tracking-wide">
            Traditional Textiles. Wholesale Prices. Trusted Supply.
          </p>

          {/* Gold flourish divider */}
          <div className="my-5 flex items-center justify-center gap-2">
            <span className="h-0.5 w-16 bg-accent" />
            <span className="w-2 h-2 rotate-45 bg-primary" />
            <span className="h-0.5 w-16 bg-accent" />
          </div>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg md:text-xl text-muted leading-relaxed max-w-2xl mx-auto font-normal">
            Quality traditional textiles supplied to shops, businesses and bulk buyers at wholesale prices.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <Button
              href="/products"
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-md"
            >
              Explore Wholesale Products
            </Button>

            <Button
              href={whatsappHref}
              isExternal
              variant="whatsapp"
              size="lg"
              leftIcon={<MessageCircle className="w-5 h-5 fill-current" />}
              className="w-full sm:w-auto"
            >
              WhatsApp Bulk Enquiry ({businessConfig.contact.formattedPhone})
            </Button>
          </div>

          {/* Trust Highlights Checklist */}
          <div className="mt-12 pt-8 border-t border-border/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-charcoal">
            <div className="flex items-center justify-center gap-1.5 p-2 bg-surface rounded-md border border-border/60 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Wholesale Only</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 p-2 bg-surface rounded-md border border-border/60 shadow-2xs">
              <Check className="w-4 h-4 text-accent shrink-0" />
              <span>Fixed Piece Rates</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 p-2 bg-surface rounded-md border border-border/60 shadow-2xs">
              <Layers className="w-4 h-4 text-primary shrink-0" />
              <span>Any Quantity Order</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 p-2 bg-surface rounded-md border border-border/60 shadow-2xs">
              <Truck className="w-4 h-4 text-accent shrink-0" />
              <span>Pan-India Delivery</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
