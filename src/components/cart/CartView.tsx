'use client';

/**
 * Wholesale Cart Interactive View
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Rules:
 * - 100% Wholesale: Single fixed rate per piece.
 * - Item total = pricePerPiece * quantity.
 * - No quantity-based pricing tiers or discounts.
 * - Supports guest merchants and authenticated users.
 * - Direct WhatsApp order generation option.
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingBag, 
  ArrowRight, 
  Trash2, 
  Minus, 
  Plus, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  Layers, 
  Package 
} from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useCart } from '@/lib/cart/cart-context';
import { getGeneralEnquiryUrl, buildWhatsAppUrl } from '@/lib/whatsapp';
import { businessConfig } from '@/config/business';
import { validateCartWithLiveCatalog, type CartValidationResult } from '@/lib/supabase/admin-catalog';
import { AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export function CartView() {
  const { items, updateQuantity, removeItem, clearCart, syncCartItems, totalPieces, subtotal } = useCart();

  const [validation, setValidation] = React.useState<CartValidationResult | null>(null);
  const [isValidating, setIsValidating] = React.useState<boolean>(false);

  // Validate items against live Supabase database
  React.useEffect(() => {
    if (items.length === 0) return;

    let isMounted = true;
    const itemsToValidate = items.map((i) => ({
      productId: i.productId,
      pricePerPiece: i.pricePerPiece,
      quantity: i.quantity,
    }));

    validateCartWithLiveCatalog(itemsToValidate).then((res) => {
      if (isMounted) {
        setValidation(res);
        setIsValidating(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [items]);

  const activeValidation = items.length > 0 ? validation : null;

  // Synchronise cart items with live verified rates & stock
  const handleSyncWithLiveRates = () => {
    if (!validation) return;
    const liveMap = new Map(validation.items.map((i) => [i.productId, i]));

    const updated = items
      .filter((item) => {
        const live = liveMap.get(item.productId);
        return live && live.isActive;
      })
      .map((item) => {
        const live = liveMap.get(item.productId);
        if (!live) return item;
        const validQty = Math.max(1, Math.min(item.quantity, live.availableStock > 0 ? live.availableStock : 1));
        return {
          ...item,
          pricePerPiece: live.newPrice > 0 ? live.newPrice : item.pricePerPiece,
          quantity: validQty,
        };
      });

    syncCartItems(updated);
  };

  const emptyWhatsappHref = getGeneralEnquiryUrl('I would like to place a wholesale order directly.');

  // Build WhatsApp order confirmation link from current cart items
  const buildCartWhatsAppUrl = () => {
    const lines = [
      `Business: SRI RAJA RAJESHWARA HANDLOOM`,
      `Wholesale Cart Order Enquiry`,
      ``,
      `Items Requested:`,
      ...items.map(
        (item, idx) =>
          `${idx + 1}. ${item.name} (${item.productCode}) — ${item.quantity} pcs @ ₹${item.pricePerPiece.toLocaleString('en-IN')}/pc = ₹${(item.pricePerPiece * item.quantity).toLocaleString('en-IN')}`
      ),
      ``,
      `Total Pieces: ${totalPieces} pcs`,
      `Estimated Subtotal: ₹${subtotal.toLocaleString('en-IN')}`,
      `Delivery: To be calculated based on destination transport`,
      ``,
      `Please confirm availability, parcel transport charges, and dispatch time.`,
    ];
    return buildWhatsAppUrl(lines.join('\n'));
  };

  // --------------------------------------------------------------------------
  // EMPTY CART STATE
  // --------------------------------------------------------------------------
  if (items.length === 0) {
    return (
      <div className="py-12 sm:py-20 bg-cream/40 min-h-[75vh]">
        <Container size="lg">
          <div className="mb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 mb-2">
              <Badge variant="primary" size="sm">
                100% Wholesale Dispatch
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
              Wholesale Cart
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Fixed wholesale rates apply per piece across any quantity required for your business.
            </p>
          </div>

          <Card variant="default" className="p-8 sm:p-14 text-center border-border shadow-xs bg-surface">
            <div className="w-16 h-16 rounded-full bg-surface-subtle text-primary flex items-center justify-center mx-auto mb-4 border border-border">
              <ShoppingBag className="w-8 h-8 text-muted" />
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary">
              Your Wholesale Cart is Currently Empty
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
              Explore our wholesale textile catalogue to select authentic towels, lungies, traditional cloth, dhoties, or shawls. All items feature one transparent wholesale rate per piece.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Button
                href="/products"
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Browse Wholesale Products
              </Button>

              <Button
                href={emptyWhatsappHref}
                isExternal
                variant="whatsapp"
                size="md"
                leftIcon={<MessageCircle className="w-4 h-4 fill-current" />}
              >
                Order via WhatsApp ({businessConfig.contact.formattedPhone})
              </Button>
            </div>

            {/* Wholesale Guarantees in Empty Cart */}
            <div className="mt-12 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted text-left max-w-xl mx-auto">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Fixed wholesale piece rate. No minimum quantity penalty.</span>
              </div>
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>Pan-India transport parcel dispatch from Nizamabad.</span>
              </div>
              <div className="flex items-start gap-2">
                <Layers className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Trial batch or large bulk bales at uniform rates.</span>
              </div>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ACTIVE CART STATE WITH ITEMS
  // --------------------------------------------------------------------------
  return (
    <div className="py-10 sm:py-16 bg-cream/30 min-h-screen">
      <Container size="xl">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-1.5">
              <Badge variant="primary" size="sm">
                Wholesale Commercial Dispatch
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
              Wholesale Order Cart ({totalPieces} Pieces)
            </h1>
            <p className="text-xs text-muted mt-1">
              Uniform wholesale piece rates applied. Delivery charge calculated based on actual transport weight.
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="self-start sm:self-center text-xs text-rose-600 hover:text-rose-800 font-medium inline-flex items-center gap-1.5 py-1 px-2.5 rounded hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>

        {/* Cart Grid Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Live Catalog Price & Stock Validation Banner */}
            {isValidating && (
              <div className="p-3 bg-surface border border-accent/40 rounded-xl text-xs text-muted flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent" />
                <span>Verifying live piece rates and warehouse stock against database...</span>
              </div>
            )}

            {activeValidation && !activeValidation.isValid && (
              <div className="p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <h4 className="font-serif font-bold text-amber-950 text-sm">
                      Live Catalog Price & Inventory Notice
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      One or more products in your cart have updated piece rates, altered stock, or changed availability in the wholesale catalogue. Please review and sync before order submission.
                    </p>
                  </div>
                </div>

                {/* List of discrepancies */}
                <div className="bg-white/80 rounded-lg p-3 border border-amber-200/80 space-y-2 text-xs">
                  {activeValidation.items.filter((i) => i.priceChanged || i.stockIssue || !i.isActive).map((issue) => (
                    <div key={issue.productId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-amber-100 pb-1.5 last:border-b-0 last:pb-0">
                      <div>
                        <strong className="text-charcoal font-semibold">{issue.productName}</strong>{' '}
                        <span className="text-[11px] text-muted">({issue.productCode})</span>
                      </div>
                      <span className="text-amber-900 font-medium text-[11px]">
                        {issue.statusMessage}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-amber-800">
                    Click sync to update your cart to verified live rates.
                  </span>
                  <button
                    type="button"
                    onClick={handleSyncWithLiveRates}
                    className="px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-hover transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Sync Cart to Live Verified Rates</span>
                  </button>
                </div>
              </div>
            )}

            {activeValidation && activeValidation.isValid && !isValidating && (
              <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200/80 rounded-lg text-[11px] text-emerald-800 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>All cart items verified against live Supabase catalog rates and available inventory.</span>
              </div>
            )}

            {items.map((item) => {
              const itemTotal = item.pricePerPiece * item.quantity;

              return (
                <div
                  key={item.productId}
                  className="bg-surface rounded-xl border border-border p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-2xs hover:border-accent/60 transition-colors"
                >
                  {/* Thumbnail + Details */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-surface-subtle rounded-lg border border-border overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-cream text-primary/50">
                          <Package className="w-7 h-7" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {item.productCode && (
                        <span className="text-[10px] font-mono text-muted uppercase block">
                          SKU: {item.productCode}
                        </span>
                      )}
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-sm sm:text-base font-serif font-bold text-primary hover:text-accent transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <div className="text-xs text-muted mt-1">
                        Wholesale Rate:{' '}
                        <strong className="text-charcoal font-semibold">
                          ₹{item.pricePerPiece.toLocaleString('en-IN')}
                        </strong>{' '}
                        / piece
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper + Item Total + Remove */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50 shrink-0">
                    {/* Stepper */}
                    <div className="inline-flex items-center bg-surface-subtle border border-border rounded-lg shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-2 text-charcoal hover:bg-surface-border transition-colors rounded-l-lg"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.productId, parseInt(e.target.value) || 1)
                        }
                        className="w-12 py-1 text-center text-xs font-bold text-primary bg-transparent focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-2 text-charcoal hover:bg-surface-border transition-colors rounded-r-lg"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Item Total Value */}
                    <div className="text-right min-w-[80px]">
                      <span className="text-[10px] text-muted block">Item Total</span>
                      <span className="text-sm sm:text-base font-bold text-primary">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Delete Item */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-muted hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      title="Remove item from wholesale order"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Back to Catalog Link */}
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-accent transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                <span>Add More Wholesale Items from Catalogue</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <Card variant="default" className="p-6 bg-surface border-border shadow-xs space-y-5">
              <h3 className="text-lg font-serif font-bold text-primary pb-3 border-b border-border">
                Wholesale Order Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-charcoal">
                  <span>Total Wholesale Pieces:</span>
                  <strong className="font-semibold text-primary">{totalPieces} pcs</strong>
                </div>

                <div className="flex justify-between text-charcoal">
                  <span>Subtotal (Fixed Rates):</span>
                  <strong className="font-semibold text-primary">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </strong>
                </div>

                <div className="flex justify-between items-start text-muted pt-2 border-t border-border/60">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-accent shrink-0" />
                    Delivery Logistics:
                  </span>
                  <span className="text-right text-[11px] font-medium text-charcoal/80">
                    Billed Separately at Actuals
                  </span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Parcel freight / transport bilti charges are calculated according to destination pin code & parcel weight across India.
                </p>

                {/* Single Piece Rate Rule */}
                <div className="p-3 bg-cream/70 rounded-lg border border-border/80 text-[11px] text-charcoal space-y-1">
                  <div className="font-semibold text-primary flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    <span>No Bulk Tier Penalties</span>
                  </div>
                  <p className="text-muted leading-relaxed">
                    Sri Raja Rajeshwara Handloom guarantees fixed rates per piece whether ordering trial samples or bulk stock.
                  </p>
                </div>

                {/* Grand Total */}
                <div className="pt-3 border-t-2 border-primary/10 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs uppercase font-bold text-muted block">
                      Estimated Subtotal
                    </span>
                    <span className="text-xs text-muted">(Excl. Transport)</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {activeValidation && !activeValidation.isValid ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                    onClick={handleSyncWithLiveRates}
                    leftIcon={<RefreshCw className="w-4 h-4 text-amber-700" />}
                  >
                    Sync Live Rates to Order
                  </Button>
                ) : (
                  <Button
                    href="/checkout"
                    variant="primary"
                    size="lg"
                    className="w-full shadow-md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Proceed to Wholesale Order
                  </Button>
                )}

                <Button
                  href={buildCartWhatsAppUrl()}
                  isExternal
                  variant="whatsapp"
                  size="md"
                  className="w-full"
                  leftIcon={<MessageCircle className="w-4 h-4 fill-current" />}
                >
                  Confirm Cart on WhatsApp
                </Button>
              </div>

              {/* Security & Logistics Badges */}
              <div className="pt-4 border-t border-border text-[11px] text-muted space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Verified wholesale cloth merchant supply</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Direct transport parcel dispatch from Nizamabad</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
