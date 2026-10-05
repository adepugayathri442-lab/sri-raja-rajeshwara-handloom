/**
 * Admin Settings Persistence Service
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Provides unified store settings persistence:
 * 1. Supabase Database (`public.store_settings`) - Cross-device, cross-browser, cross-session
 * 2. LocalStorage (`srr_admin_settings_v1`) - Instant local cache & offline resilience
 * 3. `businessConfig` (`src/config/business.ts`) - Verified fallback defaults
 */

import { createClient } from './client';
import { businessConfig } from '@/config/business';

export const SETTINGS_STORAGE_KEY = 'srr_admin_settings_v1';

export interface AdminStoreSettings {
  // A. Business Information
  name: string;
  businessType: string;
  tagline: string;
  shortDescription: string;
  fullAddress: string;
  pincode: string;
  googleMapsPlusCode: string;
  googleMapsAddress: string;

  // B. Store Settings
  isWholesaleOnly: boolean;
  pricingType: string;
  allowsAnyQuantity: boolean;
  deliveryEnabled: boolean;
  defaultDeliveryCharge: number;

  // C. Contact Settings
  phone: string;
  formattedPhone: string;
  whatsappNumber: string;
  email: string;
  workingHours: string;

  // D. Operational Settings
  isStoreActive: boolean;
  allowNewOrders: boolean;
  allowWhatsAppEnquiries: boolean;
}

export const DEFAULT_STORE_SETTINGS: AdminStoreSettings = {
  name: businessConfig.name,
  businessType: businessConfig.businessType,
  tagline: businessConfig.tagline,
  shortDescription: businessConfig.shortDescription,
  fullAddress: businessConfig.contact.fullAddress,
  pincode: businessConfig.contact.pincode,
  googleMapsPlusCode: businessConfig.contact.googleMapsPlusCode,
  googleMapsAddress: businessConfig.contact.googleMapsAddress,

  isWholesaleOnly: businessConfig.model.isWholesaleOnly,
  pricingType: 'Fixed Piece Rate (₹/pc)',
  allowsAnyQuantity: businessConfig.model.allowsAnyQuantity,
  deliveryEnabled: true,
  defaultDeliveryCharge: 150,

  phone: businessConfig.contact.phone,
  formattedPhone: businessConfig.contact.formattedPhone,
  whatsappNumber: businessConfig.contact.whatsappNumber,
  email: businessConfig.contact.email,
  workingHours: businessConfig.contact.workingHours,

  isStoreActive: true,
  allowNewOrders: true,
  allowWhatsAppEnquiries: true,
};

/**
 * Fetch settings with fallback hierarchy:
 * 1. Supabase `store_settings`
 * 2. LocalStorage cache
 * 3. Default configuration
 */
