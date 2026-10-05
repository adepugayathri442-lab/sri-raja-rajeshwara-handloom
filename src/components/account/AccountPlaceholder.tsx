'use client';

import React from 'react';
import { Building2, ShoppingBag, FileText, Truck, Database, LogOut } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/lib/auth/auth-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function AccountPlaceholder() {
  const { user, profile, isAdmin, logout, isConfigured } = useAuth();

  return (
    <ProtectedRoute>
      <div className="py-12 sm:py-16 bg-cream/50 min-h-[75vh]">
        <Container size="lg">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <Badge variant="primary" size="sm">
                  Merchant Account
                </Badge>
                {isAdmin ? (
                  <Badge variant="accent" size="sm">
                    Administrator
                  </Badge>
                ) : (
                  <Badge variant="subtle" size="sm">
                    {profile?.customerType || 'Wholesale Buyer'}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
                {profile?.fullName ? `Namaste, ${profile.fullName}` : 'Wholesale Buyer Account'}
              </h1>
              <p className="text-xs sm:text-sm text-muted mt-1">
                {profile?.businessName ? `${profile.businessName} • ` : ''}
                {user?.email || 'Authenticated Merchant Session'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button href="/orders" variant="outline" size="sm" leftIcon={<ShoppingBag className="w-4 h-4" />}>
                My Orders
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                leftIcon={<LogOut className="w-4 h-4 text-muted" />}
              >
                Sign Out
              </Button>
            </div>
          </div>

          {/* Business & Session Summary */}
          <div className="mb-8 p-5 bg-surface rounded-xl border border-accent/25 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted tracking-wider block">Full Name</span>
                <span className="text-charcoal font-medium text-sm mt-0.5 block">{profile?.fullName || user?.email || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted tracking-wider block">Business / Shop</span>
                <span className="text-charcoal font-medium text-sm mt-0.5 block">{profile?.businessName || 'Wholesale Trader'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted tracking-wider block">Contact Phone</span>
                <span className="text-charcoal font-medium text-sm mt-0.5 block">{profile?.phone || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted tracking-wider block">Account Role</span>
                <span className="text-primary font-bold text-sm mt-0.5 block capitalize">{profile?.role || 'Customer'}</span>
              </div>
            </div>
          </div>

          {/* Database Connection Notice */}
          <div className="mb-8 p-4 bg-surface rounded-lg border border-border flex items-start gap-3 text-xs text-muted shadow-2xs">
            <Database className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-charcoal block">Supabase Database & Profile Architecture</span>
              <p className="text-muted leading-relaxed">
                {isConfigured
                  ? 'Connected to live Supabase backend. Profile information is securely synchronized with PostgreSQL RLS policies.'
                  : 'Supabase client foundation is active. Add connection variables to .env.local to persist profile updates to PostgreSQL.'}
              </p>
            </div>
          </div>

          {/* Profile Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default" className="p-6 border-border bg-surface">
              <div className="w-10 h-10 rounded-md bg-primary-subtle text-primary flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="font-serif font-bold text-primary text-base mb-1">
                Business Profile
              </h2>
              <p className="text-xs text-muted mb-4">
                Verified wholesale classification and tax configuration.
              </p>
              <div className="space-y-2 text-xs border-t border-border/60 pt-3">
                <div className="flex justify-between text-muted">
                  <span>Customer Type:</span>
                  <span className="font-semibold text-charcoal">{profile?.customerType || 'Retail Shop'}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>GST Status:</span>
                  <span className="text-charcoal font-semibold">Configured on Checkout</span>
                </div>
              </div>
            </Card>

            <Card variant="default" className="p-6 border-border bg-surface">
              <div className="w-10 h-10 rounded-md bg-accent/15 text-accent-hover flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h2 className="font-serif font-bold text-primary text-base mb-1">
                Dispatch Locations
              </h2>
              <p className="text-xs text-muted mb-4">
                Default transport godowns, parcel centers, and shop delivery addresses.
              </p>
              <div className="space-y-2 text-xs border-t border-border/60 pt-3">
                <div className="flex justify-between text-muted">
                  <span>Saved Addresses:</span>
                  <span className="font-semibold text-charcoal">0 registered</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Logistics Zone:</span>
                  <span className="font-semibold text-charcoal">Pan-India Delivery</span>
                </div>
              </div>
            </Card>

            <Card variant="default" className="p-6 border-border bg-surface">
              <div className="w-10 h-10 rounded-md bg-surface-subtle text-charcoal flex items-center justify-center mb-4 border border-border">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="font-serif font-bold text-primary text-base mb-1">
                Invoices & Orders
              </h2>
              <p className="text-xs text-muted mb-4">
                Download tax invoices, payment receipts, and transport bilti slips.
              </p>
              <div className="space-y-2 text-xs border-t border-border/60 pt-3">
                <div className="flex justify-between text-muted">
                  <span>Orders Placed:</span>
                  <span className="font-semibold text-charcoal">0 orders</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Bilti Tracking:</span>
                  <span className="font-semibold text-charcoal">Available via Orders</span>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </div>
    </ProtectedRoute>
  );
}
