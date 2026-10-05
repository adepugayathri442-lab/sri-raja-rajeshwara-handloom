'use client';

/**
 * Customer Wholesale Order Detail & Consignment Tracking Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Live parcel tracking stepper:
 *   Order Placed -> Confirmed -> Processing -> Packed -> Shipped -> Delivered
 * - Current stage clearly highlighted with step status
 * - Explicit Cancelled state with notification
 * - Immutable line items snapshot display
 * - Consignment destination address
 * - Direct WhatsApp helpline button pre-filled with order ID
 * - Strict security: Authenticated user can ONLY see their own order
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  Truck,
  Printer,
} from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/auth-context';
import {
  getCustomerOrderById,
  type AdminOrderDetail,
} from '@/lib/supabase/admin-operations';
import type { OrderStatus } from '@/types';
import { businessConfig } from '@/config/business';

interface CustomerOrderDetailViewProps {
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

export function CustomerOrderDetailView({ orderId }: CustomerOrderDetailViewProps) {
  const { user } = useAuth();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(() => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    getCustomerOrderById(user.id, orderId)
      .then((data) => {
        if (!data) {
          setError(`Order record #${orderId} was not found or is not associated with your account.`);
        } else {
          setOrder(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load customer order:', err);
        setError('Could not retrieve order details from database.');
        setIsLoading(false);
      });
  }, [user, orderId]);

  useEffect(() => {
    if (!user) return;
    let ignore = false;
    getCustomerOrderById(user.id, orderId)
      .then((data) => {
        if (!ignore) {
          if (!data) {
            setError(`Order record #${orderId} was not found or is not associated with your account.`);
          } else {
            setOrder(data);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load customer order:', err);
          setError('Could not retrieve order details from database.');
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [user, orderId]);

  const isCancelled = order?.orderStatus === 'Cancelled';
  const currentStepIndex = order ? ORDER_STEPS.indexOf(order.orderStatus) : -1;

  const getWhatsAppHelpUrl = () => {
    if (!order) return '#';
    const text = encodeURIComponent(
      `Namaskaram Sri Raja Rajeshwara Handloom,\nI am inquiring about my wholesale order #${order.orderNumber} placed on ${new Date(order.createdAt).toLocaleDateString('en-IN')}.\nCurrent Status: ${order.orderStatus}.\nPlease share dispatch updates and transport LR details.`
    );
    return `https://wa.me/91${businessConfig.contact.phone}?text=${text}`;
  };

  return (
    <ProtectedRoute>
      <div className="py-10 sm:py-14 bg-cream min-h-[75vh]">
        <Container size="lg">
          {/* Back Navigation */}
          <div className="mb-6 flex items-center gap-2 text-xs text-muted">
            <Link href="/orders" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Wholesale Orders</span>
            </Link>
            <span>/</span>
            <span className="text-charcoal font-medium">Order #{order?.orderNumber || orderId}</span>
          </div>

          {isLoading ? (
            <Card variant="default" className="p-12 text-center border-border">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
              <p className="text-xs font-medium text-muted">Loading dispatch consignment details...</p>
            </Card>
          ) : error || !order ? (
            <Card variant="default" className="p-10 text-center border-rose-200 bg-rose-50/40">
              <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
              <h2 className="text-lg font-serif font-bold text-rose-900">Order Not Found</h2>
              <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">{error}</p>
              <div className="mt-5">
                <Button href="/orders" variant="outline" size="sm">
                  Return to Order History
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Header Card */}
              <Card variant="default" className="p-6 sm:p-7 border-border bg-surface shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="primary" size="sm">
                        Wholesale Consignment
                      </Badge>
                      <span className="text-xs text-muted font-mono">
                        ID: {order.orderNumber}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-serif font-bold text-primary">
                      Order #{order.orderNumber}
                    </h1>
                    <p className="text-xs text-muted mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Booked on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1.5">
                    <span className="text-[11px] text-muted font-medium">Consignment Status:</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
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
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-cream-100 text-charcoal border border-border'
                      }`}
                    >
                      {order.orderStatus === 'Delivered' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isCancelled ? (
                        <XCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {order.orderStatus}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={loadOrder}
                        className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-medium"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Refresh</span>
                      </button>
                      <span className="text-muted text-xs">•</span>
                      <button
                        onClick={() => window.print()}
                        className="text-xs text-muted hover:text-charcoal flex items-center gap-1 font-medium"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tracking Stepper */}
                <div className="pt-6">
                  <h2 className="text-xs font-serif font-bold text-primary uppercase tracking-wider mb-4">
                    Parcel Dispatch Progress
                  </h2>

                  {isCancelled ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-rose-800 text-xs">
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <div>
                        <strong className="block font-semibold">Order Cancelled</strong>
                        <span>This wholesale order was cancelled. Please contact the sales desk if you have any questions.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
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
                </div>

                {/* Consignment & Transport Tracking */}
                <div className="mt-6 pt-5 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-4 h-4 text-accent" />
                    <h3 className="text-xs font-serif font-bold text-primary uppercase tracking-wider">
                      Consignment & Freight Tracking
                    </h3>
                  </div>

                  {(order.transporterName || order.lrNumber || order.trackingNumber || order.shippedAt || order.deliveredAt) ? (
                    <div className="p-4 rounded-lg bg-surface-subtle border border-border space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {order.transporterName && (
                          <div>
                            <span className="text-[10px] text-muted uppercase block">Transporter Agency</span>
                            <strong className="text-primary font-medium">{order.transporterName}</strong>
                          </div>
                        )}
                        {order.lrNumber && (
                          <div>
                            <span className="text-[10px] text-muted uppercase block">LR / Bilti Number</span>
                            <strong className="font-mono text-charcoal">{order.lrNumber}</strong>
                          </div>
                        )}
                        {order.trackingNumber && (
                          <div>
                            <span className="text-[10px] text-muted uppercase block">Consignment Docket No.</span>
                            <strong className="font-mono text-charcoal">{order.trackingNumber}</strong>
                          </div>
                        )}
                        {order.shippedAt && (
                          <div>
                            <span className="text-[10px] text-muted uppercase block">Dispatched On</span>
                            <span>{new Date(order.shippedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        )}
                        {order.deliveredAt && (
                          <div>
                            <span className="text-[10px] text-muted uppercase block">Delivered On</span>
                            <span className="text-emerald-800 font-medium">{new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>

                      {order.deliveryNotes && (
                        <div className="pt-2 border-t border-border/60 text-[11px] text-charcoal/80">
                          <span className="font-semibold text-primary">Transport Note:</span> {order.deliveryNotes}
                        </div>
                      )}
                    </div>
                  ) : !isCancelled ? (
                    <div className="p-3.5 rounded-lg bg-surface-subtle/70 border border-border/80 flex items-center gap-2.5 text-xs text-muted">
                      <Clock className="w-4 h-4 text-accent shrink-0" />
                      <span>Tracking details will be updated after shipment.</span>
                    </div>
                  ) : null}
                </div>
              </Card>

              {/* 2-Column Details: Items (left) + Address & Support (right) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Items */}
                <div className="lg:col-span-2 space-y-6">
                  <Card variant="default" className="p-5 sm:p-6 border-border bg-surface">
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-accent" />
                        <h2 className="text-base font-serif font-bold text-primary">
                          Consignment Line Items ({order.items.length})
                        </h2>
                      </div>
                      <span className="text-xs font-semibold text-charcoal">
                        Total: {order.totalPieces} pieces
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border bg-surface-subtle/50 text-muted uppercase text-[10px] font-semibold">
                            <th className="py-2.5 px-3">Product Description</th>
                            <th className="py-2.5 px-3">SKU</th>
                            <th className="py-2.5 px-3 text-right">Fixed Rate</th>
                            <th className="py-2.5 px-3 text-right">Quantity</th>
                            <th className="py-2.5 px-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {order.items.map((item) => (
                            <tr key={item.id}>
                              <td className="py-3 px-3">
                                <span className="font-semibold text-charcoal block">
                                  {item.productNameSnapshot}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono text-[11px] text-primary">
                                {item.productCodeSnapshot}
                              </td>
                              <td className="py-3 px-3 text-right text-charcoal">
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

                    {/* Totals */}
                    <div className="mt-6 pt-4 border-t border-border space-y-2 text-xs">
                      <div className="flex justify-between text-muted">
                        <span>Subtotal (Fixed Piece Rates):</span>
                        <span className="font-medium text-charcoal">
                          ₹{order.subtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted">
                        <span>Delivery / Transport Charge:</span>
                        <span className="font-medium text-charcoal">
                          {order.deliveryCharge > 0
                            ? `₹${order.deliveryCharge.toLocaleString('en-IN')}`
                            : 'Manual freight arrangement (To-Pay / Bilti)'}
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
                </div>

                {/* Right Column: Address & Support */}
                <div className="space-y-6">
                  {/* Delivery Address */}
                  <Card variant="default" className="p-5 border-border bg-surface space-y-3">
                    <div className="flex items-center gap-2 pb-3 border-b border-border">
                      <MapPin className="w-4 h-4 text-accent" />
                      <h3 className="text-xs font-serif font-bold text-primary uppercase tracking-wider">
                        Delivery Destination
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
                      <p className="text-xs text-muted italic">
                        Delivery address not recorded on file.
                      </p>
                    )}
                  </Card>

                  {/* Payment & Channel Info */}
                  <Card variant="default" className="p-5 border-border bg-surface space-y-3">
                    <div className="flex items-center gap-2 pb-3 border-b border-border">
                      <CreditCard className="w-4 h-4 text-accent" />
                      <h3 className="text-xs font-serif font-bold text-primary uppercase tracking-wider">
                        Payment & Billing
                      </h3>
                    </div>

                    <div className="text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted">Payment Method:</span>
                        <span className="font-medium text-charcoal">
                          {order.paymentMethod === 'whatsapp_manual' ? 'WhatsApp / Bank Transfer' : 'Online Gateway'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted">Payment Status:</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            order.paymentStatus === 'Payment Received'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Merchant Helpline Support */}
                  <Card variant="default" className="p-5 border-accent/40 bg-accent/5 space-y-3">
                    <h3 className="text-xs font-serif font-bold text-primary">
                      Need Transport or Bilti Updates?
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">
                      Connect directly with Sri Raja Rajeshwara sales desk via WhatsApp for transport LR copies and booking details.
                    </p>
                    <a
                      href={getWhatsAppHelpUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Chat on WhatsApp ({businessConfig.contact.formattedPhone})</span>
                    </a>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </Container>
      </div>
    </ProtectedRoute>
  );
}
