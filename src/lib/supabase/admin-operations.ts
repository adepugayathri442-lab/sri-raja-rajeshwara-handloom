/**
 * Supabase Admin Operations & Order Lifecycle Service
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Provides authenticated owner operations for:
 * - Admin Operations Dashboard (KPI counters, sales metrics, recent orders)
 * - Order Management (status updates, payment status, safe stock adjustment)
 * - Customer Directory (profiles, order counts, purchase totals)
 * - Stock & Inventory Control
 * - Wholesale Enquiries Inbox
 * - Customer-facing order creation and parcel consignment tracking
 */

import { createClient } from './client';
import type {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  CustomerType,
  OrderRow,
  OrderItemRow,
  ProfileRow,
  AddressRow,
  WholesaleEnquiryRow,
} from '@/types';
import { emitWhatsAppOrderEvent, type WhatsAppEventType } from '@/lib/notifications/whatsapp-events';

// ============================================================================
// TYPES
// ============================================================================

export interface AdminOperationsStats {
  // Customer KPIs
  totalCustomers: number;

  // Product KPIs
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;

  // Order Volume KPIs
  totalOrders: number;
  pendingOrders: number;      // 'Order Placed'
  confirmedOrders: number;    // 'Confirmed'
  processingOrders: number;   // 'Processing'
  packedOrders: number;       // 'Packed'
  shippedOrders: number;      // 'Shipped'
  deliveredOrders: number;    // 'Delivered'
  cancelledOrders: number;    // 'Cancelled'

  // Sales KPIs (excludes Cancelled orders)
  todayOrdersCount: number;
  todaySales: number;
  thisWeekSales: number;
  thisMonthSales: number;
  totalSales: number;

  // Recent Orders
  recentOrders: AdminOrderListItem[];
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  businessName: string | null;
  customerType: CustomerType;
  itemCount: number;
  totalPieces: number;
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  destinationCity?: string;
  destinationState?: string;
}

export interface AdminOrderDetail extends AdminOrderListItem {
  customerNotes: string | null;
  gstNumber?: string | null;
  transporterName?: string | null;
  lrNumber?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  deliveryNotes?: string | null;
  address?: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    pincode: string;
    landmark: string | null;
  } | null;
  items: Array<{
    id: string;
    productId: string;
    productNameSnapshot: string;
    productCodeSnapshot: string;
    pricePerPiece: number;
    quantity: number;
    lineTotal: number;
  }>;
}

export interface GetAdminOrdersOptions {
  search?: string;
  orderStatus?: OrderStatus | 'all';
  paymentStatus?: PaymentStatus | 'all';
  dateRange?: 'all' | 'today' | 'this-week' | 'this-month';
  sortBy?: 'newest' | 'oldest' | 'total-desc' | 'total-asc';
}

export interface AdminCustomerListItem {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  customerType: CustomerType;
  businessName: string | null;
  gstNumber: string | null;
  city?: string;
  state?: string;
  totalOrders: number;
  totalPurchaseAmount: number;
  createdAt: string;
}

export interface AdminCustomerDetail extends AdminCustomerListItem {
  addresses: AddressRow[];
  orderHistory: Array<{
    id: string;
    orderNumber: string;
    createdAt: string;
    grandTotal: number;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    itemCount: number;
  }>;
}

export interface AdminStockItem {
  id: string;
  productCode: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  groupName: string;
  pricePerPiece: number;
  stockQuantity: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  isActive: boolean;
  updatedAt: string;
}

export interface CreateOrderParams {
  userId: string;
  customerName: string;
  phone: string;
  businessName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  paymentMethod: PaymentMethod;
  customerNotes?: string;
  deliveryCharge?: number;
  items: Array<{
    productId: string;
    name: string;
    productCode: string;
    pricePerPiece: number;
    quantity: number;
  }>;
}

const LOW_STOCK_THRESHOLD = 10;

// ============================================================================
// 1. ADMIN OPERATIONS DASHBOARD STATS
// ============================================================================

