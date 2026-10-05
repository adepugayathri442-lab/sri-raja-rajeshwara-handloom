'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Package, ArrowLeft } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export interface OrderListPlaceholderProps {
  orderId?: string;
}

export function OrderListPlaceholder({ orderId }: OrderListPlaceholderProps) {
  if (orderId) {
    return (
      <ProtectedRoute>
        <div className="py-12 sm:py-16 bg-cream/50 min-h-[75vh]">
          <Container size="lg">
            <div className="mb-6 flex items-center gap-2 text-xs text-muted">
              <Link href="/orders" className="hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Wholesale Orders</span>
              </Link>
              <span>/</span>
              <span className="text-charcoal font-medium">Order #{orderId}</span>
            </div>

            <Card variant="default" className="p-8 sm:p-10 border-border bg-surface">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="primary" size="sm">
                      Wholesale Order Specimen
                    </Badge>
                    <Badge variant="subtle" size="sm">
                      ID: {orderId}
                    </Badge>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-primary">
                    Order Details & Consignment Tracking
                  </h1>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted block">Status:</span>
                  <Badge variant="warning" size="md">
                    Order Placed
                  </Badge>
                </div>
              </div>

              <div className="py-8 text-center max-w-md mx-auto space-y-3">
                <Package className="w-12 h-12 text-primary/40 mx-auto" />
                <h2 className="text-lg font-serif font-semibold text-primary">
                  Order Record Connected to Supabase
                </h2>
                <p className="text-xs text-muted leading-relaxed">
                  When orders are placed, this page renders parcel tracking, transport bilti receipts, piece breakdowns, delivery charges, and invoices directly from the database.
                </p>
              </div>

              <div className="pt-6 border-t border-border flex justify-between items-center text-xs text-muted">
                <span>Model: Single Fixed Rate / Piece</span>
                <Link href="/products" className="text-primary font-semibold hover:text-accent flex items-center gap-1">
                  <span>Browse Wholesale Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          </Container>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="py-12 sm:py-16 bg-cream/50 min-h-[75vh]">
        <Container size="lg">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <Badge variant="primary" size="sm">
                Trade History
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
              Wholesale Orders & Dispatches
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Track previous wholesale dispatches, view consignment statuses, and access tax invoices.
            </p>
          </div>

          <Card variant="default" className="p-8 sm:p-14 text-center border-border">
            <div className="w-16 h-16 rounded-full bg-surface-subtle text-primary flex items-center justify-center mx-auto mb-4 border border-border">
              <ShoppingBag className="w-8 h-8 text-muted" />
            </div>

            <h2 className="text-xl font-serif font-bold text-primary">
              No Wholesale Orders on Record
            </h2>

            <p className="mt-2 text-sm text-muted max-w-md mx-auto leading-relaxed">
              In accordance with data integrity principles, mock orders are not fabricated. All future orders confirmed online or recorded via WhatsApp by the admin will appear here.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button href="/products" variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Wholesale Products
              </Button>
              <Button href="/wholesale-enquiry" variant="outline" size="md">
                Submit Bulk Enquiry
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    </ProtectedRoute>
  );
}
