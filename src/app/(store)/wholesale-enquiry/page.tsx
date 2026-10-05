import React from 'react';
import type { Metadata } from 'next';
import { MessageCircle, ShieldCheck, CheckCircle2, Truck } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { WholesaleEnquiryForm } from '@/components/forms/WholesaleEnquiryForm';
import { getGeneralEnquiryUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Wholesale Bulk Enquiry | Sri Raja Rajeshwara Handloom',
  description:
    'Submit wholesale textile inquiries for retail shops, resellers, institutions, and bulk buyers across India. Fixed piece rates and dependable transport dispatch.',
};

export default function WholesaleEnquiryPage() {
  const whatsappHref = getGeneralEnquiryUrl('I would like to submit a wholesale textile enquiry for my business.');

  return (
    <div className="py-12 sm:py-16 bg-cream/40 min-h-screen">
      <Container size="xl">
        <SectionHeading
          eyebrow="Commercial Textile Desk"
          title="Wholesale Bulk Enquiry"
          subtitle="Send us your store requirements, seasonal inventory needs, or institutional fabric orders. We respond promptly with fixed piece rates and dispatch timelines."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Form Column (7 cols) */}
          <div className="lg:col-span-7">
            <Card variant="default" className="p-6 sm:p-8 border-border bg-surface shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="primary" size="sm">B2B Trade Desk</Badge>
                <Badge variant="accent" size="sm">Fixed Piece Rate Guarantee</Badge>
              </div>

              <h2 className="text-xl font-serif font-bold text-primary mb-2">
                Merchant Requirement Submission
              </h2>
              <p className="text-xs text-muted mb-6">
                Fill out the form below. Once Supabase integration is activated in Phase 2, submissions will instantly store into <code className="bg-surface-subtle px-1 py-0.5 rounded font-mono text-charcoal">public.wholesale_enquiries</code>.
              </p>

              <WholesaleEnquiryForm />
            </Card>
          </div>

          {/* Quick WhatsApp & Direct Help Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card variant="accent" className="p-6 bg-surface border-accent/60 shadow-xs">
              <div className="w-10 h-10 rounded-md bg-[#128C7E]/10 text-[#075E54] flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <h3 className="font-serif font-bold text-primary text-lg mb-1">
                Prefer WhatsApp Communication?
              </h3>
              <p className="text-xs text-muted leading-relaxed mb-4">
                You can directly connect with our wholesale merchant team on WhatsApp to request piece photos, check instant stock availability, and receive proforma quotes.
              </p>

              <Button
                href={whatsappHref}
                isExternal={true}
                variant="whatsapp"
                size="md"
                fullWidth
                leftIcon={<MessageCircle className="w-4 h-4 fill-current" />}
              >
                Chat on WhatsApp Now
              </Button>
            </Card>

            <Card variant="subtle" className="p-6 border-border bg-surface-subtle/50 space-y-4">
              <h3 className="font-serif font-bold text-primary text-base">
                Our Wholesale Trading Commitments
              </h3>

              <div className="space-y-3 text-xs text-charcoal">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Single fixed rate per piece regardless of order size.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Doorstep parcel or transport godown delivery across India.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>100% wholesale supply — no retail customer sales.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