export async function getAdminOperationsStats(): Promise<AdminOperationsStats> {
  const defaultStats: AdminOperationsStats = {
    totalCustomers: 0,
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    packedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    todayOrdersCount: 0,
    todaySales: 0,
    thisWeekSales: 0,
    thisMonthSales: 0,
    totalSales: 0,
    recentOrders: [],
  };

  try {
    const supabase = createClient();
    if (!supabase) return defaultStats;

    // Parallel fetch: Customers, Products, Orders
    const [profilesRes, productsRes, ordersRes] = await Promise.all([
      supabase.from('profiles').select('id, role').eq('role', 'customer'),
      supabase.from('products').select('id, is_active, stock_quantity'),
      supabase
        .from('orders')
        .select(`
          id,
          order_number,
          user_id,
          created_at,
          updated_at,
          subtotal,
          delivery_charge,
          grand_total,
          payment_method,
          payment_status,
          order_status,
          customer_notes,
          profiles:user_id(full_name, phone, email, business_name, customer_type),
          addresses:address_id(city, state),
          order_items(id, quantity, line_total)
        `)
        .order('created_at', { ascending: false }),
    ]);

    // 1. Customer Count
    const totalCustomers = profilesRes.data ? profilesRes.data.length : 0;

    // 2. Product Stats
    let totalProducts = 0;
    let activeProducts = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;

    if (productsRes.data) {
      totalProducts = productsRes.data.length;
      productsRes.data.forEach((p) => {
        const stock = Number(p.stock_quantity ?? 0);
        if (p.is_active) activeProducts++;
        if (stock <= 0) outOfStockProducts++;
        else if (stock <= LOW_STOCK_THRESHOLD) lowStockProducts++;
      });
    }

    // 3. Order Stats & Sales Calculation
    let totalOrders = 0;
    let pendingOrders = 0;
    let confirmedOrders = 0;
    let processingOrders = 0;
    let packedOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;

    let todayOrdersCount = 0;
    let todaySales = 0;
    let thisWeekSales = 0;
    let thisMonthSales = 0;
    let totalSales = 0;

    const recentOrders: AdminOrderListItem[] = [];

    if (ordersRes.data) {
      totalOrders = ordersRes.data.length;

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const startOfWeek = new Date(now.getTime() - (now.getDay() || 7 - 1) * 24 * 60 * 60 * 1000);
      startOfWeek.setHours(0, 0, 0, 0);
      const startOfWeekTime = startOfWeek.getTime();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

      ordersRes.data.forEach((o, index) => {
        const orderTime = new Date(o.created_at).getTime();
        const isCancelled = o.order_status === 'Cancelled';
        const amount = Number(o.grand_total ?? 0);

        // Status counts
        switch (o.order_status) {
          case 'Order Placed':
            pendingOrders++;
            break;
          case 'Confirmed':
            confirmedOrders++;
            break;
          case 'Processing':
            processingOrders++;
            break;
          case 'Packed':
            packedOrders++;
            break;
          case 'Shipped':
            shippedOrders++;
            break;
          case 'Delivered':
            deliveredOrders++;
            break;
          case 'Cancelled':
            cancelledOrders++;
            break;
        }

        // Sales calculation (strictly exclude Cancelled orders)
        if (!isCancelled) {
          totalSales += amount;

          if (orderTime >= startOfToday) {
            todayOrdersCount++;
            todaySales += amount;
          }
          if (orderTime >= startOfWeekTime) {
            thisWeekSales += amount;
          }
          if (orderTime >= startOfMonth) {
            thisMonthSales += amount;
          }
        }

        // Map first 10 orders to recentOrders list
        if (index < 10) {
          type ProfileJoin = {
            full_name?: string;
            phone?: string;
            email?: string;
            business_name?: string | null;
            customer_type?: CustomerType;
          };
          type AddressJoin = {
            city?: string;
            state?: string;
          };
          type ItemJoin = {
            id: string;
            quantity: number;
            line_total: number;
          };

          const p = (Array.isArray(o.profiles) ? o.profiles[0] : o.profiles) as ProfileJoin | null;
          const a = (Array.isArray(o.addresses) ? o.addresses[0] : o.addresses) as AddressJoin | null;
          const items = (o.order_items as unknown as ItemJoin[]) || [];

          const totalPieces = items.reduce((sum, i) => sum + Number(i.quantity ?? 0), 0);

          recentOrders.push({
            id: o.id,
            orderNumber: o.order_number,
            createdAt: o.created_at,
            updatedAt: o.updated_at,
            customerName: p?.full_name || 'Merchant',
            customerPhone: p?.phone || '—',
            customerEmail: p?.email || '—',
            businessName: p?.business_name || null,
            customerType: (p?.customer_type as CustomerType) || 'Retail Shop',
            itemCount: items.length,
            totalPieces,
            subtotal: Number(o.subtotal),
            deliveryCharge: Number(o.delivery_charge),
            grandTotal: Number(o.grand_total),
            paymentMethod: o.payment_method as PaymentMethod,
            paymentStatus: o.payment_status as PaymentStatus,
            orderStatus: o.order_status as OrderStatus,
            destinationCity: a?.city,
            destinationState: a?.state,
          });
        }
      });
    }

    return {
      totalCustomers,
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      packedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      todayOrdersCount,
      todaySales,
      thisWeekSales,
      thisMonthSales,
      totalSales,
      recentOrders,
    };
  } catch (err) {
    console.error('Failed to getAdminOperationsStats:', err);
    return defaultStats;
  }
}

