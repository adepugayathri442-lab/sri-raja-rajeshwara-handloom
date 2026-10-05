import React from 'react';
import type { Metadata } from 'next';
import { XCircle, Clock, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';

export const metadata: Metadata = {
  title: 'Order Cancellation Policy | Sri Raja Rajeshwara Handloom',
  description: 'Cancellation terms and procedures for wholesale textile orders prior to transport dispatch.',
};

export default function CancellationPolicyPage() {
  return (
    <div className="py-12 sm:py-20 bg-cream/40 min-h-screen">
      <Container size="lg">
        <SectionHeading
          eyebrow="Merchant Terms"
          title="Wholesale Order Cancellation Policy"
          subtitle="Procedures for order adjustments and cancellations before shipment bailing and transport dispatch."
        />

        <Card variant="default" className="p-8 sm:p-12 border-border bg-surface shadow-xs space-y-8 text-charcoal text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              1. Cancellation Prior to Bale Packing & Dispatch
            </h2>
            <p>
              Wholesale buyers may cancel or modify their order without penalty provided the request is submitted to our merchant sales desk <strong>before the consignment has been packed, stitched into bales, and booked with transport carriers</strong> (typically within 12 hours of order confirmation).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <XCircle className="w-5 h-5 text-accent" />
              2. Consignments Already Dispatched
            </h2>
            <p>
              Once a shipment has been handed over to the transport agency and a Lorry Receipt (LR / Bilti) has been generated, the consignment cannot be cancelled in transit. The merchant is required to accept delivery at destination as billed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              3. Refund & Credit Note Processing
            </h2>
            <p>
              Eligible pre-dispatch cancellations paid via online gateway will be refunded to the original payment source within 5 to 7 banking days. Alternatively, amounts can be credited toward subsequent wholesale orders upon merchant request.
            </p>
          </section>
        </Card>
      </Container>
    </div>
  );
}
