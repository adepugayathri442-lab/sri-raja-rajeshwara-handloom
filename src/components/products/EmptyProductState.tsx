import React from 'react';
import { Package, MessageCircle, Mail, ShieldCheck, Truck, Layers } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { getGeneralEnquiryUrl } from '@/lib/whatsapp';

export interface EmptyProductStateProps {
  categoryName?: string;
  categorySlug?: string;
  searchQuery?: string;
}

export function EmptyProductState({
  categoryName,
  searchQuery,
}: EmptyProductStateProps) {
  const whatsappHref = getGeneralEnquiryUrl(
    categoryName
      ? `Hello Sri Raja Rajeshwara Handloom, I am inquiring about wholesale stock availability for ${categoryName}.`
      : 'Hello Sri Raja Rajeshwara Handloom, I am inquiring about your current wholesale textile catalogue and rates.'
  );

  return (
    <Card
      variant="default"
      className="p-8 sm:p-14 text-center max-w-3xl mx-auto my-8 border-border bg-surface shadow-xs"
    >
      <div className="w-16 h-16 rounded-full bg-primary-subtle text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20">
        <Package className="w-8 h-8 text-primary" />
      </div>

      <div className="inline-flex items-center gap-2 mb-3">
        <Badge variant="accent" size="sm">
          100% Wholesale • Fixed Piece Rate
        </Badge>
      </div>

      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
        Wholesale Catalogue Coming Soon
      </h3>

      <p className="mt-2 text-sm sm:text-base text-charcoal font-medium">
        We are currently updating our wholesale catalogue.
      </p>

      <p className="mt-2 text-xs sm:text-sm text-muted max-w-lg mx-auto leading-relaxed">
        {searchQuery ? (
          <>
            No products matching &ldquo;<span className="font-semibold text-charcoal">{searchQuery}</span>&rdquo; are currently listed. For specific cloth specifications, custom bailing, or stock availability, contact us directly.
          </>
        ) : categoryName ? (
          <>
            Wholesale products for <strong className="text-charcoal font-semibold">{categoryName}</strong> are currently being cataloged. For immediate wholesale orders, piece rates, or bale dispatch, contact our sales desk directly on WhatsApp.
          </>
        ) : (
          'For product availability, rates or bulk requirements, contact us directly on WhatsApp.'
        )}
      </p>

      {/* Primary Action Buttons Requested by Client */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
        <Button
          href={whatsappHref}
          isExternal
          variant="whatsapp"
          size="md"
          leftIcon={<MessageCircle className="w-4 h-4 fill-current" />}
          className="w-full sm:w-auto"
        >
          WhatsApp Wholesale Enquiry
        </Button>

        <Button
          href="/contact"
          variant="outline"
          size="md"
          leftIcon={<Mail className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Contact Us
        </Button>
      </div>

      {/* Model Transparency Highlights */}
      <div className="mt-10 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-muted text-left max-w-xl mx-auto">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>Single fixed wholesale rate per piece. No tier markups.</span>
        </div>
        <div className="flex items-start gap-2">
          <Layers className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span>Order any quantity required for your shop or institution.</span>
        </div>
        <div className="flex items-start gap-2">
          <Truck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>Pan-India transport parcel dispatch from Nizamabad.</span>
        </div>
      </div>
    </Card>
  );
}
