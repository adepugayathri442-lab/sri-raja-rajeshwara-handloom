import React from 'react';
import type { Metadata } from 'next';
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';

export const metadata: Metadata = {
  title: 'Wholesale Return & Replacement Policy | Sri Raja Rajeshwara Handloom',
  description: 'Guidelines on returns, replacements, and defect claims for wholesale textile shipments.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="py-12 sm:py-20 bg-cream/40 min-h-screen">
      <Container size="lg">
        <SectionHeading
          eyebrow="Commercial Assurance"
          title="Wholesale Return & Replacement Policy"
          subtitle="Honest, fair trade terms governing manufacturing defects, transit discrepancies, and replacements for cloth shopkeepers."
        />

        <Card variant="default" className="p-8 sm:p-12 border-border bg-surface shadow-xs space-y-8 text-charcoal text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              1. 100% Wholesale Trade Policy
            </h2>
            <p>
              As a dedicated wholesale cloth merchant supplying retail stores and institutions at fixed piece rates, our operational margins do not accommodate speculative consumer-style returns. However, we stand 100% behind the quality and weaving integrity of every shipment dispatched.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-accent" />
              2. Eligible Grounds for Replacement or Credit Note
            </h2>
            <p>
              We provide immediate merchant replacements or credit adjustments under the following verified conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-muted">
              <li><strong>Manufacturing Weave Defect:</strong> Major yarn pulls, torn selvages, or pervasive weaving irregularities exceeding normal handloom tolerances.</li>
              <li><strong>Wrong Item Dispatched:</strong> Delivery of an incorrect category, SKU, or cut length differing from invoice specifications.</li>
              <li><strong>Shortage in Bale Count:</strong> Discrepancies between billed piece count and actual unpacked pieces verified upon arrival.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-accent" />
              3. Claim Notice Window
            </h2>
            <p>
              Any defect or shortage claim must be reported to our wholesale sales desk via WhatsApp or email within <strong>48 hours of taking delivery</strong> from the transport office. Please share clear photographs of the bale seal, transport label, and affected pieces to initiate prompt resolution.
            </p>
          </section>
        </Card>
      </Container>
    </div>
  );
}
