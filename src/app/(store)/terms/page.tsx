import React from 'react';
import type { Metadata } from 'next';
import { FileText, ShieldCheck, Scale, Check } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Wholesale Terms of Trade | Sri Raja Rajeshwara Handloom',
  description: 'Commercial terms of trade, billing conditions, and merchant supply agreements for wholesale buyers.',
};

export default function TermsPage() {
  return (
    <div className="py-12 sm:py-20 bg-cream/40 min-h-screen">
      <Container size="lg">
        <SectionHeading
          eyebrow="Commercial Agreement"
          title="Wholesale Terms of Trade"
          subtitle="Commercial guidelines governing wholesale textile purchases, piece rate billing, and delivery agreements."
        />

        <Card variant="default" className="p-8 sm:p-12 border-border bg-surface shadow-xs space-y-8 text-charcoal text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <Scale className="w-5 h-5 text-accent" />
              1. Wholesale Nature of Transactions
            </h2>
            <p>
              All purchases conducted through {siteConfig.name} are commercial wholesale transactions intended for resale, institutional distribution, or commercial utility. Consumers seeking individual retail purchases are advised that retail trade warranties do not apply.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <Check className="w-5 h-5 text-accent" />
              2. Fixed Piece Rate Pricing Model
            </h2>
            <p>
              In accordance with our core wholesale principle, products are priced at a <strong>single fixed rate per piece</strong>. Prices displayed on our wholesale portal are exclusive of applicable Goods and Services Tax (GST) and transport freight, which are computed and itemized transparently upon proforma invoicing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              3. Payment Terms & Settlement
            </h2>
            <p>
              Orders must be confirmed through verified payment channels (Online Gateway, Bank NEFT/RTGS, or verified WhatsApp payment) prior to consignment release from our central dispatch godown. We do not extend unsecured credit to unverified first-time accounts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              4. Handloom & Traditional Weave Nature
            </h2>
            <p>
              Traditional handloom and semi-mechanized textiles may exhibit subtle organic variations in yarn slubs, border tension, and dye uptake. These nuances represent the authentic hallmark of artisan Indian weaving and are not classified as defects.
            </p>
          </section>
        </Card>
      </Container>
    </div>
  );
}
