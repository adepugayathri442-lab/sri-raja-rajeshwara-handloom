/**
 * Payment Service Implementations
 * Sri Raja Rajeshwara Handloom
 */

import { businessConfig } from '@/config/business';
import { getOrderEnquiryUrl } from '@/lib/whatsapp';
import type { IPaymentProvider, PaymentInitiationParams, PaymentInitiationResult } from './types';

/**
 * Channel 1: WhatsApp / Manual Payment Provider
 * In accordance with business rules:
 * - Payment status is ALWAYS 'Pending' upon submission.
 * - Manual payments must NEVER automatically become 'Payment Received'.
 * - Only an admin can mark manual payment as received in the admin portal.
 */
export class WhatsAppManualPaymentProvider implements IPaymentProvider {
  readonly id = 'whatsapp_manual' as const;
  readonly displayName = 'WhatsApp / Manual Payment & Bilti Confirmation';
  readonly description = 'Confirm wholesale order directly with our sales desk on WhatsApp. Pay via direct Bank NEFT/RTGS or UPI.';
  readonly isConfigured = true;

  async initiatePayment(params: PaymentInitiationParams): Promise<PaymentInitiationResult> {
    const whatsappUrl = getOrderEnquiryUrl({
      orderNumber: params.orderNumber,
      items: [], // Will be populated with snapshot items
      subtotal: params.amount,
      deliveryCharge: null, // Manual calculation
      grandTotal: params.amount,
      customerName: params.customerName,
      phone: params.customerPhone,
      deliveryAddress: params.deliveryAddress,
      notes: params.notes,
    });

    return {
      success: true,
      paymentMethod: 'whatsapp_manual',
      paymentStatus: 'Pending', // Strictly pending until admin verification
      redirectUrl: whatsappUrl,
      instructions: `Please send this order summary to Sri Raja Rajeshwara Handloom on WhatsApp (${businessConfig.contact.formattedPhone}) to finalize parcel transport and payment confirmation.`,
    };
  }
}

/**
 * Channel 2: Online Payment Provider (Abstracted Provider: "Other")
 * Clean abstraction ready for payment provider (UPI / Razorpay / Net Banking) integration.
 * Currently disabled until production provider keys are selected and configured.
 */
export class OnlinePaymentProvider implements IPaymentProvider {
  readonly id = 'online_payment' as const;
  readonly displayName = 'Online Payment Gateway (UPI / Net Banking / Cards)';
  readonly description = 'Pay securely online with instant order confirmation and automated GST invoice generation.';
  readonly isConfigured = businessConfig.status.isPaymentGatewayConfigured; // false initially

  async initiatePayment(params: PaymentInitiationParams): Promise<PaymentInitiationResult> {
    if (!this.isConfigured) {
      return {
        success: false,
        paymentMethod: 'online_payment',
        paymentStatus: 'Pending',
        transactionReference: params.orderNumber,
        error: 'Online payment gateway provider is currently being configured for Sri Raja Rajeshwara Handloom. Please select WhatsApp / Manual Payment for instant order placement.',
      };
    }

    // Provider integration hook (Phase 3)
    return {
      success: false,
      paymentMethod: 'online_payment',
      paymentStatus: 'Pending',
      error: 'Online payment provider configuration pending.',
    };
  }
}

export const paymentProviders = {
  manual: new WhatsAppManualPaymentProvider(),
  online: new OnlinePaymentProvider(),
};