// ============================================================================
// 2. ADMIN ORDERS MANAGEMENT
// ============================================================================

export async function getAdminOrders(
  options: GetAdminOrdersOptions = {}
): Promise<{ orders: AdminOrderListItem[]; total: number }> {
  try {
    const supabase = createClient();
    if (!supabase) return { orders: [], total: 0 };

    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        user_id,
        created_at,
        updated_at,
        subtotal,
        delivery_charge,
        grand_total,
        payment_method,
        payment_status,
        order_status,
        customer_notes,
        profiles:user_id(full_name, phone, email, business_name, customer_type),
        addresses:address_id(city, state),
        order_items(id, quantity, line_total)
      `, { count: 'exact' });

    // Status Filters
    if (options.orderStatus && options.orderStatus !== 'all') {
      query = query.eq('order_status', options.orderStatus);
    }
    if (options.paymentStatus && options.paymentStatus !== 'all') {
      query = query.eq('payment_status', options.paymentStatus);
    }

    // Date Range Filters
    if (options.dateRange && options.dateRange !== 'all') {
      const now = new Date();
      if (options.dateRange === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte('created_at', start);
      } else if (options.dateRange === 'this-week') {
        const startOfWeek = new Date(now.getTime() - (now.getDay() || 7 - 1) * 24 * 60 * 60 * 1000);
        startOfWeek.setHours(0, 0, 0, 0);
        query = query.gte('created_at', startOfWeek.toISOString());
      } else if (options.dateRange === 'this-month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        query = query.gte('created_at', startOfMonth);
      }
    }

    // Sorting
    switch (options.sortBy) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'total-desc':
        query = query.order('grand_total', { ascending: false });
        break;
      case 'total-asc':
        query = query.order('grand_total', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, count, error } = await query;

    if (error || !data) {
      console.error('Failed to getAdminOrders:', error?.message);
      return { orders: [], total: 0 };
    }

    type ProfileJoin = {
      full_name?: string;
      phone?: string;
      email?: string;
      business_name?: string | null;
      customer_type?: CustomerType;
    };
    type AddressJoin = {
      city?: string;
      state?: string;
    };
    type ItemJoin = {
      id: string;
      quantity: number;
      line_total: number;
    };

    let orders: AdminOrderListItem[] = data.map((o) => {
      const p = (Array.isArray(o.profiles) ? o.profiles[0] : o.profiles) as ProfileJoin | null;
      const a = (Array.isArray(o.addresses) ? o.addresses[0] : o.addresses) as AddressJoin | null;
      const items = (o.order_items as unknown as ItemJoin[]) || [];

      const totalPieces = items.reduce((sum, i) => sum + Number(i.quantity ?? 0), 0);

      return {
        id: o.id,
        orderNumber: o.order_number,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        customerName: p?.full_name || 'Merchant',
        customerPhone: p?.phone || '—',
        customerEmail: p?.email || '—',
        businessName: p?.business_name || null,
        customerType: (p?.customer_type as CustomerType) || 'Retail Shop',
        itemCount: items.length,
        totalPieces,
        subtotal: Number(o.subtotal),
        deliveryCharge: Number(o.delivery_charge),
        grandTotal: Number(o.grand_total),
        paymentMethod: o.payment_method as PaymentMethod,
        paymentStatus: o.payment_status as PaymentStatus,
        orderStatus: o.order_status as OrderStatus,
        destinationCity: a?.city,
        destinationState: a?.state,
      };
    });

    // Client-side text search if needed (searches order ID, name, business, phone, email)
    if (options.search?.trim()) {
      const term = options.search.trim().toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(term) ||
          o.customerName.toLowerCase().includes(term) ||
          (o.businessName && o.businessName.toLowerCase().includes(term)) ||
          o.customerPhone.toLowerCase().includes(term) ||
          o.customerEmail.toLowerCase().includes(term)
      );
    }

    return {
      orders,
      total: count ?? orders.length,
    };
  } catch (err) {
    console.error('Failed to getAdminOrders:', err);
    return { orders: [], total: 0 };
  }
}

export async function getAdminOrderById(orderId: string): Promise<AdminOrderDetail | null> {
  try {
    const supabase = createClient();
    if (!supabase) return null;

    const { data: o, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id(*),
        addresses:address_id(*),
        order_items(*)
      `)
      .eq('id', orderId)
      .single();

    if (error || !o) {
      return null;
    }

    type ProfileJoin = ProfileRow;
    type AddressJoin = AddressRow;
    type ItemJoin = OrderItemRow;

    const p = (Array.isArray(o.profiles) ? o.profiles[0] : o.profiles) as ProfileJoin | null;
    const a = (Array.isArray(o.addresses) ? o.addresses[0] : o.addresses) as AddressJoin | null;
    const rawItems = (o.order_items as unknown as ItemJoin[]) || [];

    const items = rawItems.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productNameSnapshot: item.product_name_snapshot,
      productCodeSnapshot: item.product_code_snapshot,
      pricePerPiece: Number(item.price_per_piece),
      quantity: Number(item.quantity),
      lineTotal: Number(item.line_total),
    }));

    const totalPieces = items.reduce((sum, i) => sum + i.quantity, 0);

    return {
      id: o.id,
      orderNumber: o.order_number,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      customerName: p?.full_name || a?.name || 'Merchant',
      customerPhone: p?.phone || a?.phone || '—',
      customerEmail: p?.email || '—',
      businessName: p?.business_name || null,
      customerType: (p?.customer_type as CustomerType) || 'Retail Shop',
      customerNotes: o.customer_notes,
      gstNumber: p?.gst_number || null,
      transporterName: o.transporter_name || null,
      lrNumber: o.lr_number || null,
      trackingNumber: o.tracking_number || null,
      shippedAt: o.shipped_at || null,
      deliveredAt: o.delivered_at || null,
      deliveryNotes: o.delivery_notes || null,
      itemCount: items.length,
      totalPieces,
      subtotal: Number(o.subtotal),
      deliveryCharge: Number(o.delivery_charge),
      grandTotal: Number(o.grand_total),
      paymentMethod: o.payment_method as PaymentMethod,
      paymentStatus: o.payment_status as PaymentStatus,
      orderStatus: o.order_status as OrderStatus,
      address: a
        ? {
            name: a.name,
            phone: a.phone,
            addressLine1: a.address_line_1,
            addressLine2: a.address_line_2,
            city: a.city,
            state: a.state,
            pincode: a.pincode,
            landmark: a.landmark,
          }
        : null,
      items,
    };
  } catch (err) {
    console.error(`Failed to get order ${orderId}:`, err);
    return null;
  }
}

