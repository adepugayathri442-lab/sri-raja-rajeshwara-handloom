'use client';

/**
 * Admin Order Management List Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Real-time Supabase order querying
 * - Search by order number, customer name, business, phone, email
 * - Filters for Order Status, Payment Status, and Date Range
 * - Multi-field sorting
 * - Table on desktop, card stack on mobile
 * - Direct link to /admin/orders/[id]
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  X,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  getAdminOrders,
  type AdminOrderListItem,
  type GetAdminOrdersOptions,
} from '@/lib/supabase/admin-operations';
import type { OrderStatus, PaymentStatus } from '@/types';

import { AdminExportButton } from './AdminExportButton';
import { exportOrdersDataset, type OrderExportItem } from '@/lib/export/export-utils';

export function AdminOrderList({ initialStatus }: { initialStatus?: string }) {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus | 'all'>((initialStatus as OrderStatus) || 'all');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<GetAdminOrdersOptions['dateRange']>('all');
  const [sortBy, setSortBy] = useState<GetAdminOrdersOptions['sortBy']>('newest');

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminOrders({
        search,
        orderStatus,
        paymentStatus,
        dateRange,
        sortBy,
      });
      setOrders(res.orders);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Unable to load wholesale orders from database.');
    } finally {
      setIsLoading(false);
    }
  }, [search, orderStatus, paymentStatus, dateRange, sortBy]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadOrders();
    }, 300);
    return () => clearTimeout(handler);
  }, [loadOrders]);

  const clearFilters = () => {
    setSearch('');
    setOrderStatus('all');
    setPaymentStatus('all');
    setDateRange('all');
    setSortBy('newest');
  };

  const handleExport = (format: 'csv' | 'excel') => {
    if (orders.length === 0) return;
    const exportData: OrderExportItem[] = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      customerName: o.customerName,
      businessName: o.businessName,
      customerType: o.customerType,
      customerPhone: o.customerPhone,
      customerEmail: o.customerEmail,
      destinationCity: o.destinationCity,
      destinationState: o.destinationState,
      orderStatus: o.orderStatus,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      subtotal: o.subtotal,
      deliveryCharge: o.deliveryCharge,
      grandTotal: o.grandTotal,
    }));
    exportOrdersDataset(exportData, format);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted mb-1">
            <Link href="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <span className="text-primary font-medium">Orders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            Wholesale Orders & Dispatches
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Monitor incoming customer consignments, update dispatch lifecycle, and manage payments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <AdminExportButton
            onExport={handleExport}
            disabled={orders.length === 0 || isLoading}
            label="Export"
          />
          <button
            type="button"
            onClick={loadOrders}
            className="p-2 text-muted hover:text-charcoal bg-surface border border-border rounded-lg hover:bg-surface-subtle transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search by ID, name, shop, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Order Status */}
          <div>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value as OrderStatus | 'all')}
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="all">All Order Statuses</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus | 'all')}
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Payment Received">Payment Received</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as GetAdminOrdersOptions['dateRange'])}
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as GetAdminOrdersOptions['sortBy'])}
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="total-desc">Sort: Amount (High to Low)</option>
              <option value="total-asc">Sort: Amount (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Toolbar Summary */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted">
          <span>
            Showing <strong className="text-charcoal font-semibold">{orders.length}</strong> of{' '}
            <strong className="text-charcoal font-semibold">{total}</strong> orders
          </span>

          {(search || orderStatus !== 'all' || paymentStatus !== 'all' || dateRange !== 'all' || sortBy !== 'newest') && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] text-accent hover:text-accent-hover font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={loadOrders} className="font-semibold underline ml-2">
            Retry
          </button>
        </div>
      )}

      {/* Loading & Empty States */}
      {isLoading ? (
        <div className="bg-surface border border-border rounded-xl p-8 space-y-3 animate-pulse">
          <div className="h-6 bg-surface-subtle rounded w-1/4" />
          <div className="h-12 bg-surface-subtle rounded" />
          <div className="h-12 bg-surface-subtle rounded" />
          <div className="h-12 bg-surface-subtle rounded" />
        </div>
      ) : orders.length === 0 ? (
        <Card variant="default" className="p-12 text-center border-border bg-surface space-y-3">
          <div className="w-14 h-14 rounded-full bg-surface-subtle text-muted flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-serif font-bold text-primary">No Orders Found</h3>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
            {search || orderStatus !== 'all' || paymentStatus !== 'all' || dateRange !== 'all'
              ? 'No orders match your filter criteria. Try adjusting or resetting filters.'
              : 'There are currently zero customer orders recorded in the Supabase database. Orders placed by bulk buyers will appear here in real-time.'}
          </p>
          {(search || orderStatus !== 'all' || paymentStatus !== 'all' || dateRange !== 'all') && (
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block bg-surface border border-border rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border text-muted font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Business / Shop</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Pieces & Items</th>
                    <th className="py-3 px-4">Grand Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Order Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-primary">
                        <Link href={`/admin/orders/${o.id}`} className="hover:text-accent">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-charcoal">{o.customerName}</div>
                        <div className="text-[11px] text-muted">{o.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-muted">
                        <div>{o.businessName || '—'}</div>
                        {o.destinationCity && (
                          <div className="text-[10px] text-muted">{o.destinationCity}, {o.destinationState}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-muted whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-charcoal">{o.totalPieces} pcs</span>
                        <span className="text-[10px] text-muted block">({o.itemCount} line items)</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-serif font-bold text-primary text-sm">
                        ₹{o.grandTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            o.orderStatus === 'Delivered'
                              ? 'bg-teal-100 text-teal-800'
                              : o.orderStatus === 'Shipped'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.orderStatus === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : o.orderStatus === 'Confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="px-3 py-1.5 bg-primary text-white hover:bg-primary-hover rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards Stack */}
          <div className="md:hidden space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-surface border border-border rounded-xl p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary text-sm">{o.orderNumber}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                      o.orderStatus === 'Delivered'
                        ? 'bg-teal-100 text-teal-800'
                        : o.orderStatus === 'Cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-primary-subtle text-primary'
                    }`}
                  >
                    {o.orderStatus}
                  </span>
                </div>

                <div className="text-xs space-y-1 border-y border-border/60 py-2.5">
                  <div className="flex justify-between">
                    <span className="text-muted">Customer:</span>
                    <strong className="text-charcoal font-semibold">{o.customerName}</strong>
                  </div>
                  {o.businessName && (
                    <div className="flex justify-between">
                      <span className="text-muted">Shop:</span>
                      <span className="text-charcoal">{o.businessName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted">Quantity:</span>
                    <span className="text-charcoal font-medium">{o.totalPieces} pcs ({o.itemCount} items)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Grand Total:</span>
                    <span className="font-serif font-bold text-primary text-sm">
                      ₹{o.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="px-3 py-1.5 bg-primary text-white rounded text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Order</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
