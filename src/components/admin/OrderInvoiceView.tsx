'use client';

/**
 * Professional Wholesale B2B Tax / Commercial Invoice Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Formatted for standard A4 printing and PDF generation with authentic
 * Indian wholesale trade conventions, Deep Loom Emerald / Antique Gold identity,
 * and immutable historical order snapshot data.
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Printer, Download, ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { businessConfig } from '@/config/business';
import type { AdminOrderDetail } from '@/lib/supabase/admin-operations';

interface OrderInvoiceViewProps {
  order: AdminOrderDetail;
  autoPrint?: boolean;
}

export function OrderInvoiceView({ order, autoPrint = false }: OrderInvoiceViewProps) {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    // Modern browsers default to "Save as PDF" when window.print() is invoked
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-6 px-4 print:p-0 print:bg-white text-charcoal">
      {/* Top Floating Control Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden bg-surface p-4 rounded-xl border border-border shadow-xs">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/orders/${order.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover px-3 py-1.5 bg-surface-subtle rounded-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Order #{order.orderNumber}</span>
          </Link>
          <span className="text-xs text-muted">| Wholesale Tax / Trade Invoice</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Download Invoice (PDF)
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Invoice (A4)
          </Button>
        </div>
      </div>

      {/* A4 Printable Invoice Sheet */}
      <div
        id="wholesale-invoice-sheet"
        className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-md border border-neutral-200 print:shadow-none print:border-none print:p-0 print:max-w-none print:rounded-none"
        style={{ minHeight: '297mm' }}
      >
        {/* Top Accent Band (Visual Branding) */}
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary rounded-t print:rounded-none mb-6" />

        {/* 1. BUSINESS HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-primary/20">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-accent block mb-1">
              Wholesale Cloth Merchant • Estd. Nizamabad
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-primary tracking-tight">
              {businessConfig.name}
            </h1>
            <p className="text-xs font-serif italic text-muted mt-0.5">
              &ldquo;{businessConfig.tagline}&rdquo;
            </p>

            <div className="text-xs text-charcoal/80 mt-3 space-y-0.5 leading-relaxed">
              <p className="font-medium flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5 print:hidden" />
                <span>{businessConfig.contact.fullAddress}</span>
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs">
                <span className="flex items-center gap-1 font-semibold text-primary">
                  <Phone className="w-3 h-3 text-accent print:hidden" />
                  <span>Phone / WhatsApp: {businessConfig.contact.formattedPhone}</span>
                </span>
                <span className="flex items-center gap-1 text-muted">
                  <Mail className="w-3 h-3 text-accent print:hidden" />
                  <span>{businessConfig.contact.email}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Identity Badge */}
          <div className="sm:text-right bg-surface-subtle/80 print:bg-neutral-50 p-4 rounded-lg border border-border/80 min-w-[220px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted block mb-1">
              COMMERCIAL INVOICE
            </span>
            <div className="text-lg font-mono font-bold text-primary">
              #{order.orderNumber}
            </div>
            <div className="text-xs text-charcoal mt-1">
              Date: <strong className="font-semibold">{new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}</strong>
            </div>
            <div className="text-[11px] text-muted mt-1">
              Order Status: <strong className="text-primary font-medium">{order.orderStatus}</strong>
            </div>
            <div className="text-[11px] text-muted">
              Payment Status: <strong className="text-primary font-medium">{order.paymentStatus}</strong>
            </div>
            <div className="text-[11px] text-muted">
              Payment Mode: <strong>{order.paymentMethod === 'whatsapp_manual' ? 'WhatsApp / Bank Wire' : 'Online Gateway'}</strong>
            </div>
          </div>
        </div>

        {/* 2. CUSTOMER & CONSIGNMENT DESTINATION INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-border/80 text-xs">
          {/* Billed To / Trade Buyer */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent block">
              BILLED TO (MERCHANT / SHOP)
            </span>
            {order.businessName && (
              <h2 className="text-sm font-serif font-bold text-primary">
                {order.businessName}
              </h2>
            )}
            <div className="font-semibold text-charcoal">{order.customerName}</div>
            <div className="text-muted">Customer Type: <span className="font-medium text-charcoal">{order.customerType}</span></div>
            <div className="text-muted">Contact: <span className="font-medium text-charcoal">{order.customerPhone}</span></div>
            <div className="text-muted">Email: <span className="font-medium text-charcoal">{order.customerEmail}</span></div>
            {order.gstNumber ? (
              <div className="pt-1 text-primary font-mono text-xs">
                GSTIN: <strong>{order.gstNumber}</strong>
              </div>
            ) : null}
          </div>

          {/* Consignment Destination / Transport */}
          <div className="space-y-1.5 sm:border-l sm:border-border/60 sm:pl-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent block">
              CONSIGNMENT DESTINATION
            </span>
            {order.address ? (
              <div className="space-y-1 leading-relaxed text-charcoal/90">
                <div className="font-semibold text-primary">{order.address.name}</div>
                <div>{order.address.addressLine1}</div>
                {order.address.addressLine2 && <div>{order.address.addressLine2}</div>}
                {order.address.landmark && (
                  <div className="text-[11px] text-muted">Near: {order.address.landmark}</div>
                )}
                <div className="font-bold text-charcoal">
                  {order.address.city}, {order.address.state} — {order.address.pincode}
                </div>
                <div className="text-muted">Phone: {order.address.phone}</div>
              </div>
            ) : (
              <div className="text-muted italic">
                Direct Counter Wholesale / Self Pickup at Nizamabad Godown.
              </div>
            )}

            {/* Logistics Snapshot if available */}
            {(order.transporterName || order.lrNumber || order.trackingNumber) && (
              <div className="mt-3 pt-2 border-t border-dashed border-border/80 text-[11px] space-y-0.5">
                {order.transporterName && (
                  <div>Transport: <strong className="text-primary">{order.transporterName}</strong></div>
                )}
                {order.lrNumber && (
                  <div>LR / Bilti No: <strong className="font-mono text-primary">{order.lrNumber}</strong></div>
                )}
                {order.trackingNumber && (
                  <div>Consignment Docket: <strong className="font-mono">{order.trackingNumber}</strong></div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. ITEM TABLE (HISTORICAL ORDER SNAPSHOT) */}
        <div className="py-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-y-2 border-primary bg-primary/5 text-primary text-[11px] font-serif font-bold uppercase tracking-wider">
                <th className="py-3 px-2 text-center w-12">S.No</th>
                <th className="py-3 px-3">Product Description</th>
                <th className="py-3 px-3">SKU / Code</th>
                <th className="py-3 px-3 text-right">Quantity</th>
                <th className="py-3 px-3 text-right">Rate / Pc (₹)</th>
                <th className="py-3 px-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {order.items.map((item, index) => (
                <tr key={item.id} className="text-charcoal break-inside-avoid">
                  <td className="py-3 px-2 text-center text-muted font-mono">
                    {index + 1}
                  </td>
                  <td className="py-3 px-3">
                    <strong className="font-semibold text-charcoal block">
                      {item.productNameSnapshot}
                    </strong>
                    <span className="text-[10px] text-muted">
                      Wholesale traditional textile goods
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-primary text-[11px]">
                    {item.productCodeSnapshot}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-primary">
                    {item.quantity} pcs
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    ₹{item.pricePerPiece.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-charcoal">
                    ₹{item.lineTotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. TOTALS & SUMMARY SECTION */}
        <div className="border-t-2 border-primary/20 pt-4 flex flex-col sm:flex-row justify-between items-start gap-6 text-xs break-inside-avoid">
          {/* Left: Wholesale Terms & Declaration */}
          <div className="space-y-2 sm:max-w-md text-[11px] text-muted leading-relaxed">
            <h3 className="font-serif font-bold text-primary uppercase tracking-wider text-[10px]">
              Terms of Wholesale Supply:
            </h3>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Wholesale merchandise sold strictly in standard piece packs.</li>
              <li>Goods once dispatched travel at merchant&apos;s risk via chosen transporter.</li>
              <li>Any shortage/transit discrepancies must be reported with Bilti verification within 24 hours.</li>
              <li>Subject to Nizamabad, Telangana jurisdiction only.</li>
            </ul>
          </div>

          {/* Right: Financial Totals Box */}
          <div className="w-full sm:w-72 bg-surface-subtle/80 print:bg-neutral-50 p-4 rounded-lg border border-border/80 space-y-2.5">
            <div className="flex justify-between text-charcoal">
              <span>Total Quantity:</span>
              <strong className="text-primary font-semibold">{order.totalPieces} pieces</strong>
            </div>
            <div className="flex justify-between text-charcoal">
              <span>Subtotal:</span>
              <span className="font-medium">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-charcoal">
              <span>Delivery / Freight:</span>
              <span className="font-medium">
                {order.deliveryCharge > 0
                  ? `₹${order.deliveryCharge.toLocaleString('en-IN')}`
                  : 'Freight To-Pay'}
              </span>
            </div>
            <div className="pt-2 border-t-2 border-primary flex justify-between items-baseline">
              <span className="font-serif font-bold text-sm text-primary uppercase">Grand Total:</span>
              <span className="font-serif font-bold text-lg text-primary">
                ₹{order.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* 5. AUTHORIZED SIGNATURE */}
        <div className="mt-12 pt-8 border-t border-border flex justify-between items-end text-xs break-inside-avoid">
          <div className="text-[11px] text-muted">
            <p>Computer-generated wholesale invoice.</p>
            <p>Sri Raja Rajeshwara Handloom • Nizamabad</p>
          </div>

          <div className="text-center min-w-[200px]">
            <div className="border-b border-charcoal/40 pb-12 mb-1" />
            <span className="font-serif font-bold text-primary block text-[11px]">
              For SRI RAJA RAJESHWARA HANDLOOM
            </span>
            <span className="text-[10px] text-muted uppercase">Authorized Signatory</span>
          </div>
        </div>
      </div>
    </div>
  );
}