/**
 * Update Order Status with safe stock restoration on cancellation
 */
export async function updateAdminOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  currentStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    // If order is transitioning to Cancelled from an active status, safely restore stock
    if (newStatus === 'Cancelled' && currentStatus !== 'Cancelled') {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);

      if (!itemsError && items && items.length > 0) {
        for (const item of items) {
          // Fetch current stock
          const { data: prod } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

          if (prod) {
            const restoredStock = Number(prod.stock_quantity ?? 0) + Number(item.quantity);
            await supabase
              .from('products')
              .update({ stock_quantity: restoredStock })
              .eq('id', item.product_id);
          }
        }
      }
    }

    const updatePayload: {
      order_status: OrderStatus;
      updated_at: string;
      shipped_at?: string;
      delivered_at?: string;
    } = {
      order_status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === 'Shipped') {
      const { data: curr } = await supabase
        .from('orders')
        .select('shipped_at')
        .eq('id', orderId)
        .single();
      if (curr && !curr.shipped_at) {
        updatePayload.shipped_at = new Date().toISOString();
      }
    }

    if (newStatus === 'Delivered') {
      const { data: curr } = await supabase
        .from('orders')
        .select('delivered_at')
        .eq('id', orderId)
        .single();
      if (curr && !curr.delivered_at) {
        updatePayload.delivered_at = new Date().toISOString();
      }
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Emit non-blocking WhatsApp event for order status change
    if (newStatus !== currentStatus) {
      const eventTypeMap: Record<OrderStatus, WhatsAppEventType> = {
        'Order Placed': 'ORDER_PLACED',
        'Confirmed': 'ORDER_CONFIRMED',
        'Processing': 'ORDER_PROCESSING',
        'Packed': 'ORDER_PACKED',
        'Shipped': 'ORDER_SHIPPED',
        'Delivered': 'ORDER_DELIVERED',
        'Cancelled': 'ORDER_CANCELLED',
      };

      const eventType = eventTypeMap[newStatus];
      if (eventType) {
        getAdminOrderById(orderId)
          .then((fullOrder) => {
            if (!fullOrder) return;
            emitWhatsAppOrderEvent({
              eventType,
              orderId: fullOrder.id,
              orderNumber: fullOrder.orderNumber,
              customerName: fullOrder.address?.name || fullOrder.customerName || 'Valued Merchant',
              customerPhone: fullOrder.address?.phone || fullOrder.customerPhone || '',
              customerType: fullOrder.customerType || 'Retail Shop',
              orderStatus: newStatus,
              totalPieces: fullOrder.totalPieces,
              subtotal: fullOrder.subtotal,
              deliveryCharge: fullOrder.deliveryCharge,
              totalAmount: fullOrder.grandTotal,
              paymentStatus: fullOrder.paymentStatus,
              trackingNumber: fullOrder.trackingNumber,
              lrNumber: fullOrder.lrNumber,
              transporterName: fullOrder.transporterName,
              shippedAt: fullOrder.shippedAt,
              deliveredAt: fullOrder.deliveredAt,
              createdAt: fullOrder.createdAt,
            }).catch(() => {});
          })
          .catch((fetchErr) => {
            console.warn('[WhatsApp Events] Order detail fetch warning:', fetchErr);
          });
      }
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update order status',
    };
  }
}

