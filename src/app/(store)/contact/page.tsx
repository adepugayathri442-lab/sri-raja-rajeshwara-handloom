import React from 'react';
import type { Metadata } from 'next';
import { Phone, MessageCircle, MapPin, Clock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GoogleMapsButton } from '@/components/common/GoogleMapsButton';
import { businessConfig } from '@/config/business';
import { getGeneralEnquiryUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Merchant Contact & Trade Desk | Sri Raja Rajeshwara Handloom',
  description:
    'Official contact details, wholesale sales desk, Nizamabad merchant facility, and WhatsApp communication for Sri Raja Rajeshwara Handloom.',
};

export default function ContactPage() {
  const whatsappHref = getGeneralEnquiryUrl();

  return (
    <div className="py-12 sm:py-20 bg-cream/40 min-h-screen">
      <Container size="xl">
        <SectionHeading
          eyebrow="Merchant Communication"
          title="Wholesale Sales & Dispatch Desk"
          subtitle="Connect directly with Sri Raja Rajeshwara Handloom for wholesale piece rates, stock availability, transport bilti queries, or custom bale requirements."
        />

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Contact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Support */}
            <Card variant="default" className="p-6 sm:p-8 border-border bg-surface shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary-subtle text-primary flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-primary text-lg">
                    Direct Phone Support
                  </h2>
                  <p className="text-xs text-muted">
                    Speak directly with our wholesale merchant desk
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface-subtle rounded-md border border-border text-xs space-y-1">
                <span className="block text-muted text-[10px] uppercase font-semibold">
                  Official Phone:
                </span>
                <a
                  href={`tel:${businessConfig.contact.phone}`}
                  className="text-base font-semibold text-primary hover:text-accent transition-colors block"
                >
                  {businessConfig.contact.formattedPhone}
                </a>
                <p className="text-[11px] text-muted">Primary helpline for order bookings & inquiries</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted pt-1">
                <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>{businessConfig.contact.workingHours}</span>
              </div>
            </Card>

            {/* WhatsApp Business */}
            <Card variant="accent" className="p-6 sm:p-8 border-accent/60 bg-surface shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#128C7E]/10 text-[#075E54] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-primary text-lg">
                    WhatsApp Bulk Desk
                  </h2>
                  <p className="text-xs text-muted">
                    Instant price verification & parcel bilti sharing
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#128C7E]/5 rounded-md border border-[#128C7E]/20 text-xs space-y-1">
                <span className="block text-muted text-[10px] uppercase font-semibold">
                  WhatsApp Number:
                </span>
                <span className="text-base font-semibold text-[#075E54] block">
                  {businessConfig.contact.formattedPhone}
                </span>
                <p className="text-[11px] text-muted">Direct messaging channel for swift trade confirmations</p>
              </div>

              <div>
                <Button
                  href={whatsappHref}
                  isExternal
                  variant="whatsapp"
                  size="md"
                  fullWidth
                  leftIcon={<MessageCircle className="w-4 h-4 fill-current" />}
                >
                  Message on WhatsApp ({businessConfig.contact.formattedPhone})
                </Button>
              </div>
            </Card>

            {/* Registered Address */}
            <Card variant="default" className="p-6 sm:p-8 border-border bg-surface shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary-subtle text-primary flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-primary text-lg">
                    Registered Trade Address
                  </h2>
                  <p className="text-xs text-muted">
                    Merchant shop & wholesale dispatch facility
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface-subtle rounded-md border border-border text-xs space-y-2">
                <div>
                  <span className="block text-muted text-[10px] uppercase font-semibold mb-0.5">
                    Full Address:
                  </span>
                  <p className="text-charcoal font-medium leading-relaxed">
                    {businessConfig.contact.fullAddress}
                  </p>
                </div>
                <div className="pt-1 flex items-center justify-between text-[11px] text-muted border-t border-border/60">
                  <span>PIN: <strong className="text-charcoal font-mono">{businessConfig.contact.pincode}</strong></span>
                  <span>Plus Code: <strong className="text-primary font-mono">{businessConfig.contact.googleMapsPlusCode}</strong></span>
                </div>
              </div>

              <div className="pt-1">
                <GoogleMapsButton variant="button" size="sm" className="w-full" showDirectionsText />
              </div>
            </Card>

            {/* Email & Trade Desk */}
            <Card variant="default" className="p-6 sm:p-8 border-border bg-surface shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary-subtle text-primary flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-primary text-lg">
                    Email Communication
                  </h2>
                  <p className="text-xs text-muted">
                    Formal wholesale tenders & institutional inquiries
                  </p>
                </div>
              </div>

              <div className="p-4 bg-surface-subtle rounded-md border border-border text-xs space-y-2">
                <div>
                  <span className="block text-muted text-[10px] uppercase font-semibold mb-0.5">
                    Official Email:
                  </span>
                  <a
                    href={`mailto:${businessConfig.contact.email}`}
                    className="text-primary font-semibold text-sm hover:text-accent transition-colors break-all"
                  >
                    {businessConfig.contact.email}
                  </a>
                </div>
                <p className="text-[11px] text-muted pt-1">
                  Send purchase orders, transport lists, and institutional RFQs.
                </p>
              </div>

              <div className="pt-1 flex items-center gap-2 text-xs text-charcoal/80">
                <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                <span>100% Wholesale Trade Model</span>
              </div>
            </Card>
          </div>

          {/* Google Maps Location Preview Card */}
          <GoogleMapsButton variant="card" className="shadow-xs" />

          {/* Wholesale Enquiry Referral */}
          <div className="p-6 sm:p-8 rounded-lg bg-surface border border-accent/30 text-center shadow-xs">
            <h3 className="font-serif font-bold text-primary text-lg mb-1">
              Need a Formal Proforma Quote or Custom Bale Packing?
            </h3>
            <p className="text-xs text-muted mb-4 max-w-lg mx-auto leading-relaxed">
              Submit your store specifications, product categories of interest, and volume requirements through our online Wholesale Bulk Enquiry form.
            </p>
            <Button
              href="/wholesale-enquiry"
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Go to Wholesale Enquiry Form
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
