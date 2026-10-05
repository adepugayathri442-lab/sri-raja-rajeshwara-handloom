'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  MessageCircle,
  ShieldCheck,
  ArrowLeft,
  Truck,
  Lock,
  LogIn,
  UserPlus,
  Info,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/cart/cart-context';
import { businessConfig } from '@/config/business';
import { getOrderEnquiryUrl } from '@/lib/whatsapp';
import { createWholesaleOrder } from '@/lib/supabase/admin-operations';
import { calculateDeliveryCharge, type DeliveryCalculationResult } from '@/lib/supabase/admin-delivery';

const COMMON_INDIAN_STATES = [
  'Telangana',
  'Andhra Pradesh',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Kerala',
  'Gujarat',
  'Madhya Pradesh',
  'Rajasthan',
  'Uttar Pradesh',
  'Delhi',
  'West Bengal',
  'Odisha',
  'Bihar',
  'Punjab',
  'Haryana',
  'Chhattisgarh',
  'Jharkhand',
  'Assam',
  'Goa',
];

export function CheckoutPlaceholder() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user, profile } = useAuth();
  const { items, subtotal, totalPieces, clearCart } = useCart();

  // Address and delivery state
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Telangana');
  const [pincode, setPincode] = useState('');
  const [transportPreference, setTransportPreference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'whatsapp_manual' | 'online_payment'>('whatsapp_manual');

  // Real-time Delivery Charge Calculation
  const [deliveryResult, setDeliveryResult] = useState<DeliveryCalculationResult | null>(null);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const effectiveRecipientName = recipientName || profile?.fullName || '';
  const effectiveRecipientPhone = recipientPhone || profile?.phone || '';
  const effectiveBusinessName = businessName || profile?.businessName || '';

  const handleStateChange = (newState: string) => {
    setState(newState);
    setIsCalculatingDelivery(true);
  };

  // Calculate delivery charge whenever destination state or total piece count changes
  useEffect(() => {
    let isCurrent = true;

    calculateDeliveryCharge(state, totalPieces)
      .then((res) => {
        if (isCurrent) {
          setDeliveryResult(res);
          setIsCalculatingDelivery(false);
        }
      })
      .catch((err) => {
        console.error('Error calculating delivery charge:', err);
        if (isCurrent) {
          setDeliveryResult({
            charge: 0,
            ruleApplied: 'Separate Transport Freight',
            baseCharge: 0,
            perPieceCharge: 0,
            hasActiveRule: false,
          });
          setIsCalculatingDelivery(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [state, totalPieces]);

  const hasActiveDeliveryRule = Boolean(deliveryResult?.hasActiveRule);
  const deliveryChargeAmount = deliveryResult && deliveryResult.hasActiveRule ? deliveryResult.charge : 0;
  const grandTotalAmount = subtotal + deliveryChargeAmount;

  // If customer is not authenticated, require login/register at checkout
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="py-12 sm:py-16 bg-cream min-h-[75vh]">
        <Container size="md">
          <div className="mb-6 flex items-center gap-2 text-xs text-muted">
            <Link href="/cart" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Cart</span>
            </Link>
            <span>/</span>
            <span className="text-charcoal font-medium">B2B Checkout</span>
          </div>

          <Card variant="default" className="p-8 sm:p-12 text-center border-accent/30 bg-surface shadow-xs">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Lock className="w-7 h-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 mb-2">
              <Badge variant="primary" size="sm">
                Wholesale Security
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
              Merchant Login Required at Checkout
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-charcoal/75 max-w-md mx-auto leading-relaxed">
              Customers can browse products and add items to cart freely. To confirm wholesale billing details, delivery transport, and place orders, please sign in or register your business account.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login?redirect=/checkout" className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full" leftIcon={<LogIn className="w-4 h-4" />}>
                  Sign In to Account
                </Button>
              </Link>
              <Link href="/register?redirect=/checkout" className="w-full sm:w-auto">
                <Button variant="outline" size="md" className="w-full" leftIcon={<UserPlus className="w-4 h-4" />}>
                  Register New Wholesale Account
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  // If cart is empty
  if (!authLoading && items.length === 0) {
    return (
      <div className="py-12 sm:py-16 bg-cream min-h-[75vh]">
        <Container size="md">
          <Card variant="default" className="p-10 sm:p-14 text-center border-border bg-surface">
            <div className="w-16 h-16 rounded-full bg-cream-100 text-muted flex items-center justify-center mx-auto mb-4 border border-border">
              <ShoppingBag className="w-8 h-8 text-muted" />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary">
              Your Wholesale Cart is Empty
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
              Please select wholesale handloom or powerloom products from our catalog before proceeding to consignment checkout.
            </p>
            <div className="mt-6 flex justify-center">
              <Button href="/products" variant="primary" size="md">
                Browse Wholesale Products
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  // Handle Order Submission
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!effectiveRecipientName.trim()) {
      setErrorMessage('Please provide the receiver contact name.');
      return;
    }
    if (!effectiveRecipientPhone.trim()) {
      setErrorMessage('Please provide the contact phone number.');
      return;
    }
    if (!addressLine1.trim()) {
      setErrorMessage('Please enter the shop or godown address.');
      return;
    }
    if (!city.trim() || !pincode.trim()) {
      setErrorMessage('Please enter city and 6-digit PIN code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const orderPayload = {
        userId: user.id,
        customerName: effectiveRecipientName.trim(),
        phone: effectiveRecipientPhone.trim(),
        businessName: effectiveBusinessName.trim() || undefined,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        landmark: transportPreference ? `Transport: ${transportPreference.trim()}` : undefined,
        paymentMethod: paymentMethod,
        customerNotes: transportPreference ? `Transport Preference: ${transportPreference.trim()}` : undefined,
        deliveryCharge: deliveryChargeAmount,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          productCode: item.productCode,
          pricePerPiece: item.pricePerPiece,
          quantity: item.quantity,
        })),
      };

      const result = await createWholesaleOrder(orderPayload);

      if (!result.success || !result.orderId) {
        setErrorMessage(result.error || 'Failed to record wholesale order in database.');
        setIsSubmitting(false);
        return;
      }

      // Order created successfully! Clear the cart
      clearCart();

      // If WhatsApp manual flow, open WhatsApp with order information
      if (paymentMethod === 'whatsapp_manual') {
        const fullAddress = [
          effectiveBusinessName ? `Shop: ${effectiveBusinessName}` : '',
          addressLine1,
          addressLine2,
          `${city} - ${pincode}`,
          state,
          transportPreference ? `Preferred Transport: ${transportPreference}` : '',
        ]
          .filter(Boolean)
          .join(', ');

        const whatsappUrl = getOrderEnquiryUrl({
          orderNumber: result.orderNumber || result.orderId,
          items: items.map((i) => ({
            productName: i.name,
            productCode: i.productCode,
            quantity: i.quantity,
            pricePerPiece: i.pricePerPiece,
            lineTotal: i.pricePerPiece * i.quantity,
          })),
          subtotal,
          deliveryCharge: hasActiveDeliveryRule ? deliveryChargeAmount : null,
          grandTotal: hasActiveDeliveryRule ? grandTotalAmount : subtotal,
          customerName: effectiveRecipientName,
          phone: effectiveRecipientPhone,
          deliveryAddress: fullAddress,
          notes: transportPreference,
        });

        window.open(whatsappUrl, '_blank');
      }

      // Navigate to customer order tracking page
      router.push(`/orders/${result.orderId}`);
    } catch (err: unknown) {
      console.error('Order creation failed:', err);
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred during order confirmation.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 sm:py-14 bg-cream min-h-[75vh]">
      <Container size="lg">
        {/* Navigation back */}
        <div className="mb-6 flex items-center gap-2 text-xs text-muted">
          <Link href="/cart" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Cart</span>
          </Link>
          <span>/</span>
          <span className="text-charcoal font-medium">B2B Order Checkout</span>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Badge variant="primary" size="sm">
              Wholesale Dispatch Gateway
            </Badge>
            <Badge variant="accent" size="sm">
              Verified Buyer: {profile?.fullName || user?.email}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            Wholesale Order & Dispatch Confirmation
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            All prices are fixed wholesale piece rates. Delivery charges are calculated dynamically based on your destination state and order volume.
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleConfirmOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Delivery & Buyer Details (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Buyer & Destination Address */}
              <Card variant="default" className="p-6 sm:p-7 border-border bg-surface">
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border">
                  <Truck className="w-5 h-5 text-accent" />
                  <h2 className="text-base font-serif font-bold text-primary">
                    1. Consignment Destination & Transport Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-charcoal mb-1">
                      Contact / Receiver Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={effectiveRecipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-charcoal focus:border-accent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal mb-1">
                      Contact Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={effectiveRecipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-charcoal focus:border-accent outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-charcoal mb-1">
                      Business / Store Name
                    </label>
                    <input
                      type="text"
                      value={effectiveBusinessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Sri Balaji Handloom Store"
                      className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-charcoal focus:border-accent outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-charcoal mb-1">
                      Shop / Godown Address (Line 1) *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="e.g. Door No. 4-2-110, Cloth Market Street"
                      className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-charcoal focus:border-accent outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-charcoal mb-1">
                      Landmark / Locality (Line 2)
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="e.g. Near Old Bus Stand"
                      className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-charcoal focus:border-accent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal mb-1">
                      City / Town *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Nizamabad / Hyderabad"
                      className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-charcoal focus:border-accent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 503001"
                      className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-charcoal focus:border-accent outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-charcoal mb-1">
                      Destination State / UT *
                    </label>
                    <input
                      type="text"
                      required
                      list="destination-states"
                      value={state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      placeholder="Select or enter destination state"
                      className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-charcoal focus:border-accent outline-none"
                    />
                    <datalist id="destination-states">
                      {COMMON_INDIAN_STATES.map((st) => (
                        <option key={st} value={st} />
                      ))}
                    </datalist>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-charcoal mb-1">
                      Preferred Parcel / Transport Service <span className="text-muted font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={transportPreference}
                      onChange={(e) => setTransportPreference(e.target.value)}
                      placeholder="e.g. VRL Logistics, Navata Road Transport, TSRTC Cargo, BMPS, Kranti"
                      className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-md text-charcoal focus:border-accent outline-none"
                    />
                  </div>
                </div>
              </Card>

              {/* Payment Method Selection */}
              <Card variant="default" className="p-6 sm:p-7 border-border bg-surface">
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border">
                  <CreditCard className="w-5 h-5 text-accent" />
                  <h2 className="text-base font-serif font-bold text-primary">
                    2. Select Payment Channel
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Method 1: WhatsApp / Manual Payment */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-lg border cursor-pointer transition-colors ${
                      paymentMethod === 'whatsapp_manual'
                        ? 'border-accent bg-accent/5 ring-1 ring-accent'
                        : 'border-border bg-surface-subtle hover:border-accent/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="whatsapp_manual"
                      checked={paymentMethod === 'whatsapp_manual'}
                      onChange={() => setPaymentMethod('whatsapp_manual')}
                      className="mt-1 text-primary focus:ring-accent"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-primary">
                          WhatsApp / Direct Bank Transfer (NEFT/RTGS/UPI)
                        </span>
                        <Badge variant="accent" size="sm">
                          Recommended
                        </Badge>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">
                        Confirm order and book parcel directly with Sri Raja Rajeshwara sales desk. You will receive an official order number, parcel transport bilti tracking, and bank payment instructions.
                      </p>
                    </div>
                  </label>

                  {/* Method 2: Online Payment Gateway */}
                  <label
                    className="flex items-start gap-3.5 p-4 rounded-lg border border-border bg-surface-subtle opacity-70 cursor-not-allowed"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online_payment"
                      disabled
                      checked={paymentMethod === 'online_payment'}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-charcoal">
                          Online Payment Gateway (UPI / Net Banking / Cards)
                        </span>
                        <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          Provider Setup Pending
                        </span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">
                        Direct gateway integration will be configured in a future phase.
                      </p>
                    </div>
                  </label>
                </div>
              </Card>
            </div>

            {/* Right Column: Order Summary & Placement (1 col) */}
            <div className="space-y-6">
              <Card variant="default" className="p-6 border-accent/30 bg-surface shadow-2xs space-y-4">
                <h3 className="font-serif font-bold text-primary text-base pb-3 border-b border-border">
                  Wholesale Order Summary
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted">
                    <span>Total Pieces:</span>
                    <span className="font-semibold text-charcoal">{totalPieces} pcs</span>
                  </div>

                  <div className="flex justify-between text-muted">
                    <span>Subtotal (Fixed Rates):</span>
                    <span className="font-semibold text-charcoal">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-start text-muted">
                    <div>
                      <span>Transport / Delivery Charge:</span>
                      {hasActiveDeliveryRule && deliveryResult?.ruleApplied && (
                        <span className="text-[10px] text-muted block mt-0.5">
                          Rule: {deliveryResult.ruleApplied}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      {isCalculatingDelivery ? (
                        <span className="text-xs text-muted flex items-center gap-1 justify-end">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Calculating...</span>
                        </span>
                      ) : hasActiveDeliveryRule && deliveryResult ? (
                        <div>
                          <span className="font-semibold text-charcoal">
                            ₹{deliveryChargeAmount.toLocaleString('en-IN')}
                          </span>
                          {deliveryChargeAmount > 0 && deliveryResult.baseCharge > 0 && (
                            <span className="block text-[10px] text-muted">
                              (Base ₹{deliveryResult.baseCharge} + ₹{deliveryResult.perPieceCharge} for {totalPieces} pcs)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="font-medium text-amber-800 text-xs">
                          To be confirmed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Transport Delivery Notice if no active rule exists */}
                  {!isCalculatingDelivery && !hasActiveDeliveryRule && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-md text-[11px] text-amber-900 leading-relaxed space-y-1">
                      <div className="flex items-start gap-1.5 font-semibold">
                        <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span>Transport Charges:</span>
                      </div>
                      <p>
                        Transport charges will be confirmed separately by our wholesale desk.
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border flex justify-between items-baseline">
                    <span className="font-serif font-bold text-primary text-sm">Grand Total:</span>
                    <div className="text-right">
                      <div className="font-serif font-bold text-primary text-lg">
                        ₹{grandTotalAmount.toLocaleString('en-IN')}
                      </div>
                      {!hasActiveDeliveryRule && (
                        <span className="text-[10px] text-muted">+ Transport Freight</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={isSubmitting}
                    leftIcon={
                      isSubmitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageCircle className="w-4 h-4 fill-current" />
                      )
                    }
                  >
                    {isSubmitting ? 'Recording Order...' : 'Confirm Wholesale Order'}
                  </Button>
                  <p className="text-[11px] text-muted text-center mt-2">
                    Merchant helpline: <span className="font-semibold text-primary">{businessConfig.contact.formattedPhone}</span>
                  </p>
                </div>
              </Card>

              {/* Wholesale Guarantees */}
              <div className="p-4 bg-surface rounded-lg border border-border text-xs space-y-2 text-muted">
                <div className="flex items-center gap-2 text-charcoal font-semibold">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>Wholesale Guarantees</span>
                </div>
                <p>• 100% authentic handloom and powerloom products</p>
                <p>• B2B fixed piece rate (₹ / piece)</p>
                <p>• Bilti / LR receipt provided for parcel tracking</p>
                <p>• Safe stock reservation on confirmed order</p>
              </div>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
