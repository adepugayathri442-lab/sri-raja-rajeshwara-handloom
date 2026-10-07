/**
 * Core Domain Types
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 */

import type { Database } from './database.types';

export * from './database.types';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type AddressRow = Database['public']['Tables']['addresses']['Row'];
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type ProductRow = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
export type ProductImageRow = Database['public']['Tables']['product_images']['Row'];
export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
export type WholesaleEnquiryRow = Database['public']['Tables']['wholesale_enquiries']['Row'];
export type WishlistRow = Database['public']['Tables']['wishlist']['Row'];
export type DeliveryChargeRuleRow = Database['public']['Tables']['delivery_charge_rules']['Row'];

export type StockStatus = 'full' | 'limited' | 'out_of_stock';

/**
 * Frontend Wholesale Product View Model
 */
export interface Product {
  id: string;
  productCode: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  groupName?: string;
  pricePerPiece: number | null;
  stockQuantity: number;
  stockStatus: StockStatus;
  description: string;
  imageUrl?: string | null;
  images?: string[];
  isActive: boolean;
  priceVisible?: boolean;
}

/**
 * B2B Wholesale Cart Item
 */
export interface WholesaleCartItem {
  productId: string;
  productCode: string;
  name: string;
  slug: string;
  pricePerPiece: number;
  quantity: number;
  imageUrl?: string | null;
}

/**
 * Wholesale Order Summary
 */
export interface WholesaleOrderSummary {
  totalPieces: number;
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  isDeliveryManual: boolean;
}
