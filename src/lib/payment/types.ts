/**
 * Payment Architecture Abstraction
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Supports:
 * - Online Payment (Provider: "Other" - to be configured later)
 * - WhatsApp / Manual Payment
 * 
 * Rules:
 * - Manual payments must NEVER automatically become "Payment Received".
 * - Only admin can mark manual payment as received.
 * - No fake payment credentials or APIs.
 */

import type { PaymentMethod, PaymentStatus } from '@/types/database.types';

export interface PaymentInitiationParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  notes?: string;
}

export interface PaymentInitiationResult {
  success: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference?: string;
  redirectUrl?: string;
  instructions?: string;
  error?: string;
}

export interface IPaymentProvider {
  readonly id: PaymentMethod;
  readonly displayName: string;
  readonly description: string;
  readonly isConfigured: boolean;
  initiatePayment(params: PaymentInitiationParams): Promise<PaymentInitiationResult>;
}
