import React from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';
import { GoogleMapsButton } from '@/components/common/GoogleMapsButton';
import { businessConfig } from '@/config/business';
import { getGeneralEnquiryUrl } from '@/lib/whatsapp';

export function ContactCtaSection() {
  const whatsappHref = getGeneralEnquiryUrl();

  return (
    <section className="py-16 sm:py-20 bg-surface">
      <Container size="xl">
        <SectionHeading
          eyebrow="Direct Wholesale Desk"
          title="Connect with Our Merchant Team"
          subtitle="We are available during business hours to discuss product specifications, bulk bale requirements, transport routes, and custom trade arrangements."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {/* Phone / Call Desk */}
          <Card variant="subtle" className="p-6 flex flex-col justify-between border-border bg-cream/40">
            <div>
              <div className="w-10 h-10 rounded-md bg-primary-subtle text-primary flex items-center justify-center mb-4">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-primary text-lg mb-1">
                Direct Merchant Phone
              </h3>
              <p className="text-xs text-muted mb-4">
                Call our wholesale sales desk for order bookings and piece rate confirmations.
              </p>
              <div className="p-3 bg-surface rounded border border-border/80 text-xs">
                <span className="block text-[10px] uppercase font-semibold text-muted mb-1">
                  Telephone Contact:
                </span>
                <a
                  href={`tel:${businessConfig.contact.phone}`}
                  className="text-sm font-semibold text-primary hover:text-accent transition-colors block"
                >
                  {businessConfig.contact.formattedPhone}
                </a>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border/60 text-xs text-muted flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>{businessConfig.contact.workingHours}</span>
            </div>
          </Card>

          {/* WhatsApp Direct Inquiry */}
          <Card variant="accent" className="p-6 flex flex-col justify-between border-accent/60 bg-surface">
            <div>
              <div className="w-10 h-10 rounded-md bg-[#128C7E]/10 text-[#075E54] flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <h3 className="font-serif font-bold text-primary text-lg mb-1">
                WhatsApp Business Chat
              </h3>
              <p className="text-xs text-muted mb-4">
                Send catalog inquiries, sample photos, and dispatch queries instantly.
              </p>
              <div className="p-3 bg-surface-subtle rounded border border-border/80 text-xs">
                <span className="block text-[10px] uppercase font-semibold text-muted mb-1">
                  WhatsApp Number:
                </span>
                <span className="text-sm font-semibold text-[#075E54] block">
                  {businessConfig.contact.formattedPhone}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border/60">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-[#128C7E] hover:bg-[#075E54] text-white rounded text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Start WhatsApp Chat ({businessConfig.contact.formattedPhone})</span>
              </a>
            </div>
          </Card>

          {/* Business Address & Logistics */}
          <Card variant="subtle" className="p-6 flex flex-col justify-between border-border bg-cream/40">
            <div>
              <div className="w-10 h-10 rounded-md bg-primary-subtle text-primary flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-primary text-lg mb-1">
                Merchant Location & Godown
              </h3>
              <p className="text-xs text-muted mb-4">
                Commercial textile trade center for dispatch and wholesale billing.
              </p>
              <div className="p-3 bg-surface rounded border border-border/80 text-xs space-y-1.5">
                <span className="block text-[10px] uppercase font-semibold text-muted">
                  Address in Nizamabad:
                </span>
                <p className="text-charcoal font-medium text-xs leading-relaxed">
                  {businessConfig.contact.fullAddress}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border/60 flex items-center justify-between">
              <GoogleMapsButton variant="link" size="sm" showIcon={false} />
              <Link
                href="/contact"
                className="text-xs font-semibold text-primary hover:text-accent flex items-center gap-1 transition-colors"
              >
                <span>Full Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
