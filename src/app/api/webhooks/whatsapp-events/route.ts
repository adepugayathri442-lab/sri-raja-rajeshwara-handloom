/**
 * Secure Server-Side WhatsApp & n8n Webhook Dispatch Route
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Route: POST /api/webhooks/whatsapp-events
 * 
 * Responsibilities:
 * - Secures webhook delivery on the server without exposing secrets to client code
 * - Validates incoming event payloads
 * - Prevents accidental duplicate notification deliveries (10-minute idempotency cache)
 * - Dispatches payload to n8n webhook (N8N_WHATSAPP_WEBHOOK_URL)
 * - Applies HMAC-SHA256 signature if N8N_WHATSAPP_WEBHOOK_SECRET is configured
 * - Graceful fallback: succeeds cleanly when webhook URL is not yet configured
 */

import { NextResponse, type NextRequest } from 'next/server';
import type { WhatsAppEventPayload } from '@/lib/notifications/whatsapp-events';

// In-memory deduplication cache (IdempotencyKey -> timestamp)
// Window: 10 minutes (600,000 ms)
const deliveredEventsCache = new Map<string, number>();
const DEDUPLICATION_WINDOW_MS = 10 * 60 * 1000;

function cleanupOldEvents() {
  const now = Date.now();
  for (const [key, timestamp] of deliveredEventsCache.entries()) {
    if (now - timestamp > DEDUPLICATION_WINDOW_MS) {
      deliveredEventsCache.delete(key);
    }
  }
}

async function computeHmacSha256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(request: NextRequest) {
  try {
    const payload: WhatsAppEventPayload = await request.json();

    // 1. Basic structural validation
    if (!payload || !payload.event_type || !payload.idempotency_key) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: missing event_type or idempotency_key' },
        { status: 400 }
      );
    }

    // 2. Duplicate Protection (Idempotency Check)
    cleanupOldEvents();
    const lastDelivered = deliveredEventsCache.get(payload.idempotency_key);
    if (lastDelivered && Date.now() - lastDelivered < DEDUPLICATION_WINDOW_MS) {
      return NextResponse.json({
        success: true,
        delivered: false,
        duplicate: true,
        reason: 'Duplicate event suppressed by idempotency protection',
        eventType: payload.event_type,
      });
    }

    // 3. Check for n8n Webhook URL
    const webhookUrl = process.env.N8N_WHATSAPP_WEBHOOK_URL;
    if (!webhookUrl || !webhookUrl.trim()) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[WhatsApp Events] N8N_WHATSAPP_WEBHOOK_URL not set. Event logged safely:`, payload.event_type);
      }
      return NextResponse.json({
        success: true,
        delivered: false,
        reason: 'N8N_WHATSAPP_WEBHOOK_URL is not configured',
        eventType: payload.event_type,
      });
    }

    // 4. Construct Headers
    const deliveryId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const payloadString = JSON.stringify(payload);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Sri-Raja-Rajeshwara-Handloom-Events/1.0',
      'X-Webhook-Event': payload.event_type,
      'X-Webhook-Delivery': deliveryId,
      'X-Webhook-Idempotency-Key': payload.idempotency_key,
      'X-Webhook-Timestamp': timestamp,
    };

    // 5. Optional HMAC Signature / Secret Authentication
    const webhookSecret = process.env.N8N_WHATSAPP_WEBHOOK_SECRET;
    if (webhookSecret && webhookSecret.trim()) {
      headers['X-Webhook-Secret'] = webhookSecret.trim();
      try {
        const signature = await computeHmacSha256(webhookSecret.trim(), payloadString);
        headers['X-Webhook-Signature-256'] = `sha256=${signature}`;
      } catch (cryptoErr) {
        console.warn('[WhatsApp Events] HMAC signature notice:', cryptoErr);
      }
    }

    // 6. Dispatch to n8n with 5s timeout
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: payloadString,
        signal: AbortSignal.timeout(5000),
      });

      // Mark delivered in idempotency cache
      deliveredEventsCache.set(payload.idempotency_key, Date.now());

      if (!response.ok) {
        console.warn(`[WhatsApp Events] n8n returned non-200 HTTP ${response.status} for ${payload.event_type}`);
        return NextResponse.json({
          success: true,
          delivered: false,
          httpStatus: response.status,
          eventType: payload.event_type,
        });
      }

      return NextResponse.json({
        success: true,
        delivered: true,
        deliveryId,
        eventType: payload.event_type,
      });
    } catch (networkErr: unknown) {
      console.warn('[WhatsApp Events] n8n delivery network notice:', networkErr instanceof Error ? networkErr.message : networkErr);
      return NextResponse.json({
        success: true,
        delivered: false,
        error: networkErr instanceof Error ? networkErr.message : 'Network timeout',
        eventType: payload.event_type,
      });
    }
  } catch (err: unknown) {
    console.error('[WhatsApp Events] Webhook route exception:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
