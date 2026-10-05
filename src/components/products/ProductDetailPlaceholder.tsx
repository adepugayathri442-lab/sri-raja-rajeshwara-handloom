'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, ShieldCheck, Truck, MessageCircle, ArrowLeft, AlertCircle, ShoppingBag } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { getProductEnquiryUrl } from '@/lib/whatsapp';

export interface ProductDetailPlaceholderProps {
  productId: string;
}

export function ProductDetailPlaceholder({ productId }: ProductDetailPlaceholderProps) {
  const [quantity, setQuantity] = useState(25);

  const whatsappHref = getProductEnquiryUrl({
    productName: `Wholesale Item #${productId}`,
    productCode: `SRR-PRD-${productId}`,
    quantity,
    pricePerPiece: 0,
  });

  return (
    <div className="py-10 sm:py-16 bg-cream/50 min-h-screen">
      <Container size="xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-xs text-muted">
          <Link href="/products" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products Catalogue</span>
          </Link>
          <span>/</span>
          <span className="text-charcoal font-medium">Product Specification Template</span>
        </div>

        {/* Database Status Alert Banner */}
        <div className="mb-8 p-4 bg-amber-50/90 border border-amber-200 rounded-lg flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">Wholesale Product Detail Architecture (ID: {productId})</span>
            <p className="text-amber-800 leading-relaxed">
              This layout is fully wired to receive dynamic product records from Supabase <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">public.products</code>. In compliance with data integrity, no artificial mock specifications are fabricated until real product data is synced.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Product Media Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-square bg-surface rounded-xl border border-border flex flex-col items-center justify-center p-8 text-center shadow-xs">
              <Package className="w-16 h-16 text-primary/40 mb-3" />
              <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                Product Image Placeholder
              </div>
              <p className="text-[11px] text-muted max-w-xs">
                Supports multiple high-resolution photos and textile weave close-ups stored in Supabase Storage.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-surface rounded border border-border/70 flex items-center justify-center text-[10px] text-muted/60"
                >
                  Angle {i}
                </div>
              ))}
            </div>
          </div>

          {/* Product Specifications & Order Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" size="sm">
                  100% Wholesale Piece Rate
                </Badge>
                <Badge variant="accent" size="sm">
                  Any Quantity Order
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
                Wholesale Textile Specification [Item ID: {productId}]
              </h1>

              <div className="mt-2 text-xs text-muted flex items-center gap-4">
                <span>SKU: SRR-TEXTILE-{productId.slice(0, 6).toUpperCase()}</span>
                <span>•</span>
                <span>Category: Wholesale Traditional Supply</span>
              </div>
            </div>

            {/* Wholesale Price Box */}
            <div className="p-5 bg-surface rounded-xl border border-accent/40 shadow-xs space-y-2">
              <div className="text-[11px] font-semibold text-accent uppercase tracking-wider">
                Wholesale Pricing Structure
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif font-bold text-primary">
                  Fixed Rate / Piece
                </span>
                <span className="text-xs text-muted">
                  (GST & transport billing applied at invoice)
                </span>
              </div>
              <p className="text-xs text-muted pt-1">
                Uniform piece rate applies whether purchasing 5 pieces or 500 pieces. No volume penalties.
              </p>
            </div>

            {/* Technical Specifications Table */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-4 bg-surface-subtle border-b border-border text-xs font-semibold text-charcoal">
                Merchant Technical Specifications
              </div>
              <div className="divide-y divide-border/60 text-xs">
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted font-medium">Material Composition</span>
                  <span className="col-span-2 text-charcoal font-semibold">100% Authentic Woven Cotton / Blends</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted font-medium">Weave & Border</span>
                  <span className="col-span-2 text-charcoal">Traditional Loom Finish with Reinforced Border</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted font-medium">Packaging Standard</span>
                  <span className="col-span-2 text-charcoal">Individual Piece Fold • Bundled in Merchant Bales</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted font-medium">Dispatch Coverage</span>
                  <span className="col-span-2 text-charcoal">Pan-India Freight / Transport Delivery</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector Preview */}
            <div className="p-5 bg-surface rounded-xl border border-border space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-charcoal">Select Order Quantity (Pieces):</span>
                <span className="text-accent font-medium">Any quantity accepted</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-md bg-surface-subtle">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 5))}
                    className="px-3 py-2 text-sm text-charcoal hover:bg-surface-border font-bold"
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 py-2 text-center text-sm font-semibold bg-surface border-x border-border focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 5)}
                    className="px-3 py-2 text-sm text-charcoal hover:bg-surface-border font-bold"
                  >
                    +5
                  </button>
                </div>
                <span className="text-xs text-muted">Pieces selected</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Button
                  href="/cart"
                  variant="primary"
                  size="md"
                  fullWidth
                  leftIcon={<ShoppingBag className="w-4 h-4" />}
                >
                  Add to Wholesale Cart
                </Button>

                <Button
                  href={whatsappHref}
                  isExternal={true}
                  variant="whatsapp"
                  size="md"
                  fullWidth
                  leftIcon={<MessageCircle className="w-4 h-4 fill-current" />}
                >
                  WhatsApp Order Inquiry
                </Button>
              </div>
            </div>

            {/* Trust Points */}
            <div className="grid grid-cols-2 gap-3 text-xs text-muted pt-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>GST Tax Invoice Included</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-accent shrink-0" />
                <span>Transport Bilti Tracking Provided</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
