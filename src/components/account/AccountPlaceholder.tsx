'use client';

/**
 * Customer Merchant Account View
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Real Supabase profile data: Customer Name, Email, Mobile, Customer Type, Business Name, GSTIN
 * - Real orders loaded via getCustomerOrders: Order number, items, total amount, status, tracking link
 * - Real saved addresses loaded via getCustomerAddresses
 * - Quick Wishlist / Catalogue navigation
 * - Direct WhatsApp Support Desk link
 * - Fully mobile responsive (tested on 360px, 390px, 412px mobile viewports)
 * - Sign Out button
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShoppingBag,
  LogOut,
  MapPin,
  Heart,
  Phone,
  ChevronRight,
  MessageCircle,
  Package,
  RefreshCw,
} from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/lib/auth/auth-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ShivaParvathiEmblem } from '@/components/common/Logo';
import {
  getCustomerOrders,
  getCustomerAddresses,
  type AdminOrderListItem,
} from '@/lib/supabase/admin-operations';
import type { AddressRow } from '@/types';
import { getGeneralEnquiryUrl } from '@/lib/whatsapp';

export function AccountPlaceholder() {
  const { user, profile, isAdmin, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'wishlist'>('overview');
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    let isCurrent = true;

    Promise.all([
      getCustomerOrders(user.id),
      getCustomerAddresses(user.id),
    ])
      .then(([ordersData, addressData]) => {
        if (isCurrent) {
          setOrders(ordersData);
          setAddresses(addressData);
          setIsLoadingData(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load user account data:', err);
        if (isCurrent) setIsLoadingData(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [user]);

  const whatsappHref = getGeneralEnquiryUrl('Hello Sri Raja Rajeshwara Handloom, I need help with my merchant account.');

  const getOrderStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'success' as const;
      case 'Shipped':
      case 'Packed':
        return 'primary' as const;
      case 'Confirmed':
      case 'Processing':
        return 'accent' as const;
      case 'Cancelled':
        return 'subtle' as const;
      default:
        return 'warning' as const;
    }
  };

  return (
    <ProtectedRoute redirectTo="/login?next=/account">
      <div className="py-8 sm:py-12 bg-cream/40 min-h-[80vh]">
        <Container size="lg">
          {/* Header Card */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-7 shadow-2xs mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-1 rounded-full bg-cream border border-accent/40 shadow-xs shrink-0">
                  <ShivaParvathiEmblem size={44} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <Badge variant="primary" size="sm">
                      Wholesale Account
                    </Badge>
                  {isAdmin ? (
                    <Badge variant="accent" size="sm">
                      Administrator
                    </Badge>
                  ) : (
                    <Badge variant="subtle" size="sm">
                      {profile?.customerType || 'Retail Shop'}
                    </Badge>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-serif font-bold text-primary">
                  {profile?.fullName ? `Namaste, ${profile.fullName}` : 'Merchant Account'}
                </h1>

                <p className="text-xs text-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  {profile?.businessName && (
                    <span className="font-medium text-charcoal">{profile.businessName} •</span>
                  )}
                  <span>{profile?.email || user?.email}</span>
                  {profile?.phone && (
                    <>
                      <span>•</span>
                      <span>+91 {profile.phone}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#128C7E]/10 text-[#075E54] hover:bg-[#128C7E] hover:text-white transition-colors border border-[#128C7E]/30 inline-flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden xs:inline">WhatsApp Desk</span>
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  leftIcon={<LogOut className="w-3.5 h-3.5 text-muted" />}
                >
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 sm:gap-2 border-t border-border mt-5 pt-4 overflow-x-auto text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-primary text-white font-semibold'
                    : 'text-charcoal/75 hover:bg-surface-subtle'
                }`}
              >
                Profile Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'bg-primary text-white font-semibold'
                    : 'text-charcoal/75 hover:bg-surface-subtle'
                }`}
              >
                <span>Wholesale Orders</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'orders' ? 'bg-accent text-charcoal' : 'bg-surface-subtle text-muted'
                }`}>
                  {orders.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'addresses'
                    ? 'bg-primary text-white font-semibold'
                    : 'text-charcoal/75 hover:bg-surface-subtle'
                }`}
              >
                <span>Saved Addresses</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'addresses' ? 'bg-accent text-charcoal' : 'bg-surface-subtle text-muted'
                }`}>
                  {addresses.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wishlist')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'wishlist'
                    ? 'bg-primary text-white font-semibold'
                    : 'text-charcoal/75 hover:bg-surface-subtle'
                }`}
              >
                Saved Items / Wishlist
              </button>
            </div>
          </div>

          {/* TAB 1: Profile Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Profile Card */}
                <Card variant="default" className="p-5 border-border bg-surface">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-accent" />
                    <h2 className="font-serif font-bold text-primary text-sm">Merchant Details</h2>
                  </div>
                  <dl className="space-y-2.5 text-xs">
                    <div>
                      <dt className="text-[10px] uppercase font-semibold text-muted">Full Name</dt>
                      <dd className="font-medium text-charcoal mt-0.5">{profile?.fullName || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase font-semibold text-muted">Business / Shop Name</dt>
                      <dd className="font-medium text-charcoal mt-0.5">{profile?.businessName || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase font-semibold text-muted">Customer Type</dt>
                      <dd className="font-medium text-charcoal mt-0.5">{profile?.customerType || 'Retail Shop'}</dd>
                    </div>
                    {profile?.gstNumber && (
                      <div>
                        <dt className="text-[10px] uppercase font-semibold text-muted">GST Number</dt>
                        <dd className="font-mono font-medium text-primary mt-0.5">{profile.gstNumber}</dd>
                      </div>
                    )}
                  </dl>
                </Card>

                {/* Contact Card */}
                <Card variant="default" className="p-5 border-border bg-surface">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="w-4 h-4 text-accent" />
                    <h2 className="font-serif font-bold text-primary text-sm">Contact Information</h2>
                  </div>
                  <dl className="space-y-2.5 text-xs">
                    <div>
                      <dt className="text-[10px] uppercase font-semibold text-muted">Email Address</dt>
                      <dd className="font-medium text-charcoal mt-0.5 break-all">{profile?.email || user?.email || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase font-semibold text-muted">Mobile Number</dt>
                      <dd className="font-medium text-charcoal mt-0.5">
                        {profile?.phone ? `+91 ${profile.phone}` : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase font-semibold text-muted">Dispatch Logistics</dt>
                      <dd className="font-medium text-charcoal mt-0.5">Pan-India Parcel & Transport Godown</dd>
                    </div>
                  </dl>
                </Card>

                {/* Summary Card */}
                <Card variant="default" className="p-5 border-border bg-surface flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingBag className="w-4 h-4 text-accent" />
                      <h2 className="font-serif font-bold text-primary text-sm">Orders Summary</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-surface-subtle rounded-lg text-center">
                        <span className="text-xl font-bold text-primary block">{orders.length}</span>
                        <span className="text-[10px] text-muted uppercase font-semibold">Total Orders</span>
                      </div>
                      <div className="p-3 bg-surface-subtle rounded-lg text-center">
                        <span className="text-xl font-bold text-accent block">{addresses.length}</span>
                        <span className="text-[10px] text-muted uppercase font-semibold">Addresses</span>
                      </div>
                    </div>
                  </div>

                  <Link href="/products" className="w-full">
                    <Button variant="primary" size="sm" fullWidth>
                      Browse Wholesale Catalogue
                    </Button>
                  </Link>
                </Card>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-surface rounded-xl border border-border p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-bold text-primary text-base">Recent Wholesale Dispatches</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-accent font-semibold hover:underline"
                  >
                    View All Orders ({orders.length}) →
                  </button>
                </div>

                {isLoadingData ? (
                  <div className="py-8 text-center text-xs text-muted flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                    <span>Loading order records...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted">
                    <Package className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-charcoal">No wholesale orders placed yet.</p>
                    <p className="mt-1">Add handloom products from the catalogue to place your first trade consignment.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="p-3 sm:p-4 rounded-lg bg-surface-subtle border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-primary text-sm">#{order.orderNumber}</span>
                            <Badge variant={getOrderStatusBadgeVariant(order.orderStatus)} size="sm">
                              {order.orderStatus}
                            </Badge>
                          </div>
                          <span className="text-muted text-[11px]">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            • {order.totalPieces} pieces • ₹{order.grandTotal.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition-colors self-start sm:self-auto"
                        >
                          <span>Track Dispatch</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Orders List */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-bold text-primary text-lg">Wholesale Orders & Dispatches</h2>
                <Link href="/products">
                  <Button variant="outline" size="sm">
                    + New Wholesale Order
                  </Button>
                </Link>
              </div>

              {isLoadingData ? (
                <div className="py-12 text-center text-xs text-muted flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                  <span>Loading wholesale orders from Supabase...</span>
                </div>
              ) : orders.length === 0 ? (
                <Card variant="default" className="p-10 text-center border-border">
                  <ShoppingBag className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
                  <h3 className="font-serif font-bold text-primary text-base">No Orders Placed Yet</h3>
                  <p className="text-xs text-muted max-w-sm mx-auto mt-1 mb-5">
                    Your wholesale order history, transport consignment slips, and LR bilti numbers will appear here.
                  </p>
                  <Link href="/products">
                    <Button variant="primary" size="sm">
                      Browse Wholesale Products
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <Card key={order.id} variant="default" className="p-4 sm:p-5 border-border bg-surface">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <span className="font-mono font-bold text-primary text-sm sm:text-base">
                              #{order.orderNumber}
                            </span>
                            <Badge variant={getOrderStatusBadgeVariant(order.orderStatus)} size="sm">
                              {order.orderStatus}
                            </Badge>
                            <Badge variant={order.paymentStatus === 'Payment Received' ? 'success' : 'warning'} size="sm">
                              {order.paymentStatus}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>Placed: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span>•</span>
                            <span>{order.totalPieces} Pieces</span>
                            {order.destinationCity && (
                              <>
                                <span>•</span>
                                <span>Destination: {order.destinationCity}, {order.destinationState}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-muted block uppercase font-semibold">Consignment Total</span>
                            <span className="text-base font-bold text-primary">₹{order.grandTotal.toLocaleString('en-IN')}</span>
                          </div>

                          <Link href={`/orders/${order.id}`}>
                            <Button variant="primary" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                              View Order & Track
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h2 className="font-serif font-bold text-primary text-lg">Saved Dispatch & Delivery Points</h2>

              {isLoadingData ? (
                <div className="py-12 text-center text-xs text-muted flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                  <span>Loading delivery addresses...</span>
                </div>
              ) : addresses.length === 0 ? (
                <Card variant="default" className="p-10 text-center border-border">
                  <MapPin className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
                  <h3 className="font-serif font-bold text-primary text-base">No Saved Delivery Addresses</h3>
                  <p className="text-xs text-muted max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
                    Addresses entered during wholesale consignment checkout will be securely saved here for faster repeat orders.
                  </p>
                  <Link href="/products">
                    <Button variant="primary" size="sm">
                      Start an Order
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <Card key={addr.id} variant="default" className="p-4 sm:p-5 border-border bg-surface text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary text-sm">{addr.name}</span>
                        {addr.is_default && (
                          <Badge variant="accent" size="sm">Default Delivery</Badge>
                        )}
                      </div>
                      <p className="text-charcoal leading-relaxed">
                        {addr.address_line_1}
                        {addr.address_line_2 && `, ${addr.address_line_2}`}
                        <br />
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-muted text-[11px]">Contact Phone: +91 {addr.phone}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Wishlist / Saved Items */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h2 className="font-serif font-bold text-primary text-lg">Saved Wholesale Items</h2>
              <Card variant="default" className="p-10 text-center border-border">
                <Heart className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
                <h3 className="font-serif font-bold text-primary text-base">Quick Re-order Catalogue</h3>
                <p className="text-xs text-muted max-w-md mx-auto mt-1 mb-5 leading-relaxed">
                  Browse our wholesale collection of handloom towels, lungies, dhoties, and shawls. Order any quantity with fixed wholesale piece rates.
                </p>
                <Link href="/products">
                  <Button variant="primary" size="sm">
                    Browse All Wholesale Products →
                  </Button>
                </Link>
              </Card>
            </div>
          )}
        </Container>
      </div>
    </ProtectedRoute>
  );
}
