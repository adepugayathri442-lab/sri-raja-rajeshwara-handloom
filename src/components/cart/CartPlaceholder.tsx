'use client';

import React from 'react';
import { ShoppingBag, ArrowRight, ShieldCheck, MessageCircle, Truck } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { getGeneralEnquiryUrl } from '@/lib/whatsapp';

export function CartPlaceholder() {
  const whatsappHref = getGeneralEnquiryUrl('I would like to place a wholesale order directly.');

  return (
    <div className="py-12 sm:py-16 bg-cream/50 min-h-[75vh]">
      <Container size="lg">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Badge variant="primary" size="sm">
              B2B Wholesale Order
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            Wholesale Cart & Dispatch Order
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Single fixed rates apply per piece. Order any quantity required for your business.
          </p>
        </div>

        {/* Empty Wholesale Cart State */}
        <Card variant="default" className="p-8 sm:p-14 text-center border-border">
          <div className="w-16 h-16 rounded-full bg-surface-subtle text-primary flex items-center justify-center mx-auto mb-4 border border-border">
            <ShoppingBag className="w-8 h-8 text-muted" />
          </div>

          <h2 className="text-xl font-serif font-bold text-primary">
            Your Wholesale Cart is Currently Empty
          </h2>

          <p className="mt-2 text-sm text-muted max-w-md mx-auto leading-relaxed">
            Browse our core textile categories to select towels, lungies, traditional cloth, dhoties, or shawls. Items added will calculate transparent piece totals.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              href="/products"
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Products
            </Button>

            <Button
              href={whatsappHref}
              isExternal={true}
              variant="whatsapp"
              size="md"
              leftIcon={<MessageCircle className="w-4 h-4 fill-current" />}
            >
              Order via WhatsApp
            </Button>
          </div>

          {/* Wholesale Guarantees in Cart */}
          <div className="mt-10 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted text-left max-w-xl mx-auto">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>Fixed rate per piece, no quantity tier restrictions.</span>
            </div>
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>Pan-India transport / parcel logistics.</span>
            </div>
            <div className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>Manual or online payment options supported.</span>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