export interface OrderTrackingInput {
  transporterName?: string | null;
  lrNumber?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  deliveryNotes?: string | null;
}

/**
 * Update Logistics, Courier agency & LR/Bilti tracking details
 */
export async function updateAdminOrderTracking(
  orderId: string,
  tracking: OrderTrackingInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        transporter_name: tracking.transporterName?.trim() || null,
        lr_number: tracking.lrNumber?.trim() || null,
        tracking_number: tracking.trackingNumber?.trim() || null,
        shipped_at: tracking.shippedAt || null,
        delivered_at: tracking.deliveredAt || null,
        delivery_notes: tracking.deliveryNotes?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Re-emit ORDER_SHIPPED event with consignment tracking if available
    getAdminOrderById(orderId)
      .then((fullOrder) => {
        if (!fullOrder) return;
        if (fullOrder.orderStatus === 'Shipped' || tracking.lrNumber || tracking.transporterName) {
          emitWhatsAppOrderEvent({
            eventType: 'ORDER_SHIPPED',
            orderId: fullOrder.id,
            orderNumber: fullOrder.orderNumber,
            customerName: fullOrder.address?.name || fullOrder.customerName || 'Valued Merchant',
            customerPhone: fullOrder.address?.phone || fullOrder.customerPhone || '',
            customerType: fullOrder.customerType || 'Retail Shop',
            orderStatus: fullOrder.orderStatus,
            totalPieces: fullOrder.totalPieces,
            subtotal: fullOrder.subtotal,
            deliveryCharge: fullOrder.deliveryCharge,
            totalAmount: fullOrder.grandTotal,
            paymentStatus: fullOrder.paymentStatus,
            trackingNumber: tracking.trackingNumber?.trim() || fullOrder.trackingNumber,
            lrNumber: tracking.lrNumber?.trim() || fullOrder.lrNumber,
            transporterName: tracking.transporterName?.trim() || fullOrder.transporterName,
            shippedAt: tracking.shippedAt || fullOrder.shippedAt,
            deliveredAt: tracking.deliveredAt || fullOrder.deliveredAt,
            createdAt: fullOrder.createdAt,
          }).catch(() => {});
        }
      })
      .catch(() => {});

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update consignment tracking',
    };
  }
}

/**
 * Update Payment Status
 */
export async function updateAdminPaymentStatus(
  orderId: string,
  newPaymentStatus: PaymentStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update payment status',
    };
  }
}

// ============================================================================
// 3. ADMIN CUSTOMERS MANAGEMENT
// ============================================================================

