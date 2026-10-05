'use client';

/**
 * Admin Order Detail View Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Complete order details inspection (Customer, Delivery, Items, Payment)
 * - Safe status transition workflow (Order Placed -> Confirmed -> Processing -> Packed -> Shipped -> Delivered)
 * - Safe cancellation with stock restoration logic
 * - Payment status updates
 * - Immutable historical line-item snapshots
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  AlertCircle,
  XCircle,
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Printer,
  ChevronRight,
  Download,
  Save,
  MessageCircle,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  getAdminOrderById,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
  updateAdminOrderTracking,
  type AdminOrderDetail,
} from '@/lib/supabase/admin-operations';
import type { OrderStatus, PaymentStatus } from '@/types';
import { businessConfig } from '@/config/business';

interface AdminOrderDetailViewProps {
  orderId: string;
}

const ORDER_STEPS: OrderStatus[] = [
  'Order Placed',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Delivered',
];

export function AdminOrderDetailView({ orderId }: AdminOrderDetailViewProps) {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Tracking Form State
  const [transporterName, setTransporterName] = useState('');
  const [lrNumber, setLrNumber] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippedAt, setShippedAt] = useState('');
  const [deliveredAt, setDeliveredAt] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [trackingSaving, setTrackingSaving] = useState(false);
  const [trackingFeedback, setTrackingFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Populate tracking state from fetched order
  const syncTrackingForm = (data: AdminOrderDetail) => {
    setTransporterName(data.transporterName || '');
    setLrNumber(data.lrNumber || '');
    setTrackingNumber(data.trackingNumber || '');
    setShippedAt(data.shippedAt ? data.shippedAt.slice(0, 10) : '');
    setDeliveredAt(data.deliveredAt ? data.deliveredAt.slice(0, 10) : '');
    setDeliveryNotes(data.deliveryNotes || '');
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setTrackingSaving(true);
    setTrackingFeedback(null);

    const res = await updateAdminOrderTracking(order.id, {
      transporterName,
      lrNumber,
      trackingNumber,
      shippedAt: shippedAt ? new Date(shippedAt).toISOString() : null,
      deliveredAt: deliveredAt ? new Date(deliveredAt).toISOString() : null,
      deliveryNotes,
    });

    setTrackingSaving(false);
    if (res.success) {
      setTrackingFeedback({
        message: 'Logistics and consignment tracking updated successfully.',
        type: 'success',
      });
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              transporterName,
              lrNumber,
              trackingNumber,
              shippedAt: shippedAt ? new Date(shippedAt).toISOString() : null,
              deliveredAt: deliveredAt ? new Date(deliveredAt).toISOString() : null,
              deliveryNotes,
            }
          : null
      );
    } else {
      setTrackingFeedback({
        message: res.error || 'Failed to save tracking details.',
        type: 'error',
      });
    }
  };

  const handleClearTracking = async () => {
    if (!order) return;
    if (!window.confirm('Clear all consignment transporter, LR, and tracking entries for this order?')) {
      return;
    }
    setTrackingSaving(true);
    setTrackingFeedback(null);

    const res = await updateAdminOrderTracking(order.id, {
      transporterName: null,
      lrNumber: null,
      trackingNumber: null,
      shippedAt: null,
      deliveredAt: null,
      deliveryNotes: null,
    });

    setTrackingSaving(false);
    if (res.success) {
      setTransporterName('');
      setLrNumber('');
      setTrackingNumber('');
      setShippedAt('');
      setDeliveredAt('');
      setDeliveryNotes('');
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              transporterName: null,
              lrNumber: null,
              trackingNumber: null,
              shippedAt: null,
              deliveredAt: null,
              deliveryNotes: null,
            }
          : null
      );
      setTrackingFeedback({
        message: 'Consignment tracking details cleared.',
        type: 'success',
      });
    } else {
      setTrackingFeedback({
        message: res.error || 'Failed to clear tracking.',
        type: 'error',
      });
    }
  };

  const handleShareTrackingWhatsApp = () => {
    if (!order) return;
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const recipientPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    let message = `Namaste ${order.customerName} ji,\n\n` +
      `Update regarding your wholesale consignment *#${order.orderNumber}* from *${businessConfig.name}*:\n` +
      `Order Status: *${order.orderStatus}*\n`;

    if (transporterName.trim()) {
      message += `Transporter / Courier: *${transporterName.trim()}*\n`;
    }
    if (lrNumber.trim()) {
      message += `LR / Bilti Number: *${lrNumber.trim()}*\n`;
    }
    if (trackingNumber.trim()) {
      message += `Consignment Docket No: *${trackingNumber.trim()}*\n`;
    }
    if (shippedAt) {
      message += `Dispatch Date: *${new Date(shippedAt).toLocaleDateString('en-IN')}*\n`;
    }
    if (deliveryNotes.trim()) {
      message += `Transport Remarks: ${deliveryNotes.trim()}\n`;
    }

    message += `\nFor dispatch or delivery support, contact us at ${businessConfig.contact.formattedPhone}.\nThank you for choosing Sri Raja Rajeshwara Handloom!`;

    const encodedMsg = encodeURIComponent(message);
    const url = recipientPhone.length >= 10
      ? `https://wa.me/${recipientPhone}?text=${encodedMsg}`
      : `https://wa.me/?text=${encodedMsg}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const loadOrder = useCallback(() => {
    setIsLoading(true);
    setError(null);
    getAdminOrderById(orderId)
      .then((data) => {
        if (!data) {
          setError(`Wholesale order not found for ID "${orderId}".`);
        } else {
          setOrder(data);
          syncTrackingForm(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load order:', err);
        setError('Could not retrieve order details from database.');
        setIsLoading(false);
      });
  }, [orderId]);

  useEffect(() => {
    let ignore = false;
    getAdminOrderById(orderId)
      .then((data) => {
        if (!ignore) {
          if (!data) {
            setError(`Wholesale order not found for ID "${orderId}".`);
          } else {
            setOrder(data);
            syncTrackingForm(data);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load order:', err);
          setError('Could not retrieve order details from database.');
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [orderId]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    if (order.orderStatus === newStatus) return;

    if (newStatus === 'Cancelled') {
      const confirmCancel = window.confirm(
        'Are you sure you want to cancel this order? This will restore reserved stock pieces back to warehouse inventory.'
      );
      if (!confirmCancel) return;
    }

    setActionLoading(true);
    setStatusFeedback(null);

    try {
      const result = await updateAdminOrderStatus(order.id, newStatus, order.orderStatus);
      if (result.success) {
        const nowIso = new Date().toISOString();
        const nowDay = nowIso.slice(0, 10);
        let updatedShippedAt = order.shippedAt;
        let updatedDeliveredAt = order.deliveredAt;

        if (newStatus === 'Shipped' && !order.shippedAt) {
          updatedShippedAt = nowIso;
          setShippedAt(nowDay);
        }
        if (newStatus === 'Delivered' && !order.deliveredAt) {
          updatedDeliveredAt = nowIso;
          setDeliveredAt(nowDay);
        }

        setOrder((prev) =>
          prev
            ? {
                ...prev,
                orderStatus: newStatus,
                shippedAt: updatedShippedAt,
                deliveredAt: updatedDeliveredAt,
              }
            : null
        );
        setStatusFeedback({
          message: `Order status successfully updated to "${newStatus}".`,
          type: 'success',
        });
      } else {
        setStatusFeedback({
          message: result.error || 'Failed to update order status.',
          type: 'error',
        });
      }
    } catch (err: unknown) {
      setStatusFeedback({
        message: err instanceof Error ? err.message : 'An unexpected error occurred.',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus: PaymentStatus) => {
    if (!order) return;
    if (order.paymentStatus === newPaymentStatus) return;

    setActionLoading(true);
    setStatusFeedback(null);

    try {
      const result = await updateAdminPaymentStatus(order.id, newPaymentStatus);
      if (result.success) {
        setOrder((prev) => (prev ? { ...prev, paymentStatus: newPaymentStatus } : null));
        setStatusFeedback({
          message: `Payment status updated to "${newPaymentStatus}".`,
          type: 'success',
        });
      } else {
        setStatusFeedback({
          message: result.error || 'Failed to update payment status.',
          type: 'error',
        });
      }
    } catch (err: unknown) {
      setStatusFeedback({
        message: err instanceof Error ? err.message : 'An unexpected error occurred.',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Link href="/admin/orders" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
        </div>
        <Card variant="default" className="p-12 text-center border-border">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-charcoal">Loading wholesale order details...</p>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Link href="/admin/orders" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
        </div>
        <Card variant="default" className="p-10 text-center border-rose-200 bg-rose-50/40">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h2 className="text-lg font-serif font-bold text-rose-900">Order Record Error</h2>
          <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">{error || 'Order record could not be loaded.'}</p>
          <div className="mt-5">
            <Button href="/admin/orders" variant="outline" size="sm">
              Return to Orders List
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'Cancelled';
  const currentStepIndex = ORDER_STEPS.indexOf(order.orderStatus);

  // Determine next sequential step
  let nextStep: OrderStatus | null = null;
  if (!isCancelled && currentStepIndex >= 0 && currentStepIndex < ORDER_STEPS.length - 1) {
    nextStep = ORDER_STEPS[currentStepIndex + 1];
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Link href="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <Link href="/admin/orders" className="hover:text-primary">Orders</Link>
            <span>/</span>
            <span className="text-charcoal font-medium">{order.orderNumber}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
              Order #{order.orderNumber}
            </h1>
            {/* Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                order.orderStatus === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : order.orderStatus === 'Shipped'
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                  : order.orderStatus === 'Packed'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : order.orderStatus === 'Processing'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : order.orderStatus === 'Confirmed'
                  ? 'bg-teal-100 text-teal-800 border border-teal-300'
                  : order.orderStatus === 'Cancelled'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-cream-100 text-charcoal border border-border'
              }`}
            >
              {order.orderStatus === 'Delivered' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : order.orderStatus === 'Cancelled' ? (
                <XCircle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {order.orderStatus}
            </span>

            {/* Payment Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                order.paymentStatus === 'Payment Received'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : order.paymentStatus === 'Refunded'
                  ? 'bg-slate-100 text-slate-800 border border-slate-300'
                  : order.paymentStatus === 'Failed'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Payment: {order.paymentStatus}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span>•</span>
            <span>Channel: {order.paymentMethod === 'whatsapp_manual' ? 'WhatsApp / Manual Trade' : 'Online Gateway'}</span>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/orders/${order.id}/invoice`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-surface text-charcoal border border-border rounded-md hover:bg-surface-subtle transition-colors shadow-2xs"
            title="View & Download PDF Invoice"
          >
            <Download className="w-3.5 h-3.5 text-muted" />
            <span>Download Invoice</span>
          </Link>
          <Link
            href={`/admin/orders/${order.id}/invoice?action=print`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-primary text-white rounded-md hover:bg-primary-hover transition-colors shadow-2xs"
            title="Direct print A4 Wholesale Invoice"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-surface text-muted border border-border rounded-md hover:bg-surface-subtle hover:text-charcoal transition-colors"
            title="Quick print summary"
          >
            <Printer className="w-3.5 h-3.5 text-muted" />
            <span>Print Slip</span>
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrder}
            disabled={actionLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Feedback Notice */}
      {statusFeedback && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
            statusFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{statusFeedback.message}</span>
          <button
            onClick={() => setStatusFeedback(null)}
            className="text-muted hover:text-charcoal text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Order Status Stepper & Workflow Bar */}
      <Card variant="default" className="p-5 sm:p-6 border-accent/30 bg-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-border">
          <div>
            <h2 className="text-sm font-serif font-bold text-primary uppercase tracking-wider">
              Order Fulfillment Lifecycle
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Advance consignment through standard wholesale verification and transport stages.
            </p>
          </div>

          {/* Quick Transition Action Button */}
          <div className="flex flex-wrap items-center gap-2">
            {nextStep && (
              <Button
                variant="primary"
                size="sm"
                disabled={actionLoading}
                onClick={() => handleStatusChange(nextStep as OrderStatus)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Mark as &ldquo;{nextStep}&rdquo;
              </Button>
            )}

            {/* Quick Cancel button */}
            {!isCancelled && order.orderStatus !== 'Delivered' && (
              <Button
                variant="outline"
                size="sm"
                disabled={actionLoading}
                onClick={() => handleStatusChange('Cancelled')}
                className="text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        {/* Stepper Visual */}
        {isCancelled ? (
          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-lg flex items-center gap-3 text-rose-800 text-xs">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-semibold block">Order Has Been Cancelled</span>
              <span className="text-rose-700">
                Reserved pieces have been safely restored to warehouse inventory. No further dispatch actions are applicable.
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
            {ORDER_STEPS.map((step, idx) => {
              const isCompleted = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    isCurrent
                      ? 'border-accent bg-accent/10 ring-2 ring-accent/30'
                      : isCompleted
                      ? 'border-emerald-300 bg-emerald-50/60 text-emerald-900'
                      : 'border-border bg-surface-subtle text-muted opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    ) : isCurrent ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                    ) : (
                      <span className="text-[10px] font-mono text-muted">{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`block text-[11px] font-semibold ${
                      isCurrent ? 'text-primary' : isCompleted ? 'text-emerald-900' : 'text-charcoal/70'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Manual Status Override Selectors */}
        <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-charcoal">Override Order Status:</span>
            <select
              value={order.orderStatus}
              disabled={actionLoading}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              aria-label="Override Order Status"
              className="px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-charcoal font-medium focus:border-accent outline-none"
            >
              {ORDER_STEPS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-charcoal">Update Payment Status:</span>
            <select
              value={order.paymentStatus}
              disabled={actionLoading}
              onChange={(e) => handlePaymentStatusChange(e.target.value as PaymentStatus)}
              aria-label="Update Payment Status"
              className="px-2.5 py-1.5 bg-surface-subtle border border-border rounded-md text-charcoal font-medium focus:border-accent outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="Payment Received">Payment Received</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Consignment Logistics, Transporter & Bilti Tracking Section */}
      <Card variant="default" className="p-5 sm:p-6 border-accent/40 bg-surface shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent/15 text-accent">
              <Truck className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold text-primary uppercase tracking-wider">
                Consignment Delivery & Transport Tracking
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Record transporter agency, Lorry Receipt (LR) / Bilti number, and share dispatch details with merchant.
              </p>
            </div>
          </div>

          {/* Action buttons in tracking header */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShareTrackingWhatsApp}
              disabled={!transporterName.trim() && !lrNumber.trim() && !trackingNumber.trim()}
              className="text-emerald-800 hover:bg-emerald-50 border-emerald-300"
              leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-700" />}
            >
              Share Tracking on WhatsApp
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearTracking}
              disabled={trackingSaving || (!order.transporterName && !order.lrNumber && !order.trackingNumber)}
              className="text-muted hover:text-rose-700"
            >
              Clear Tracking
            </Button>
          </div>
        </div>

        {/* Tracking Feedback alert */}
        {trackingFeedback && (
          <div
            className={`p-3 rounded-lg border text-xs font-medium mb-4 flex items-center justify-between ${
              trackingFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span>{trackingFeedback.message}</span>
            <button
              onClick={() => setTrackingFeedback(null)}
              className="text-muted hover:text-charcoal ml-3 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tracking Form */}
        <form onSubmit={handleSaveTracking} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Transporter / Courier */}
            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Transporter / Courier Name
              </label>
              <input
                type="text"
                placeholder="e.g. Navata Road Transport, VRL, DTDC..."
                value={transporterName}
                onChange={(e) => setTransporterName(e.target.value)}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent"
              />
            </div>

            {/* LR / Bilti Number */}
            <div>
              <label className="block font-semibold text-charcoal mb-1">
                LR / Bilti Number
              </label>
              <input
                type="text"
                placeholder="e.g. NVT-NZB-98421"
                value={lrNumber}
                onChange={(e) => setLrNumber(e.target.value)}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal font-mono focus:outline-none focus:border-accent"
              />
            </div>

            {/* Tracking Number / Docket */}
            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Docket / Waybill / Tracking No.
              </label>
              <input
                type="text"
                placeholder="e.g. 50300188219"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal font-mono focus:outline-none focus:border-accent"
              />
            </div>

            {/* Shipped Date */}
            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Dispatch / Shipped Date
              </label>
              <input
                type="date"
                value={shippedAt}
                onChange={(e) => setShippedAt(e.target.value)}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent"
              />
            </div>

            {/* Delivered Date */}
            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Delivery Receipt Date
              </label>
              <input
                type="date"
                value={deliveredAt}
                onChange={(e) => setDeliveredAt(e.target.value)}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent"
              />
            </div>

            {/* Delivery Notes */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block font-semibold text-charcoal mb-1">
                Transport / Godown Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Destination hub pickup, freight to-pay..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={trackingSaving}
              leftIcon={trackingSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            >
              {trackingSaving ? 'Saving...' : 'Save Tracking Details'}
            </Button>
          </div>
        </form>
      </Card>

      {/* 2-Column Layout: Left (Items + Totals) / Right (Customer + Address) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Line Items & Pricing (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="default" className="p-5 sm:p-6 border-border bg-surface">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-accent" />
                <h2 className="text-base font-serif font-bold text-primary">
                  Consignment Line Items ({order.items.length} {order.items.length === 1 ? 'Product' : 'Products'})
                </h2>
              </div>
              <span className="text-xs font-medium text-muted">
                Total Pieces: <strong className="text-primary">{order.totalPieces} pcs</strong>
              </span>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted font-medium bg-surface-subtle/50">
                    <th className="py-2.5 px-3">Product Description</th>
                    <th className="py-2.5 px-3">SKU / Code</th>
                    <th className="py-2.5 px-3 text-right">Fixed Rate / Piece</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Item Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-subtle/30">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-charcoal block">
                          {item.productNameSnapshot}
                        </span>
                        <span className="text-[10px] text-muted">
                          Snapshot captured at time of order placement
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-primary">
                        {item.productCodeSnapshot}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-charcoal">
                        ₹{item.pricePerPiece.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-primary">
                        {item.quantity} pcs
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-charcoal">
                        ₹{item.lineTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="mt-6 pt-4 border-t border-border space-y-2 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal (Fixed Wholesale Rates):</span>
                <span className="font-medium text-charcoal">
                  ₹{order.subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Consignment Delivery / Freight Charge:</span>
                <span className="font-medium text-charcoal">
                  {order.deliveryCharge > 0
                    ? `₹${order.deliveryCharge.toLocaleString('en-IN')}`
                    : 'Manual transport arrangement (Freight To-Pay / Separate Bilti)'}
                </span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-baseline">
                <span className="text-sm font-serif font-bold text-primary">Grand Total:</span>
                <span className="text-lg font-serif font-bold text-primary">
                  ₹{order.grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </Card>

          {/* Customer / Transport Notes */}
          {order.customerNotes && (
            <Card variant="default" className="p-5 border-border bg-amber-50/50">
              <h3 className="text-xs font-serif font-bold text-amber-900 mb-1">
                Order Notes & Transport Preference
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                {order.customerNotes}
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Customer Profile & Delivery Address (1 col) */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <Card variant="default" className="p-5 border-border bg-surface space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-serif font-bold text-primary uppercase tracking-wider">
                  Merchant Customer
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {order.customerType}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-charcoal">
              {order.businessName && (
                <div>
                  <span className="text-[11px] text-muted block">Business / Store Name</span>
                  <strong className="text-primary text-sm font-serif">{order.businessName}</strong>
                </div>
              )}

              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-muted shrink-0" />
                <span>{order.customerName}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-muted shrink-0" />
                <a href={`tel:${order.customerPhone}`} className="hover:text-primary">
                  {order.customerPhone}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-muted shrink-0" />
                <a href={`mailto:${order.customerEmail}`} className="hover:text-primary truncate">
                  {order.customerEmail}
                </a>
              </div>
            </div>
          </Card>

          {/* Delivery Address Card */}
          <Card variant="default" className="p-5 border-border bg-surface space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Truck className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-serif font-bold text-primary uppercase tracking-wider">
                Consignment Destination
              </h3>
            </div>

            {order.address ? (
              <div className="text-xs space-y-1.5 text-charcoal">
                <div className="font-semibold text-primary">{order.address.name}</div>
                <div className="text-muted">{order.address.phone}</div>
                <div className="pt-1 text-muted leading-relaxed">
                  <p>{order.address.addressLine1}</p>
                  {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                  {order.address.landmark && <p className="italic text-[11px]">Near: {order.address.landmark}</p>}
                  <p className="font-semibold text-charcoal pt-1">
                    {order.address.city}, {order.address.state} — {order.address.pincode}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted italic">
                <MapPin className="w-4 h-4 text-muted mb-1" />
                <p>Delivery address not recorded on file (Self-pickup or counter wholesale trade).</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
