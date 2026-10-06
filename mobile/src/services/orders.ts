import { supabase } from './supabase';
import { businessConfig } from '../config/business';

export type MobileOrderStatus =
  | 'Order Placed'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type MobilePaymentStatus =
  | 'Pending'
  | 'Payment Received'
  | 'Failed'
  | 'Refunded';

export interface MobileOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  product_code_snapshot: string;
  price_per_piece: number;
  quantity: number;
  line_total: number;
}

export interface MobileOrderAddress {
  id: string;
  name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
}

export interface MobileOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  address_id: string | null;
  subtotal: number;
  delivery_charge: number;
  grand_total: number;
  payment_method: 'whatsapp_manual' | 'online_payment';
  payment_status: MobilePaymentStatus;
  order_status: MobileOrderStatus;
  customer_notes: string | null;
  transporter_name: string | null;
  lr_number: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  delivery_notes: string | null;
  created_at: string;
  updated_at: string;
  address?: MobileOrderAddress | null;
  order_items?: MobileOrderItem[];
}

export interface CreateOrderInput {
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
  paymentMethod: 'whatsapp_manual' | 'online_payment';
  customerNotes?: string;
  deliveryCharge: number;
  items: Array<{
    productId: string;
    productCode: string;
    name: string;
    pricePerPiece: number;
    quantity: number;
  }>;
}

/**
 * Create a real Wholesale Order in Supabase
 */
export async function createWholesaleOrder(
  input: CreateOrderInput
): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> {
  try {
    if (!input.items || input.items.length === 0) {
      return { success: false, error: 'Cannot create order: Cart is empty' };
    }

    // 1. Verify stock availability and active state for each product
    for (const item of input.items) {
      const { data: prod, error: prodErr } = await supabase
        .from('products')
        .select('name, price_per_piece, stock_quantity, is_active')
        .eq('id', item.productId)
        .single();

      if (prodErr || !prod) {
        return { success: false, error: `Product "${item.name}" could not be verified in catalogue.` };
      }
      if (!prod.is_active) {
        return { success: false, error: `Product "${item.name}" is currently unavailable.` };
      }
      const available = Number(prod.stock_quantity ?? 0);
      if (item.quantity > available) {
        return {
          success: false,
          error: `Insufficient stock for "${item.name}". Requested ${item.quantity} pcs, only ${available} pcs available in warehouse.`,
        };
      }
    }

    // 2. Save delivery address
    const { data: addressData, error: addressError } = await supabase
      .from('addresses')
      .insert({
        user_id: input.userId,
        name: input.customerName,
        phone: input.phone,
        address_line_1: input.addressLine1,
        address_line_2: input.addressLine2 || null,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        landmark: input.landmark || null,
        is_default: true,
      })
      .select('id')
      .single();

    if (addressError || !addressData) {
      return { success: false, error: `Could not save delivery address: ${addressError?.message}` };
    }

    // 3. Calculate subtotal & grand total
    const subtotal = input.items.reduce(
      (sum, item) => sum + item.pricePerPiece * item.quantity,
      0
    );
    const deliveryCharge = Math.max(0, Number(input.deliveryCharge || 0));
    const grandTotal = subtotal + deliveryCharge;
    const orderNumber = `SRR-${Date.now().toString().slice(-6)}`;

    // 4. Insert into orders table
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: input.userId,
        address_id: addressData.id,
        subtotal,
        delivery_charge: deliveryCharge,
        grand_total: grandTotal,
        payment_method: input.paymentMethod,
        payment_status: 'Pending',
        order_status: 'Order Placed',
        customer_notes: input.customerNotes || null,
      })
      .select('id, order_number')
      .single();

    if (orderError || !orderData) {
      return { success: false, error: `Failed to create order record: ${orderError?.message}` };
    }

    // 5. Insert order items snapshot
    const orderItemsPayload = input.items.map((item) => ({
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
      return { success: false, error: `Order items recording error: ${itemsInsertError.message}` };
    }

    // 6. Safe Stock Decrement
    for (const item of input.items) {
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

    return {
      success: true,
      orderId: orderData.id,
      orderNumber: orderData.order_number,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to place wholesale order',
    };
  }
}

/**
 * Fetch all orders for a customer
 */
export async function getCustomerOrders(userId: string): Promise<MobileOrder[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        address:addresses(*),
        order_items(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching orders:', error.message);
      return [];
    }

    return (data as MobileOrder[]) || [];
  } catch (err) {
    console.warn('Error in getCustomerOrders:', err);
    return [];
  }
}

/**
 * Fetch single order with details
 */
export async function getOrderById(orderId: string): Promise<MobileOrder | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        address:addresses(*),
        order_items(*)
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (error || !data) return null;
    return data as MobileOrder;
  } catch (err) {
    console.warn('Error fetching order by ID:', err);
    return null;
  }
}