export async function getAdminCustomers(options: {
  search?: string;
  customerType?: string;
} = {}): Promise<AdminCustomerListItem[]> {
  try {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        phone,
        email,
        customer_type,
        business_name,
        gst_number,
        created_at,
        orders:orders(id, grand_total, order_status),
        addresses:addresses(city, state)
      `)
      .order('created_at', { ascending: false });

    if (options.customerType && options.customerType !== 'all') {
      query = query.eq('customer_type', options.customerType as CustomerType);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('Failed to getAdminCustomers:', error?.message);
      return [];
    }

    type OrderJoin = {
      id: string;
      grand_total: number;
      order_status: OrderStatus;
    };
    type AddressJoin = {
      city: string;
      state: string;
    };

    let customers: AdminCustomerListItem[] = data.map((p) => {
      const orders = (p.orders as unknown as OrderJoin[]) || [];
      const validOrders = orders.filter((o) => o.order_status !== 'Cancelled');
      const totalPurchaseAmount = validOrders.reduce((sum, o) => sum + Number(o.grand_total ?? 0), 0);

      const addresses = (p.addresses as unknown as AddressJoin[]) || [];
      const primaryAddress = addresses[0];

      return {
        id: p.id,
        fullName: p.full_name,
        phone: p.phone,
        email: p.email,
        customerType: p.customer_type as CustomerType,
        businessName: p.business_name,
        gstNumber: p.gst_number,
        city: primaryAddress?.city,
        state: primaryAddress?.state,
        totalOrders: validOrders.length,
        totalPurchaseAmount,
        createdAt: p.created_at,
      };
    });

    if (options.search?.trim()) {
      const term = options.search.trim().toLowerCase();
      customers = customers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.phone.toLowerCase().includes(term) ||
          (c.businessName && c.businessName.toLowerCase().includes(term))
      );
    }

    return customers;
  } catch (err) {
    console.error('Failed to getAdminCustomers:', err);
    return [];
  }
}

export async function getAdminCustomerById(
  customerId: string
): Promise<AdminCustomerDetail | null> {
  try {
    const supabase = createClient();
    if (!supabase) return null;

    const [profileRes, addressesRes, ordersRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', customerId).single(),
      supabase.from('addresses').select('*').eq('user_id', customerId),
      supabase
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          grand_total,
          order_status,
          payment_status,
          order_items(id)
        `)
        .eq('user_id', customerId)
        .order('created_at', { ascending: false }),
    ]);

    if (profileRes.error || !profileRes.data) {
      return null;
    }

    const p = profileRes.data;
    const addresses = addressesRes.data || [];
    const orders = ordersRes.data || [];

    const validOrders = orders.filter((o) => o.order_status !== 'Cancelled');
    const totalPurchaseAmount = validOrders.reduce((sum, o) => sum + Number(o.grand_total ?? 0), 0);

    const orderHistory = orders.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      createdAt: o.created_at,
      grandTotal: Number(o.grand_total),
      orderStatus: o.order_status as OrderStatus,
      paymentStatus: o.payment_status as PaymentStatus,
      itemCount: Array.isArray(o.order_items) ? o.order_items.length : 0,
    }));

    return {
      id: p.id,
      fullName: p.full_name,
      phone: p.phone,
      email: p.email,
      customerType: p.customer_type as CustomerType,
      businessName: p.business_name,
      gstNumber: p.gst_number,
      city: addresses[0]?.city,
      state: addresses[0]?.state,
      totalOrders: validOrders.length,
      totalPurchaseAmount,
      createdAt: p.created_at,
      addresses,
      orderHistory,
    };
  } catch (err) {
    console.error(`Failed to get customer ${customerId}:`, err);
    return null;
  }
}

// ============================================================================
// 4. ADMIN STOCK MANAGEMENT
// ============================================================================

export async function getAdminStockList(options: {
  search?: string;
  stockStatus?: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
  categoryId?: string;
} = {}): Promise<AdminStockItem[]> {
  try {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('stock_quantity', { ascending: true });

    if (options.categoryId && options.categoryId !== 'all') {
      query = query.eq('category_id', options.categoryId);
    }

    if (options.stockStatus) {
      if (options.stockStatus === 'out-of-stock') {
        query = query.lte('stock_quantity', 0);
      } else if (options.stockStatus === 'low-stock') {
        query = query.gt('stock_quantity', 0).lte('stock_quantity', LOW_STOCK_THRESHOLD);
      } else if (options.stockStatus === 'in-stock') {
        query = query.gt('stock_quantity', LOW_STOCK_THRESHOLD);
      }
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    type RawRow = OrderRow & {
      category?: { name: string; group_name: string };
      stock_quantity: number;
      price_per_piece: number;
      product_code: string;
      name: string;
      slug: string;
      category_id: string;
      is_active: boolean;
      updated_at: string;
    };

    let items: AdminStockItem[] = (data as unknown as RawRow[]).map((row) => {
      const stock = Number(row.stock_quantity ?? 0);
      let stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
      if (stock <= 0) stockStatus = 'Out of Stock';
      else if (stock <= LOW_STOCK_THRESHOLD) stockStatus = 'Low Stock';

      return {
        id: row.id,
        productCode: row.product_code,
        name: row.name,
        slug: row.slug,
        categoryId: row.category_id,
        categoryName: row.category?.name || 'Category',
        groupName: row.category?.group_name || 'Textiles',
        pricePerPiece: Number(row.price_per_piece),
        stockQuantity: stock,
        stockStatus,
        isActive: Boolean(row.is_active),
        updatedAt: row.updated_at,
      };
    });

    if (options.search?.trim()) {
      const term = options.search.trim().toLowerCase();
      items = items.filter(
        (i) => i.name.toLowerCase().includes(term) || i.productCode.toLowerCase().includes(term)
      );
    }

    return items;
  } catch (err) {
    console.error('Failed to getAdminStockList:', err);
    return [];
  }
}

// ============================================================================
// 5. ADMIN WHOLESALE ENQUIRIES
// ============================================================================

export async function getAdminEnquiries(options: {
  search?: string;
  status?: string;
} = {}): Promise<WholesaleEnquiryRow[]> {
  try {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
      .from('wholesale_enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (options.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    let enquiries = data as WholesaleEnquiryRow[];

    if (options.search?.trim()) {
      const term = options.search.trim().toLowerCase();
      enquiries = enquiries.filter(
        (e) =>
          e.name.toLowerCase().includes(term) ||
          e.business_name.toLowerCase().includes(term) ||
          e.phone.toLowerCase().includes(term) ||
          (e.email && e.email.toLowerCase().includes(term)) ||
          e.city.toLowerCase().includes(term)
      );
    }

    return enquiries;
  } catch (err) {
    console.error('Failed to getAdminEnquiries:', err);
    return [];
  }
}

export async function updateEnquiryStatus(
  id: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    const { error } = await supabase
      .from('wholesale_enquiries')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update enquiry status',
    };
  }
}

