import React from 'react';
import { ShieldAlert, IndianRupee, Layers, Sparkles, Truck, MessageCircle } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';

interface FeatureCardItem {
  readonly title: string;
  readonly description: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly highlight: string;
}

const WHY_CHOOSE_US_ITEMS: readonly FeatureCardItem[] = [
  {
    title: "Wholesale Only",
    description: "We are strictly wholesale cloth merchants. We do not retail or compete with our shopkeeper partners, ensuring full wholesale integrity.",
    icon: ShieldAlert,
    highlight: "100% B2B Focus",
  },
  {
    title: "Fixed Piece Rates",
    description: "Every item features one transparent wholesale rate per piece. No hidden markups or confusing volume-based sliding scales.",
    icon: IndianRupee,
    highlight: "Uniform Piece Pricing",
  },
  {
    title: "Any Quantity",
    description: "Freedom to order precisely what your business requires. Whether you need a trial batch of 10 pieces or 1,000 pieces, you receive the fixed rate.",
    icon: Layers,
    highlight: "No Minimum Barriers",
  },
  {
    title: "Quality Traditional Textiles",
    description: "Sourced with traditional weaving integrity: authentic towels, comfortable lungies, sacred cloth, dhoties, and ceremonial shawls.",
    icon: Sparkles,
    highlight: "Authentic Loom Weaves",
  },
  {
    title: "Delivery Across India",
    description: "Seamless Pan-India logistics partnerships with leading transport services, parcel carriers, and freight couriers for safe, on-time delivery.",
    icon: Truck,
    highlight: "Pan-India Reach",
  },
  {
    title: "Direct WhatsApp Support",
    description: "Real merchant communication. Confirm orders, check bundle availability, track transport bilti receipts, and receive direct updates via WhatsApp.",
    icon: MessageCircle,
    highlight: "Direct Merchant Access",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-24 bg-surface border-b border-border">
      <Container size="xl">
        <SectionHeading
          eyebrow="The Wholesale Advantage"
          title="Why Cloth Merchants & Bulk Buyers Trust Us"
          subtitle="Built from the ground up for retailers, institutions, and resellers who demand honest wholesale pricing, consistent quality, and dependable supply."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {WHY_CHOOSE_US_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                variant="subtle"
                hoverEffect
                className="p-6 sm:p-7 flex flex-col justify-between border-border hover:border-accent bg-surface-subtle/50 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-lg bg-primary-subtle text-primary flex items-center justify-center border border-primary/20">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-[11px] font-semibold text-accent uppercase tracking-wider bg-accent/10 px-2.5 py-1 rounded">
                      {item.highlight}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-serif font-bold text-primary mb-2.5">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 text-[11px] font-semibold text-primary/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Sri Raja Rajeshwara Standard</span>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
