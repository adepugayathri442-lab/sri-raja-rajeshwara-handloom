'use client';

/**
 * Admin Payments Management & Wholesale Billing Ledger Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Real-time payments ledger derived from `public.orders`
 * - KPI summary cards: Total Value, Payments Received, Pending, Failed, Refunded
 * - Filtering by payment status, payment method, date range, and search
 * - Safe status update dropdown calling `updateAdminPaymentStatus`
 * - Desktop ledger table and mobile card stack
 * - Direct deep links to `/admin/orders/[id]`
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  X,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  getAdminPaymentLedger,
  updateAdminPaymentStatus,
  type AdminPaymentLedgerItem,
  type AdminPaymentSummary,
  type GetPaymentLedgerOptions,
} from '@/lib/supabase/admin-payments';
import type { PaymentStatus, PaymentMethod } from '@/types';

export function AdminPaymentsView() {
  const [items, setItems] = useState<AdminPaymentLedgerItem[]>([]);
  const [summary, setSummary] = useState<AdminPaymentSummary>({
    totalOrderValue: 0,
    paymentsReceivedTotal: 0,
    paymentsPendingTotal: 0,
    paymentsFailedTotal: 0,
    refundedTotal: 0,
    totalTransactionsCount: 0,
    receivedCount: 0,
    pendingCount: 0,
    failedCount: 0,
    refundedCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | 'all'>('all');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | 'all'>('all');
  const [dateRange, setDateRange] = useState<GetPaymentLedgerOptions['dateRange']>('all');

  // Updating status tracker
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadLedger = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminPaymentLedger({
        search,
        paymentStatus,
        paymentMethod,
        dateRange,
      });
      setItems(res.items);
      setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load payments ledger:', err);
      setError('Unable to load payment records from database.');
    } finally {
      setIsLoading(false);
    }
  }, [search, paymentStatus, paymentMethod, dateRange]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadLedger();
    }, 300);
    return () => clearTimeout(handler);
  }, [loadLedger]);

  const handleStatusChange = async (orderId: string, newStatus: PaymentStatus) => {
    setUpdatingOrderId(orderId);
    setFeedback(null);

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.orderId === orderId ? { ...i, paymentStatus: newStatus } : i))
    );

    const res = await updateAdminPaymentStatus(orderId, newStatus);
    setUpdatingOrderId(null);

    if (res.success) {
      setFeedback({
        message: `Payment status updated to "${newStatus}".`,
        type: 'success',
      });
      loadLedger();
    } else {
      setFeedback({
        message: res.error || 'Failed to update payment status.',
        type: 'error',
      });
      loadLedger();
    }
  };

  const clearFilters = () => {
    setSearch('');
    setPaymentStatus('all');
    setPaymentMethod('all');
    setDateRange('all');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted mb-1">
            <Link href="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <span className="text-primary font-medium">Payments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            Payments Ledger & Billing Desk
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Monitor wholesale invoice settlements, verify bank NEFT/UPI transfers, and update billing statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLedger}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-muted hover:text-charcoal text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Order Value */}
        <Card variant="default" className="p-4 bg-surface border-border">
          <span className="text-xs text-muted font-medium block">Total Invoiced</span>
          <div className="text-xl font-serif font-bold text-primary mt-1">
            ₹{summary.totalOrderValue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-muted">
            {summary.totalTransactionsCount} wholesale orders
          </span>
        </Card>

        {/* Payments Received */}
        <Card variant="default" className="p-4 bg-emerald-50/40 border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-800 font-semibold block">Received</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-serif font-bold text-emerald-800 mt-1">
            ₹{summary.paymentsReceivedTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-700">
            {summary.receivedCount} paid orders
          </span>
        </Card>

        {/* Pending Payments */}
        <Card variant="default" className="p-4 bg-amber-50/40 border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-800 font-semibold block">Pending</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-serif font-bold text-amber-800 mt-1">
            ₹{summary.paymentsPendingTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-amber-700">
            {summary.pendingCount} awaiting payment
          </span>
        </Card>

        {/* Failed Payments */}
        <Card variant="default" className="p-4 bg-rose-50/40 border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-800 font-semibold block">Failed</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-serif font-bold text-rose-800 mt-1">
            ₹{summary.paymentsFailedTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-rose-700">
            {summary.failedCount} unfulfilled transactions
          </span>
        </Card>

        {/* Refunded */}
        <Card variant="default" className="p-4 bg-slate-50 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-700 font-semibold block">Refunded</span>
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-xl font-serif font-bold text-slate-800 mt-1">
            ₹{summary.refundedTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-600">
            {summary.refundedCount} reversed transactions
          </span>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card variant="default" className="p-4 sm:p-5 border-border bg-surface shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, buyer, shop..."
              className="w-full pl-9 pr-9 py-2 bg-surface-subtle border border-border rounded-lg text-xs text-charcoal focus:border-accent focus:bg-surface outline-none transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus | 'all')}
              aria-label="Filter by Payment Status"
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-xs text-charcoal font-medium focus:border-accent outline-none cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Payment Received">Payment Received</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          {/* Method Filter */}
          <div>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod | 'all')}
              aria-label="Filter by Payment Method"
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-xs text-charcoal font-medium focus:border-accent outline-none cursor-pointer"
            >
              <option value="all">All Payment Channels</option>
              <option value="whatsapp_manual">WhatsApp / Manual Trade</option>
              <option value="online_payment">Online Gateway</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as GetPaymentLedgerOptions['dateRange'])}
              aria-label="Filter by Date Range"
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-xs text-charcoal font-medium focus:border-accent outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted">
          <span>
            Showing <strong className="text-primary">{items.length}</strong> transactions
          </span>
          {(search || paymentStatus !== 'all' || paymentMethod !== 'all' || dateRange !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Content */}
      {isLoading ? (
        <Card variant="default" className="p-12 text-center border-border">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-muted">Loading payments ledger...</p>
        </Card>
      ) : error ? (
        <Card variant="default" className="p-8 text-center border-rose-200 bg-rose-50/40">
          <p className="text-xs text-rose-700">{error}</p>
          <Button variant="outline" size="sm" onClick={loadLedger} className="mt-3">
            Retry
          </Button>
        </Card>
      ) : items.length === 0 ? (
        <Card variant="default" className="p-12 text-center border-border">
          <CreditCard className="w-10 h-10 text-muted/60 mx-auto mb-3" />
          <h2 className="text-base font-serif font-bold text-primary">No payment records found</h2>
          <p className="text-xs text-muted max-w-sm mx-auto mt-1">
            {search || paymentStatus !== 'all' || paymentMethod !== 'all' || dateRange !== 'all'
              ? 'Try modifying your search or filter parameters.'
              : 'Customer wholesale orders will appear here automatically with their settlement status.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block bg-surface border border-border rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border text-muted font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Buyer & Shop</th>
                    <th className="py-3 px-4">Order Date</th>
                    <th className="py-3 px-4 text-right">Invoice Amount</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Order Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {items.map((i) => (
                    <tr key={i.orderId} className="hover:bg-cream/40 transition-colors">
                      {/* Order Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-primary">
                        <Link href={`/admin/orders/${i.orderId}`} className="hover:text-accent">
                          {i.orderNumber}
                        </Link>
                      </td>

                      {/* Buyer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-charcoal">{i.customerName}</div>
                        {i.businessName && (
                          <div className="text-[11px] text-muted">{i.businessName}</div>
                        )}
                        <div className="text-[10px] text-muted">{i.customerPhone}</div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-muted whitespace-nowrap">
                        {new Date(i.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Grand Total */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-serif font-bold text-primary text-sm">
                          ₹{i.grandTotal.toLocaleString('en-IN')}
                        </span>
                        {i.deliveryCharge > 0 && (
                          <span className="text-[10px] text-muted block">
                            (incl. ₹{i.deliveryCharge} freight)
                          </span>
                        )}
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-subtle border border-border text-charcoal">
                          {i.paymentMethod === 'whatsapp_manual' ? (
                            <>
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                              <span>WhatsApp / Manual</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-3 h-3 text-primary" />
                              <span>Online Gateway</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={i.paymentStatus}
                          disabled={updatingOrderId === i.orderId}
                          onChange={(e) =>
                            handleStatusChange(i.orderId, e.target.value as PaymentStatus)
                          }
                          aria-label={`Change payment status for ${i.orderNumber}`}
                          className={`text-xs font-semibold px-2 py-1 rounded border outline-none cursor-pointer ${
                            i.paymentStatus === 'Payment Received'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : i.paymentStatus === 'Failed'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : i.paymentStatus === 'Refunded'
                              ? 'bg-slate-50 text-slate-800 border-slate-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Payment Received">Payment Received</option>
                          <option value="Failed">Failed</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </td>

                      {/* Order Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                          {i.orderStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${i.orderId}`}
                          className="px-2.5 py-1 bg-surface-subtle hover:bg-surface-border border border-border rounded text-[11px] font-semibold text-primary inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Order Details</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Stack */}
          <div className="md:hidden space-y-3">
            {items.map((i) => (
              <div
                key={i.orderId}
                className="bg-surface border border-border rounded-xl p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/admin/orders/${i.orderId}`}
                      className="font-mono font-bold text-sm text-primary hover:text-accent"
                    >
                      {i.orderNumber}
                    </Link>
                    <p className="text-xs font-semibold text-charcoal mt-0.5">
                      {i.customerName}
                    </p>
                    {i.businessName && (
                      <p className="text-[11px] text-muted">{i.businessName}</p>
                    )}
                  </div>
                  <span className="font-serif font-bold text-base text-primary">
                    ₹{i.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-muted text-[11px]">Payment Status:</span>
                  <select
                    value={i.paymentStatus}
                    disabled={updatingOrderId === i.orderId}
                    onChange={(e) =>
                      handleStatusChange(i.orderId, e.target.value as PaymentStatus)
                    }
                    className="text-xs font-semibold px-2 py-1 rounded border outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Payment Received">Payment Received</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-muted">
                    {new Date(i.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <Link
                    href={`/admin/orders/${i.orderId}`}
                    className="text-primary hover:text-accent font-semibold text-xs inline-flex items-center gap-1"
                  >
                    <span>View Order</span>
                    <ExternalLink className="w-3 h-3" />
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