// ============================================================================
// 6. SAFE CHECKOUT WHOLESALE ORDER CREATION
// ============================================================================

export async function createWholesaleOrder(
  params: CreateOrderParams
): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database connection unavailable' };

    if (!params.items || params.items.length === 0) {
      return { success: false, error: 'Cannot create order: Cart is empty' };
    }

    // 1. Verify stock availability and live prices for each item
    for (const item of params.items) {
      const { data: prod, error: prodErr } = await supabase
        .from('products')
        .select('name, price_per_piece, stock_quantity, is_active')
        .eq('id', item.productId)
        .single();

      if (prodErr || !prod) {
        return { success: false, error: `Product "${item.name}" could not be verified in catalogue.` };
      }
      if (!prod.is_active) {
        return { success: false, error: `Product "${item.name}" has been deactivated.` };
      }
      const available = Number(prod.stock_quantity ?? 0);
      if (item.quantity > available) {
        return {
          success: false,
          error: `Insufficient stock for "${item.name}". Requested ${item.quantity} pcs, only ${available} pcs in warehouse.`,
        };
      }
    }

    // 2. Save delivery address record
    const { data: addressData, error: addressError } = await supabase
      .from('addresses')
      .insert({
        user_id: params.userId,
        name: params.customerName,
        phone: params.phone,
        address_line_1: params.addressLine1,
        address_line_2: params.addressLine2 || null,
        city: params.city,
        state: params.state,
        pincode: params.pincode,
        landmark: params.landmark || null,
        is_default: true,
      })
      .select('id')
      .single();

    if (addressError || !addressData) {
      return { success: false, error: `Could not save delivery address: ${addressError?.message}` };
    }

    // 3. Compute immutable subtotal: sum(price_per_piece * quantity)
    const subtotal = params.items.reduce(
      (sum, item) => sum + item.pricePerPiece * item.quantity,
      0
    );
    const deliveryCharge = params.deliveryCharge !== undefined ? Math.max(0, Number(params.deliveryCharge)) : 0;
    const grandTotal = subtotal + deliveryCharge;

    const orderNumber = `SRR-${Date.now().toString().slice(-6)}`;

    // 4. Create Order row
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: params.userId,
        address_id: addressData.id,
        subtotal,
        delivery_charge: deliveryCharge,
        grand_total: grandTotal,
        payment_method: params.paymentMethod,
        payment_status: 'Pending',
        order_status: 'Order Placed',
        customer_notes: params.customerNotes || null,
      })
      .select('id, order_number')
      .single();

    if (orderError || !orderData) {
      return { success: false, error: `Failed to create order record: ${orderError?.message}` };
    }

    // 5. Create Order Items with immutable snapshots
    const orderItemsPayload = params.items.map((item) => ({
      order_id: orderData.id,
      product_id: item.productId,
      product_name_snapshot: item.name,
      product_code_snapshot: item.productCode,
      price_per_piece: item.pricePerPiece,
      quantity: item.quantity,
      line_total: item.pricePerPiece * item.quantity,
    }));

    const { error: itemsInsertError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsInsertError) {
      return { success: false, error: `Order created but item recording failed: ${itemsInsertError.message}` };
    }

    // 6. Safe Stock Decrement (reduced exactly once upon order creation)
    for (const item of params.items) {
      const { data: prod } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.productId)
        .single();

      if (prod) {
        const remaining = Math.max(0, Number(prod.stock_quantity ?? 0) - item.quantity);
        await supabase
          .from('products')
          .update({ stock_quantity: remaining })
          .eq('id', item.productId);
      }
    }

    // 7. Non-blocking WhatsApp ORDER_PLACED notification event
    const totalPieces = params.items.reduce((sum, item) => sum + item.quantity, 0);
    emitWhatsAppOrderEvent({
      eventType: 'ORDER_PLACED',
      orderId: orderData.id,
      orderNumber: orderData.order_number,
      customerName: params.customerName || 'Valued Merchant',
      customerPhone: params.phone || '',
      customerType: 'Retail Shop',
      orderStatus: 'Order Placed',
      totalPieces,
      subtotal,
      deliveryCharge,
      totalAmount: grandTotal,
      paymentStatus: 'Pending',
      trackingNumber: null,
      lrNumber: null,
      transporterName: null,
      shippedAt: null,
      deliveredAt: null,
      createdAt: new Date().toISOString(),
    }).catch(() => {});

    return {
      success: true,
      orderId: orderData.id,
      orderNumber: orderData.order_number,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Order placement failed unexpectedly',
    };
  }
}