export async function fetchStoreSettings(): Promise<{ settings: AdminStoreSettings; source: 'database' | 'cache' | 'default' }> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'primary_store')
        .maybeSingle();

      if (!error && data) {
        const loaded: AdminStoreSettings = {
          name: data.business_name || DEFAULT_STORE_SETTINGS.name,
          businessType: data.business_type || DEFAULT_STORE_SETTINGS.businessType,
          tagline: data.tagline || DEFAULT_STORE_SETTINGS.tagline,
          shortDescription: data.short_description || DEFAULT_STORE_SETTINGS.shortDescription,
          fullAddress: data.full_address || DEFAULT_STORE_SETTINGS.fullAddress,
          pincode: data.pincode || DEFAULT_STORE_SETTINGS.pincode,
          googleMapsPlusCode: data.google_maps_plus_code || DEFAULT_STORE_SETTINGS.googleMapsPlusCode,
          googleMapsAddress: data.google_maps_address || DEFAULT_STORE_SETTINGS.googleMapsAddress,
          isWholesaleOnly: data.is_wholesale_only ?? DEFAULT_STORE_SETTINGS.isWholesaleOnly,
          pricingType: data.pricing_type || DEFAULT_STORE_SETTINGS.pricingType,
          allowsAnyQuantity: data.allows_any_quantity ?? DEFAULT_STORE_SETTINGS.allowsAnyQuantity,
          deliveryEnabled: data.delivery_enabled ?? DEFAULT_STORE_SETTINGS.deliveryEnabled,
          defaultDeliveryCharge: Number(data.default_delivery_charge) || DEFAULT_STORE_SETTINGS.defaultDeliveryCharge,
          phone: data.phone || DEFAULT_STORE_SETTINGS.phone,
          formattedPhone: data.formatted_phone || DEFAULT_STORE_SETTINGS.formattedPhone,
          whatsappNumber: data.whatsapp_number || DEFAULT_STORE_SETTINGS.whatsappNumber,
          email: data.email || DEFAULT_STORE_SETTINGS.email,
          workingHours: data.working_hours || DEFAULT_STORE_SETTINGS.workingHours,
          isStoreActive: data.is_store_active ?? DEFAULT_STORE_SETTINGS.isStoreActive,
          allowNewOrders: data.allow_new_orders ?? DEFAULT_STORE_SETTINGS.allowNewOrders,
          allowWhatsAppEnquiries: data.allow_whatsapp_enquiries ?? DEFAULT_STORE_SETTINGS.allowWhatsAppEnquiries,
        };

        // Sync to local cache
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(loaded));
          } catch {
            // Ignore localStorage errors
          }
        }

        return { settings: loaded, source: 'database' };
      }
    } catch (err) {
      console.warn('Could not query store_settings table, falling back to cache:', err);
    }
  }

  // Fallback to localStorage cache
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { settings: { ...DEFAULT_STORE_SETTINGS, ...parsed }, source: 'cache' };
      }
    } catch {
      // Ignore parse errors
    }
  }

  return { settings: DEFAULT_STORE_SETTINGS, source: 'default' };
}

/**
 * Persist store settings to both Supabase and local cache.
 */
export async function persistStoreSettings(
  settings: AdminStoreSettings
): Promise<{ success: boolean; databaseSaved: boolean; message: string }> {
  // Always update local cache first
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to update localStorage cache:', e);
    }
  }

  const supabase = createClient();
  if (!supabase) {
    return {
      success: true,
      databaseSaved: false,
      message: 'Settings saved to browser local storage (Supabase connection not initialized).',
    };
  }

  try {
    const payload = {
      id: 'primary_store',
      business_name: settings.name,
      business_type: settings.businessType,
      tagline: settings.tagline,
      short_description: settings.shortDescription,
      full_address: settings.fullAddress,
      pincode: settings.pincode,
      google_maps_plus_code: settings.googleMapsPlusCode,
      google_maps_address: settings.googleMapsAddress,
      is_wholesale_only: settings.isWholesaleOnly,
      pricing_type: settings.pricingType,
      allows_any_quantity: settings.allowsAnyQuantity,
      delivery_enabled: settings.deliveryEnabled,
      default_delivery_charge: settings.defaultDeliveryCharge,
      phone: settings.phone,
      formatted_phone: settings.formattedPhone,
      whatsapp_number: settings.whatsappNumber,
      email: settings.email,
      working_hours: settings.workingHours,
      is_store_active: settings.isStoreActive,
      allow_new_orders: settings.allowNewOrders,
      allow_whatsapp_enquiries: settings.allowWhatsAppEnquiries,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('store_settings')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase store_settings upsert error:', error);
      return {
        success: true,
        databaseSaved: false,
        message: 'Settings saved to browser cache. (To sync across devices, execute the store_settings SQL migration in Supabase).',
      };
    }

    return {
      success: true,
      databaseSaved: true,
      message: 'Settings saved and synced across all devices, browsers, and sessions successfully.',
    };
  } catch (err) {
    console.error('Unexpected error persisting store settings:', err);
    return {
      success: true,
      databaseSaved: false,
      message: 'Settings saved to local cache (Network/Database write failed).',
    };
  }
}

/**
 * Reset settings back to official business defaults.
 */
export async function resetStoreSettings(): Promise<{ success: boolean; databaseSaved: boolean; message: string }> {
  return persistStoreSettings(DEFAULT_STORE_SETTINGS);
}
