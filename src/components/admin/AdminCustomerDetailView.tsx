'use client';

/**
 * Admin Customer Detail View Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Customer profile & trade credentials
 * - Registered shop / godown addresses
 * - Aggregate purchase metrics (valid order count and total spend)
 * - Order history table with direct navigation to /admin/orders/[id]
 * - Zero exposure of password hashes or auth tokens
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Store,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  getAdminCustomerById,
  type AdminCustomerDetail,
} from '@/lib/supabase/admin-operations';

interface AdminCustomerDetailViewProps {
  customerId: string;
}

export function AdminCustomerDetailView({ customerId }: AdminCustomerDetailViewProps) {
  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomer = useCallback(() => {
    setIsLoading(true);
    setError(null);
    getAdminCustomerById(customerId)
      .then((data) => {
        if (!data) {
          setError(`Customer profile not found for ID "${customerId}".`);
        } else {
          setCustomer(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load customer profile:', err);
        setError('Could not retrieve customer details from database.');
        setIsLoading(false);
      });
  }, [customerId]);

  useEffect(() => {
    let ignore = false;
    getAdminCustomerById(customerId)
      .then((data) => {
        if (!ignore) {
          if (!data) {
            setError(`Customer profile not found for ID "${customerId}".`);
          } else {
            setCustomer(data);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load customer profile:', err);
          setError('Could not retrieve customer details from database.');
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [customerId]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Link href="/admin/customers" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Customers</span>
          </Link>
        </div>
        <Card variant="default" className="p-12 text-center border-border">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-charcoal">Loading merchant profile...</p>
        </Card>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Link href="/admin/customers" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Customers</span>
          </Link>
        </div>
        <Card variant="default" className="p-10 text-center border-rose-200 bg-rose-50/40">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h2 className="text-lg font-serif font-bold text-rose-900">Customer Record Error</h2>
          <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">{error || 'Merchant record could not be loaded.'}</p>
          <div className="mt-5">
            <Button href="/admin/customers" variant="outline" size="sm">
              Return to Customers Directory
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted mb-1">
            <Link href="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <Link href="/admin/customers" className="hover:text-primary">Customers</Link>
            <span>/</span>
            <span className="text-charcoal font-medium">{customer.fullName}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
              {customer.fullName}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
              {customer.customerType}
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Account registered on {new Date(customer.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCustomer}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" className="p-5 border-border bg-surface">
          <span className="text-xs text-muted block mb-1">Total Confirmed Orders</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-primary">
              {customer.totalOrders}
            </span>
            <span className="text-xs text-muted">dispatches</span>
          </div>
        </Card>

        <Card variant="default" className="p-5 border-border bg-surface">
          <span className="text-xs text-muted block mb-1">Total Lifetime Purchases</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-primary">
              ₹{customer.totalPurchaseAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-muted">(excl. cancelled)</span>
          </div>
        </Card>

        <Card variant="default" className="p-5 border-border bg-surface">
          <span className="text-xs text-muted block mb-1">Trade Account Type</span>
          <div className="text-sm font-semibold text-charcoal">
            {customer.customerType}
          </div>
          {customer.gstNumber && (
            <span className="text-[11px] font-mono text-muted block mt-0.5">
              GST: {customer.gstNumber}
            </span>
          )}
        </Card>
      </div>

      {/* 2-Column Info: Customer Profile + Saved Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business & Contact Details */}
        <Card variant="default" className="p-6 border-border bg-surface space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Store className="w-5 h-5 text-accent" />
            <h2 className="text-sm font-serif font-bold text-primary uppercase tracking-wider">
              Trade Profile & Credentials
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {customer.businessName && (
              <div>
                <span className="text-[11px] text-muted block">Firm / Cloth Store Name:</span>
                <strong className="text-sm font-serif text-primary block mt-0.5">
                  {customer.businessName}
                </strong>
              </div>
            )}

            <div>
              <span className="text-[11px] text-muted block">Contact Person:</span>
              <span className="font-semibold text-charcoal">{customer.fullName}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] text-muted block mb-1">Phone / WhatsApp:</span>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted shrink-0" />
                  <a href={`tel:${customer.phone}`} className="font-medium text-primary hover:underline">
                    {customer.phone}
                  </a>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-muted block mb-1">Email Address:</span>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted shrink-0" />
                  <a href={`mailto:${customer.email}`} className="font-medium text-primary hover:underline truncate block">
                    {customer.email}
                  </a>
                </div>
              </div>
            </div>

            {customer.gstNumber && (
              <div className="pt-1">
                <span className="text-[11px] text-muted block">Goods & Services Tax (GSTIN):</span>
                <span className="font-mono font-semibold text-charcoal">{customer.gstNumber}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Saved Consignment Addresses */}
        <Card variant="default" className="p-6 border-border bg-surface space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              <h2 className="text-sm font-serif font-bold text-primary uppercase tracking-wider">
                Saved Delivery Addresses ({customer.addresses.length})
              </h2>
            </div>
          </div>

          {customer.addresses.length === 0 ? (
            <p className="text-xs text-muted italic py-4">
              No delivery addresses recorded yet on this customer profile.
            </p>
          ) : (
            <div className="space-y-3">
              {customer.addresses.map((addr, idx) => (
                <div
                  key={addr.id || idx}
                  className="p-3.5 rounded-lg border border-border bg-surface-subtle text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">{addr.name}</span>
                    <span className="text-muted">{addr.phone}</span>
                  </div>
                  <p className="text-charcoal leading-relaxed">
                    {addr.address_line_1}
                    {addr.address_line_2 && `, ${addr.address_line_2}`}
                  </p>
                  {addr.landmark && (
                    <p className="text-[11px] text-muted italic">Landmark: {addr.landmark}</p>
                  )}
                  <p className="font-medium text-charcoal pt-0.5">
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Customer Wholesale Order History */}
      <Card variant="default" className="p-6 border-border bg-surface space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <h2 className="text-base font-serif font-bold text-primary">
              Wholesale Order History ({customer.orderHistory.length})
            </h2>
          </div>
        </div>

        {customer.orderHistory.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingBag className="w-10 h-10 text-muted mx-auto mb-2 opacity-50" />
            <p className="text-xs text-muted">This customer has not placed any wholesale orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-subtle text-muted uppercase text-[10px] font-semibold">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Order Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {customer.orderHistory.map((o) => (
                  <tr key={o.id} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-primary">
                      <Link href={`/admin/orders/${o.id}`} className="hover:text-accent">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-muted whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-3 text-charcoal">
                      {o.itemCount} line {o.itemCount === 1 ? 'item' : 'items'}
                    </td>
                    <td className="py-3 px-3 font-serif font-bold text-primary">
                      ₹{o.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          o.paymentStatus === 'Payment Received'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.paymentStatus === 'Failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          o.orderStatus === 'Delivered'
                            ? 'bg-teal-100 text-teal-800'
                            : o.orderStatus === 'Shipped'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.orderStatus === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="px-2.5 py-1 bg-surface-subtle hover:bg-surface border border-border rounded text-[11px] font-semibold text-primary inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Manage Order</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
