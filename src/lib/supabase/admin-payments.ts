/**
 * Supabase Admin Payments & Ledger Service
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Provides payment ledger data access and financial summaries:
 * - Order payment ledger entries
 * - Payment status summaries (Received, Pending, Failed, Refunded)
 * - Safe payment status transitions
 */

import { createClient } from './client';
import type { PaymentStatus, PaymentMethod, CustomerType } from '@/types';
import { updateAdminPaymentStatus } from './admin-operations';

export interface AdminPaymentLedgerItem {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  businessName: string | null;
  customerType: CustomerType;
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: string;
}

export interface AdminPaymentSummary {
  totalOrderValue: number;
  paymentsReceivedTotal: number;
  paymentsPendingTotal: number;
  paymentsFailedTotal: number;
  refundedTotal: number;
  totalTransactionsCount: number;
  receivedCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
}

export interface GetPaymentLedgerOptions {
  search?: string;
  paymentStatus?: PaymentStatus | 'all';
  paymentMethod?: PaymentMethod | 'all';
  dateRange?: 'all' | 'today' | 'this-week' | 'this-month';
}

/**
 * Fetch payments ledger and financial summaries from orders
 */
export async function getAdminPaymentLedger(
  options: GetPaymentLedgerOptions = {}
): Promise<{
  items: AdminPaymentLedgerItem[];
  summary: AdminPaymentSummary;
}> {
  const defaultSummary: AdminPaymentSummary = {
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
  };

  try {
    const supabase = createClient();
    if (!supabase) return { items: [], summary: defaultSummary };

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        created_at,
        updated_at,
        subtotal,
        delivery_charge,
        grand_total,
        payment_method,
        payment_status,
        order_status,
        profiles:user_id(full_name, phone, email, business_name, customer_type)
      `)
      .order('created_at', { ascending: false });

    if (error || !orders) {
      console.error('Error fetching payments ledger:', error);
      return { items: [], summary: defaultSummary };
    }

    type ProfileJoin = {
      full_name?: string;
      phone?: string;
      email?: string;
      business_name?: string | null;
      customer_type?: CustomerType;
    };

    const summary: AdminPaymentSummary = { ...defaultSummary };
    const allItems: AdminPaymentLedgerItem[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.getTime() - (now.getDay() || 7 - 1) * 24 * 60 * 60 * 1000);
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekTime = startOfWeek.getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    orders.forEach((o) => {
      const p = (Array.isArray(o.profiles) ? o.profiles[0] : o.profiles) as ProfileJoin | null;
      const amount = Number(o.grand_total ?? 0);

      // Accumulate global summary
      summary.totalOrderValue += amount;
      summary.totalTransactionsCount++;

      switch (o.payment_status) {
        case 'Payment Received':
          summary.paymentsReceivedTotal += amount;
          summary.receivedCount++;
          break;
        case 'Pending':
          summary.paymentsPendingTotal += amount;
          summary.pendingCount++;
          break;
        case 'Failed':
          summary.paymentsFailedTotal += amount;
          summary.failedCount++;
          break;
        case 'Refunded':
          summary.refundedTotal += amount;
          summary.refundedCount++;
          break;
      }

      allItems.push({
        orderId: o.id,
        orderNumber: o.order_number,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        customerName: p?.full_name || 'Counter Buyer',
        customerPhone: p?.phone || '—',
        customerEmail: p?.email || '—',
        businessName: p?.business_name || null,
        customerType: p?.customer_type || 'Retail Shop',
        subtotal: Number(o.subtotal ?? 0),
        deliveryCharge: Number(o.delivery_charge ?? 0),
        grandTotal: amount,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        orderStatus: o.order_status,
      });
    });

    // Apply Client-Side Filters
    let filtered = allItems;

    // 1. Status Filter
    if (options.paymentStatus && options.paymentStatus !== 'all') {
      filtered = filtered.filter((i) => i.paymentStatus === options.paymentStatus);
    }

    // 2. Method Filter
    if (options.paymentMethod && options.paymentMethod !== 'all') {
      filtered = filtered.filter((i) => i.paymentMethod === options.paymentMethod);
    }

    // 3. Date Range Filter
    if (options.dateRange && options.dateRange !== 'all') {
      filtered = filtered.filter((i) => {
        const time = new Date(i.createdAt).getTime();
        if (options.dateRange === 'today') return time >= startOfToday;
        if (options.dateRange === 'this-week') return time >= startOfWeekTime;
        if (options.dateRange === 'this-month') return time >= startOfMonth;
        return true;
      });
    }

    // 4. Search Filter
    if (options.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.orderNumber.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          i.customerPhone.toLowerCase().includes(q) ||
          (i.businessName && i.businessName.toLowerCase().includes(q))
      );
    }

    return { items: filtered, summary };
  } catch (err) {
    console.error('Error in getAdminPaymentLedger:', err);
    return { items: [], summary: defaultSummary };
  }
}

export { updateAdminPaymentStatus };
