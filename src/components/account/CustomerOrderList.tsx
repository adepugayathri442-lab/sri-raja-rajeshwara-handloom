'use client';

/**
 * Customer Wholesale Order List Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Real-time Supabase querying for the authenticated customer's own orders
 * - Strict RLS protection: Customer can only view their own trade dispatches
 * - Order status & payment badges
 * - Link to parcel consignment tracking (/orders/[id])
 * - Empty state: "No wholesale orders on record"
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/auth-context';
import {
  getCustomerOrders,
  type AdminOrderListItem,
} from '@/lib/supabase/admin-operations';

export function CustomerOrderList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    getCustomerOrders(user.id)
      .then((data) => {
        setOrders(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load user orders:', err);
        setError('Could not retrieve order history.');
        setIsLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let ignore = false;
    getCustomerOrders(user.id)
      .then((data) => {
        if (!ignore) {
          setOrders(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load user orders:', err);
          setError('Could not retrieve order history.');
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="py-10 sm:py-14 bg-cream min-h-[75vh]">
        <Container size="lg">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 mb-1.5">
                <Badge variant="primary" size="sm">
                  Wholesale Trade Account
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
                My Wholesale Orders & Dispatches
              </h1>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Track parcel dispatches, view transport consignment statuses, and access billing details.
              </p>
            </div>

            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadOrders}
                disabled={isLoading}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              >
                Refresh Orders
              </Button>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <Card variant="default" className="p-12 text-center border-border">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
              <p className="text-xs font-medium text-muted">Checking wholesale order records...</p>
            </Card>
          ) : error ? (
            <Card variant="default" className="p-8 text-center border-rose-200 bg-rose-50/40">
              <p className="text-xs text-rose-700">{error}</p>
              <Button variant="outline" size="sm" onClick={loadOrders} className="mt-3">
                Retry
              </Button>
            </Card>
          ) : orders.length === 0 ? (
            <Card variant="default" className="p-10 sm:p-14 text-center border-border bg-surface">
              <div className="w-16 h-16 rounded-full bg-cream-100 text-muted flex items-center justify-center mx-auto mb-4 border border-border">
                <ShoppingBag className="w-8 h-8 text-muted" />
              </div>
              <h2 className="text-xl font-serif font-bold text-primary">
                No orders yet
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
                You have not placed any wholesale orders yet. Explore our wholesale handloom and powerloom catalogue with fixed manufacturer piece rates.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button href="/products" variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Wholesale Catalog
                </Button>
                <Button href="/wholesale-enquiry" variant="outline" size="md">
                  Submit Bulk Enquiry
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => {
                const isCancelled = o.orderStatus === 'Cancelled';
                return (
                  <Card
                    key={o.id}
                    variant="default"
                    className="p-5 sm:p-6 border-border bg-surface shadow-2xs hover:border-accent/40 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-sm text-primary">
                            Order #{o.orderNumber}
                          </span>
                          <span className="text-muted text-xs">•</span>
                          <span className="text-xs text-muted flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(o.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-muted">
                          {o.totalPieces} pieces ({o.itemCount} line {o.itemCount === 1 ? 'item' : 'items'})
                          {o.destinationCity && ` • Destination: ${o.destinationCity}, ${o.destinationState}`}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Order Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            o.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.orderStatus === 'Shipped'
                              ? 'bg-purple-100 text-purple-800'
                              : o.orderStatus === 'Packed'
                              ? 'bg-blue-100 text-blue-800'
                              : o.orderStatus === 'Processing'
                              ? 'bg-amber-100 text-amber-900'
                              : o.orderStatus === 'Confirmed'
                              ? 'bg-teal-100 text-teal-800'
                              : isCancelled
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {o.orderStatus === 'Delivered' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : isCancelled ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          {o.orderStatus}
                        </span>

                        {/* Payment Status */}
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
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-muted block text-[11px]">Consignment Value:</span>
                        <div className="text-lg font-serif font-bold text-primary">
                          ₹{o.grandTotal.toLocaleString('en-IN')}
                          <span className="text-xs font-normal text-muted ml-1.5 font-sans">
                            {o.deliveryCharge > 0 ? '(incl. transport)' : '(freight manual/to-pay)'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/orders/${o.id}`}
                          className="px-4 py-2 bg-primary text-white hover:bg-primary-hover rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Track Dispatch</span>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Container>
      </div>
    </ProtectedRoute>
  );
}
