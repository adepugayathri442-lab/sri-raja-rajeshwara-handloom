import React from 'react';
import type { Metadata } from 'next';
import { Truck, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Wholesale Shipping & Logistics Policy | Sri Raja Rajeshwara Handloom',
  description: 'Pan-India transport parcel dispatch, delivery timelines, and freight booking guidelines for wholesale textile buyers.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="py-12 sm:py-20 bg-cream/40 min-h-screen">
      <Container size="lg">
        <SectionHeading
          eyebrow="Logistics & Dispatch"
          title="Wholesale Shipping & Transport Policy"
          subtitle="Clear dispatch, transport bilti booking, and delivery guidelines for retail shops and institutional buyers across India."
        />

        <Card variant="default" className="p-8 sm:p-12 border-border bg-surface shadow-xs space-y-8 text-charcoal text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <Truck className="w-5 h-5 text-accent" />
              1. Pan-India Wholesale Delivery Scope
            </h2>
            <p>
              {siteConfig.name} supplies and dispatches wholesale textiles across all states and union territories in India. Depending on destination and shipment weight/volume, consignments are dispatched via commercial regional transport services (such as VRL, Navata, Kranti, TCI, ARC, etc.), private parcel booking services, or speed couriers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              2. Order Processing & Dispatch Timelines
            </h2>
            <p>
              Standard wholesale inventory orders are packed, bale-stitched, and booked with transport partners within <strong>24 to 48 business hours</strong> following payment confirmation or formal WhatsApp order acceptance.
            </p>
            <p>
              Expected transit durations vary by state:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted">
              <li>South India (Telangana, AP, Karnataka, Tamil Nadu, Kerala): 2 - 4 business days</li>
              <li>West & Central India (Maharashtra, Gujarat, MP): 3 - 6 business days</li>
              <li>North & East India (Delhi, UP, Rajasthan, Bihar, Bengal, Odisha): 4 - 8 business days</li>
              <li>North-East and Remote Hill Districts: 7 - 12 business days</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              3. Transport Bilti (LR Slip) & Consignment Tracking
            </h2>
            <p>
              Immediately upon booking at the transport godown, a high-resolution photograph or digital copy of the <strong>Lorry Receipt (LR / Bilti)</strong> containing the consignment number, destination branch, parcel count, and weight will be shared with the merchant via WhatsApp or email.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              4. Freight Charges & Delivery Points
            </h2>
            <p>
              Freight can be pre-billed at checkout or booked under &quot;Freight To-Pay&quot; (paid by buyer directly to transport office upon arrival), depending on the agreed terms during order placement. Buyers are responsible for picking up bales from destination transport godowns or arranging local door delivery.
            </p>
          </section>
        </Card>
      </Container>
    </div>
  );
}
