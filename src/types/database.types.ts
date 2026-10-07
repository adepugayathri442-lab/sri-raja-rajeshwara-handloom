/**
 * Supabase Database Schema Definitions
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Strict TypeScript types reflecting the Phase 2 Supabase schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'customer' | 'admin';

export type CustomerType =
  | 'Retail Shop'
  | 'Reseller'
  | 'Business'
  | 'Institution'
  | 'Bulk Buyer'
  | 'Other';

export type OrderStatus =
  | 'Order Placed'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus =
  | 'Pending'
  | 'Payment Received'
  | 'Failed'
  | 'Refunded';

export type PaymentMethod =
  | 'online_payment'
  | 'whatsapp_manual';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          email: string;
          customer_type: CustomerType;
          business_name: string | null;
          gst_number: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone: string;
          email: string;
          customer_type?: CustomerType;
          business_name?: string | null;
          gst_number?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string;
          email?: string;
          customer_type?: CustomerType;
          business_name?: string | null;
          gst_number?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          state: string;
          pincode: string;
          landmark: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          state: string;
          pincode: string;
          landmark?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          landmark?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          group_name: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          group_name: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          group_name?: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          product_code: string;
          name: string;
          slug: string;
          category_id: string;
          price_per_piece: number;
          stock_quantity: number;
          description: string;
          image_url: string | null;
          is_active: boolean;
          price_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_code: string;
          name: string;
          slug: string;
          category_id: string;
          price_per_piece: number;
          stock_quantity?: number;
          description: string;
          image_url?: string | null;
          is_active?: boolean;
          price_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_code?: string;
          name?: string;
          slug?: string;
          category_id?: string;
          price_per_piece?: number;
          stock_quantity?: number;
          description?: string;
          image_url?: string | null;
          is_active?: boolean;
          price_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          address_id: string | null;
          subtotal: number;
          delivery_charge: number;
          grand_total: number;
          payment_method: PaymentMethod;
          payment_status: PaymentStatus;
          order_status: OrderStatus;
          customer_notes: string | null;
          transporter_name: string | null;
          lr_number: string | null;
          tracking_number: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          delivery_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          address_id?: string | null;
          subtotal: number;
          delivery_charge?: number;
          grand_total: number;
          payment_method: PaymentMethod;
          payment_status?: PaymentStatus;
          order_status?: OrderStatus;
          customer_notes?: string | null;
          transporter_name?: string | null;
          lr_number?: string | null;
          tracking_number?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          delivery_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          address_id?: string | null;
          subtotal?: number;
          delivery_charge?: number;
          grand_total?: number;
          payment_method?: PaymentMethod;
          payment_status?: PaymentStatus;
          order_status?: OrderStatus;
          customer_notes?: string | null;
          transporter_name?: string | null;
          lr_number?: string | null;
          tracking_number?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          delivery_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name_snapshot: string;
          product_code_snapshot: string;
          price_per_piece: number;
          quantity: number;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name_snapshot: string;
          product_code_snapshot: string;
          price_per_piece: number;
          quantity: number;
          line_total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name_snapshot?: string;
          product_code_snapshot?: string;
          price_per_piece?: number;
          quantity?: number;
          line_total?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      wholesale_enquiries: {
        Row: {
          id: string;
          name: string;
          business_name: string;
          phone: string;
          email: string | null;
          city: string;
          state: string;
          products_interested: string;
          approximate_quantity: string | null;
          message: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          business_name: string;
          phone: string;
          email?: string | null;
          city: string;
          state: string;
          products_interested: string;
          approximate_quantity?: string | null;
          message: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          business_name?: string;
          phone?: string;
          email?: string | null;
          city?: string;
          state?: string;
          products_interested?: string;
          approximate_quantity?: string | null;
          message?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      delivery_charge_rules: {
        Row: {
          id: string;
          state_name: string;
          zone: string;
          base_charge: number;
          per_piece_rate: number;
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          state_name: string;
          zone: string;
          base_charge: number;
          per_piece_rate: number;
          is_active?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          state_name?: string;
          zone?: string;
          base_charge?: number;
          per_piece_rate?: number;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      store_settings: {
        Row: {
          id: string;
          business_name: string;
          business_type: string;
          tagline: string;
          short_description: string;
          full_address: string;
          pincode: string;
          google_maps_plus_code: string;
          google_maps_address: string;
          is_wholesale_only: boolean;
          pricing_type: string;
          allows_any_quantity: boolean;
          delivery_enabled: boolean;
          default_delivery_charge: number;
          phone: string;
          formatted_phone: string;
          whatsapp_number: string;
          email: string;
          working_hours: string;
          is_store_active: boolean;
          allow_new_orders: boolean;
          allow_whatsapp_enquiries: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name?: string;
          business_type?: string;
          tagline?: string;
          short_description?: string;
          full_address?: string;
          pincode?: string;
          google_maps_plus_code?: string;
          google_maps_address?: string;
          is_wholesale_only?: boolean;
          pricing_type?: string;
          allows_any_quantity?: boolean;
          delivery_enabled?: boolean;
          default_delivery_charge?: number;
          phone?: string;
          formatted_phone?: string;
          whatsapp_number?: string;
          email?: string;
          working_hours?: string;
          is_store_active?: boolean;
          allow_new_orders?: boolean;
          allow_whatsapp_enquiries?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          business_type?: string;
          tagline?: string;
          short_description?: string;
          full_address?: string;
          pincode?: string;
          google_maps_plus_code?: string;
          google_maps_address?: string;
          is_wholesale_only?: boolean;
          pricing_type?: string;
          allows_any_quantity?: boolean;
          delivery_enabled?: boolean;
          default_delivery_charge?: number;
          phone?: string;
          formatted_phone?: string;
          whatsapp_number?: string;
          email?: string;
          working_hours?: string;
          is_store_active?: boolean;
          allow_new_orders?: boolean;
          allow_whatsapp_enquiries?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      customer_type: CustomerType;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
