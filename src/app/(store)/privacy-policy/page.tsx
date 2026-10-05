import React from 'react';
import type { Metadata } from 'next';
import { Lock, ShieldCheck, Database } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy & Data Protection Policy | Sri Raja Rajeshwara Handloom',
  description: 'How we safeguard business registration data, GST details, and merchant contact information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 sm:py-20 bg-cream/40 min-h-screen">
      <Container size="lg">
        <SectionHeading
          eyebrow="Data Stewardship"
          title="Merchant Privacy & Data Protection"
          subtitle="Commitment to protecting commercial trade information, contact numbers, and transaction records."
        />

        <Card variant="default" className="p-8 sm:p-12 border-border bg-surface shadow-xs space-y-8 text-charcoal text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              1. Information We Collect
            </h2>
            <p>
              In operating our B2B wholesale textile portal, {siteConfig.name} collects business contact details (proprietor name, shop name, phone number, WhatsApp contact), billing addresses, delivery godown locations, and GST identification numbers strictly for trade verification, tax invoicing, and logistics.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent" />
              2. Commercial Confidentiality
            </h2>
            <p>
              We treat all client pricing, order volumes, and buyer details as strictly confidential commercial information. We do not sell, rent, or publicly disclose our retail shopkeeper directory or trade volume records to third-party marketing brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <Database className="w-5 h-5 text-accent" />
              3. Data Security & Storage
            </h2>
            <p>
              Merchant accounts and order records are stored within secure database environments implementing Row-Level Security (RLS) and encrypted transport protocols (HTTPS/TLS). Access to commercial customer data is restricted to authorized order management personnel.
            </p>
          </section>
        </Card>
      </Container>
    </div>
  );
}
