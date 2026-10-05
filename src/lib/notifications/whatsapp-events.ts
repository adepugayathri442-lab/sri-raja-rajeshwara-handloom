/**
 * WhatsApp & n8n Event Dispatch Layer
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Secure, non-blocking event abstraction for dispatching wholesale order
 * and enquiry lifecycle events to n8n / Meta WhatsApp Business Cloud API.
 * 
 * Supported Events:
 * 1. ORDER_PLACED
 * 2. ORDER_CONFIRMED
 * 3. ORDER_PROCESSING
 * 4. ORDER_PACKED
 * 5. ORDER_SHIPPED
 * 6. ORDER_DELIVERED
 * 7. ORDER_CANCELLED
 * 8. WHOLESALE_ENQUIRY_CREATED
 * 
 * Guardrails:
 * - Purely non-blocking: never disrupts order placement or admin operations
 * - Client-safe: no secrets or private tokens in browser code
 * - Graceful fallback: functions safely if N8N_WHATSAPP_WEBHOOK_URL is unset
 * - Duplicate protection: built-in idempotency key generation
 */

export type WhatsAppEventType =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_PROCESSING'
  | 'ORDER_PACKED'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'WHOLESALE_ENQUIRY_CREATED';

export interface OrderWhatsAppEventPayload {
  event_type: WhatsAppEventType;
  idempotency_key: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_type: string;
  order_status: string;
  total_pieces: number;
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  payment_status: string;
  tracking_number: string | null;
  lr_number: string | null;
  transporter_name: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface WholesaleEnquiryWhatsAppEventPayload {
  event_type: 'WHOLESALE_ENQUIRY_CREATED';
  idempotency_key: string;
  enquiry_id: string;
  customer_name: string;
  business_name: string | null;
  customer_phone: string;
  customer_type: string;
  enquiry_message: string;
  created_at: string;
}

export type WhatsAppEventPayload =
  | OrderWhatsAppEventPayload
  | WholesaleEnquiryWhatsAppEventPayload;

export interface EmitWhatsAppResult {
  success: boolean;
  delivered?: boolean;
  duplicate?: boolean;
  reason?: string;
  error?: string;
}

/**
 * Dispatches an event payload through the secure Next.js server webhook route.
 * Non-blocking: catches all errors so caller operations are never interrupted.
 */
export async function emitWhatsAppEvent(
  payload: WhatsAppEventPayload
): Promise<EmitWhatsAppResult> {
  try {
    const res = await fetch('/api/webhooks/whatsapp-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('[WhatsApp Events] Webhook response notice:', res.status, errData);
      return { success: false, reason: `HTTP_${res.status}` };
    }

    const data = await res.json().catch(() => ({}));
    return { success: true, ...data };
  } catch (err: unknown) {
    // Non-blocking: never throw or block calling application code
    console.warn('[WhatsApp Events] Non-blocking dispatch notice:', err instanceof Error ? err.message : err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

/**
 * Convenience helper for emitting Order lifecycle events
 */
export async function emitWhatsAppOrderEvent(params: {
  eventType: WhatsAppEventType;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerType?: string;
  orderStatus: string;
  totalPieces: number;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentStatus: string;
  trackingNumber?: string | null;
  lrNumber?: string | null;
  transporterName?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt?: string;
}): Promise<EmitWhatsAppResult> {
  const idempotencyKey = `${params.orderId}_${params.eventType}_${params.orderStatus}`;

  const payload: OrderWhatsAppEventPayload = {
    event_type: params.eventType,
    idempotency_key: idempotencyKey,
    order_id: params.orderId,
    order_number: params.orderNumber,
    customer_name: params.customerName.trim() || 'Valued Merchant',
    customer_phone: params.customerPhone.trim() || '',
    customer_type: params.customerType || 'Retail Shop',
    order_status: params.orderStatus,
    total_pieces: params.totalPieces,
    subtotal: params.subtotal,
    delivery_charge: params.deliveryCharge,
    total_amount: params.totalAmount,
    payment_status: params.paymentStatus,
    tracking_number: params.trackingNumber?.trim() || null,
    lr_number: params.lrNumber?.trim() || null,
    transporter_name: params.transporterName?.trim() || null,
    shipped_at: params.shippedAt || null,
    delivered_at: params.deliveredAt || null,
    created_at: params.createdAt || new Date().toISOString(),
  };

  return emitWhatsAppEvent(payload);
}

/**
 * Convenience helper for emitting Wholesale Enquiry events
 */
export async function emitWhatsAppEnquiryEvent(params: {
  enquiryId: string;
  customerName: string;
  businessName?: string | null;
  customerPhone: string;
  customerType?: string;
  enquiryMessage?: string;
  createdAt?: string;
}): Promise<EmitWhatsAppResult> {
  const idempotencyKey = `${params.enquiryId}_WHOLESALE_ENQUIRY_CREATED`;

  const payload: WholesaleEnquiryWhatsAppEventPayload = {
    event_type: 'WHOLESALE_ENQUIRY_CREATED',
    idempotency_key: idempotencyKey,
    enquiry_id: params.enquiryId,
    customer_name: params.customerName.trim(),
    business_name: params.businessName?.trim() || null,
    customer_phone: params.customerPhone.trim(),
    customer_type: params.customerType || 'Wholesale Buyer',
    enquiry_message: params.enquiryMessage?.trim() || 'Wholesale enquiry submitted',
    created_at: params.createdAt || new Date().toISOString(),
  };

  return emitWhatsAppEvent(payload);
}