// ============================================================================
// 7. CUSTOMER-FACING ORDERS & TRACKING
// ============================================================================

export async function getCustomerOrders(userId: string): Promise<AdminOrderListItem[]> {
  try {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
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
        addresses:address_id(city, state),
        order_items(id, quantity, line_total)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    type AddressJoin = { city: string; state: string };
    type ItemJoin = { id: string; quantity: number; line_total: number };

    return data.map((o) => {
      const a = (Array.isArray(o.addresses) ? o.addresses[0] : o.addresses) as AddressJoin | null;
      const items = (o.order_items as unknown as ItemJoin[]) || [];
      const totalPieces = items.reduce((sum, i) => sum + Number(i.quantity ?? 0), 0);

      return {
        id: o.id,
        orderNumber: o.order_number,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        customerName: 'Me',
        customerPhone: '',
        customerEmail: '',
        businessName: null,
        customerType: 'Retail Shop',
        itemCount: items.length,
        totalPieces,
        subtotal: Number(o.subtotal),
        deliveryCharge: Number(o.delivery_charge),
        grandTotal: Number(o.grand_total),
        paymentMethod: o.payment_method as PaymentMethod,
        paymentStatus: o.payment_status as PaymentStatus,
        orderStatus: o.order_status as OrderStatus,
        destinationCity: a?.city,
        destinationState: a?.state,
      };
    });
  } catch (err) {
    console.error('Failed to getCustomerOrders:', err);
    return [];
  }
}

export async function getCustomerOrderById(
  userId: string,
  orderIdOrNumber: string
): Promise<AdminOrderDetail | null> {
  try {
    const supabase = createClient();
    if (!supabase) return null;

    let query = supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id(*),
        addresses:address_id(*),
        order_items(*)
      `)
      .eq('user_id', userId);

    // Support lookup by either UUID or human-readable order_number
    if (orderIdOrNumber.includes('-')) {
      query = query.or(`id.eq.${orderIdOrNumber},order_number.eq.${orderIdOrNumber}`);
    } else {
      query = query.eq('id', orderIdOrNumber);
    }

    const { data: o, error } = await query.maybeSingle();

    if (error || !o) return null;

    type ProfileJoin = ProfileRow;
    type AddressJoin = AddressRow;
    type ItemJoin = OrderItemRow;

    const p = (Array.isArray(o.profiles) ? o.profiles[0] : o.profiles) as ProfileJoin | null;
    const a = (Array.isArray(o.addresses) ? o.addresses[0] : o.addresses) as AddressJoin | null;
    const rawItems = (o.order_items as unknown as ItemJoin[]) || [];

    const items = rawItems.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productNameSnapshot: item.product_name_snapshot,
      productCodeSnapshot: item.product_code_snapshot,
      pricePerPiece: Number(item.price_per_piece),
      quantity: Number(item.quantity),
      lineTotal: Number(item.line_total),
    }));

    const totalPieces = items.reduce((sum, i) => sum + i.quantity, 0);

    return {
      id: o.id,
      orderNumber: o.order_number,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      customerName: p?.full_name || a?.name || 'Customer',
      customerPhone: p?.phone || a?.phone || '—',
      customerEmail: p?.email || '—',
      businessName: p?.business_name || null,
      customerType: (p?.customer_type as CustomerType) || 'Retail Shop',
      customerNotes: o.customer_notes,
      gstNumber: p?.gst_number || null,
      transporterName: o.transporter_name || null,
      lrNumber: o.lr_number || null,
      trackingNumber: o.tracking_number || null,
      shippedAt: o.shipped_at || null,
      deliveredAt: o.delivered_at || null,
      deliveryNotes: o.delivery_notes || null,
      itemCount: items.length,
      totalPieces,
      subtotal: Number(o.subtotal),
      deliveryCharge: Number(o.delivery_charge),
      grandTotal: Number(o.grand_total),
      paymentMethod: o.payment_method as PaymentMethod,
      paymentStatus: o.payment_status as PaymentStatus,
      orderStatus: o.order_status as OrderStatus,
      address: a
        ? {
            name: a.name,
            phone: a.phone,
            addressLine1: a.address_line_1,
            addressLine2: a.address_line_2,
            city: a.city,
            state: a.state,
            pincode: a.pincode,
            landmark: a.landmark,
          }
        : null,
      items,
    };
  } catch (err) {
    console.error('Failed to getCustomerOrderById:', err);
    return null;
  }
}
