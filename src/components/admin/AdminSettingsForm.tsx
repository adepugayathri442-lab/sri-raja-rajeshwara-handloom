'use client';

/**
 * Admin Store Settings & Configuration Form Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Interactive settings editor for official business information
 * - Store model configuration (wholesale-only, fixed piece rate, any quantity)
 * - Contact & hotline management (phone, WhatsApp, email)
 * - Operational switches (store status, accept new orders, WhatsApp enquiries)
 * - Client-side validation (email format, 10-digit phone, required fields)
 * - Persistent configuration with instant feedback and Reset to Defaults
 */

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Store,
  Phone,
  RotateCcw,
  Save,
  Truck,
  Power,
  RefreshCw,
} from 'lucide-react';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  fetchStoreSettings,
  persistStoreSettings,
  resetStoreSettings,
  DEFAULT_STORE_SETTINGS,
  type AdminStoreSettings,
  SETTINGS_STORAGE_KEY,
} from '@/lib/supabase/admin-settings';

export type StoreSettingsData = AdminStoreSettings;

export function AdminSettingsForm() {
  const [settings, setSettings] = useState<StoreSettingsData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...DEFAULT_STORE_SETTINGS, ...parsed };
        }
      } catch {
        // Fallback to default
      }
    }
    return DEFAULT_STORE_SETTINGS;
  });
  const [source, setSource] = useState<'database' | 'cache' | 'default'>('default');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load from Supabase on mount (synced across all devices/logins)
  React.useEffect(() => {
    let ignore = false;
    fetchStoreSettings()
      .then((res) => {
        if (!ignore) {
          setSettings(res.settings);
          setSource(res.source);
        }
      })
      .catch((err) => {
        console.warn('Failed to load store settings from database:', err);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validation
    if (!settings.name.trim()) {
      setFeedback({ message: 'Business Name is required.', type: 'error' });
      return;
    }
    if (!settings.fullAddress.trim()) {
      setFeedback({ message: 'Registered Address is required.', type: 'error' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.email.trim())) {
      setFeedback({ message: 'Please enter a valid business email address.', type: 'error' });
      return;
    }

    // Phone validation
    const cleanPhone = settings.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setFeedback({ message: 'Please enter a valid 10-digit phone number.', type: 'error' });
      return;
    }

    const cleanWhatsapp = settings.whatsappNumber.replace(/[^0-9]/g, '');
    if (cleanWhatsapp.length < 10) {
      setFeedback({ message: 'Please enter a valid 10-digit WhatsApp number.', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await persistStoreSettings(settings);
      setIsSaving(false);
      setSource(res.databaseSaved ? 'database' : 'cache');
      setFeedback({
        message: res.message,
        type: 'success',
      });
    } catch {
      setIsSaving(false);
      setFeedback({
        message: 'Could not save store settings to database or cache.',
        type: 'error',
      });
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all parameters back to official Sri Raja Rajeshwara Handloom defaults?')) {
      setIsSaving(true);
      try {
        const res = await resetStoreSettings();
        setSettings(DEFAULT_STORE_SETTINGS);
        setSource(res.databaseSaved ? 'database' : 'cache');
        setIsSaving(false);
        setFeedback({
          message: 'Settings reset to official business defaults and persisted.',
          type: 'success',
        });
      } catch {
        setIsSaving(false);
        setFeedback({
          message: 'Failed to reset settings.',
          type: 'error',
        });
      }
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted mb-1">
            <Link href="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <span className="text-primary font-medium">Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            Wholesale Store Settings & Identity
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Configure business identity, contact hotlines, wholesale model rules, and operational toggles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {source === 'database' ? (
            <Badge variant="success" size="sm">Cloud Synced</Badge>
          ) : source === 'cache' ? (
            <Badge variant="warning" size="sm">Local Cache</Badge>
          ) : (
            <Badge variant="subtle" size="sm">Default Config</Badge>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Defaults
          </Button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-muted hover:text-charcoal text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* System Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" className="p-4 bg-surface border-border">
          <span className="text-[11px] font-semibold text-muted uppercase block mb-1">
            Database Integration
          </span>
          <div className="text-sm font-bold text-primary flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Supabase Connected</span>
          </div>
          <p className="text-[10px] text-muted mt-1">
            PostgreSQL RLS with least-privilege security
          </p>
        </Card>

        <Card variant="default" className="p-4 bg-surface border-border">
          <span className="text-[11px] font-semibold text-muted uppercase block mb-1">
            Wholesale Hotline
          </span>
          <div className="text-sm font-bold text-primary flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>+91 {settings.whatsappNumber}</span>
          </div>
          <p className="text-[10px] text-muted mt-1">
            WhatsApp trade enquiries & quotes
          </p>
        </Card>

        <Card variant="default" className="p-4 bg-surface border-border">
          <span className="text-[11px] font-semibold text-muted uppercase block mb-1">
            Store Availability
          </span>
          <div className="text-sm font-bold flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${settings.isStoreActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className={settings.isStoreActive ? 'text-emerald-800' : 'text-rose-700'}>
              {settings.isStoreActive ? 'Store Active (Open)' : 'Maintenance Mode'}
            </span>
          </div>
          <p className="text-[10px] text-muted mt-1">
            {settings.allowNewOrders ? 'Accepting customer orders' : 'Orders paused'}
          </p>
        </Card>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Section A: Business Information */}
        <Card variant="default" className="p-6 border-border bg-surface space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Store className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-serif font-bold text-primary uppercase tracking-wider">
              A. Business Information & Trade Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Business Legal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:border-accent outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Business Type
              </label>
              <input
                type="text"
                disabled
                value={settings.businessType}
                className="w-full px-3 py-2 bg-surface-subtle/60 border border-border/80 rounded-lg text-muted cursor-not-allowed font-medium"
              />
              <span className="text-[10px] text-muted mt-0.5 block">
                Wholesale Cloth Merchant (Fixed wholesale architecture)
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-charcoal mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:border-accent outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-charcoal mb-1">
                Registered Godown Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={settings.fullAddress}
                onChange={(e) => setSettings({ ...settings, fullAddress: e.target.value })}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:border-accent outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                PIN Code
              </label>
              <input
                type="text"
                value={settings.pincode}
                onChange={(e) => setSettings({ ...settings, pincode: e.target.value })}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal font-mono focus:border-accent outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Google Maps Plus Code
              </label>
              <input
                type="text"
                value={settings.googleMapsPlusCode}
                onChange={(e) => setSettings({ ...settings, googleMapsPlusCode: e.target.value })}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal font-mono focus:border-accent outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Section B: Store Model Settings */}
        <Card variant="default" className="p-6 border-border bg-surface space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Truck className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-serif font-bold text-primary uppercase tracking-wider">
              B. Wholesale Model & Delivery Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-surface-subtle border border-border rounded-lg space-y-1">
              <span className="font-semibold text-charcoal block">Wholesale-Only Operation</span>
              <p className="text-[11px] text-muted">
                100% B2B model catering exclusively to retail shops, resellers, and institutions.
              </p>
              <Badge variant="primary" size="sm" className="mt-1">
                Active & Enforced
              </Badge>
            </div>

            <div className="p-3 bg-surface-subtle border border-border rounded-lg space-y-1">
              <span className="font-semibold text-charcoal block">Pricing Strategy</span>
              <p className="text-[11px] text-muted">
                Single fixed piece rate (₹/pc). No quantity-based retail tiers or artificial price barriers.
              </p>
              <Badge variant="accent" size="sm" className="mt-1">
                Fixed Piece Rate
              </Badge>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Default Consignment Freight Charge (₹)
              </label>
              <input
                type="number"
                min="0"
                value={settings.defaultDeliveryCharge}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultDeliveryCharge: parseFloat(e.target.value || '0'),
                  })
                }
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal font-mono focus:border-accent outline-none"
              />
              <span className="text-[10px] text-muted mt-0.5 block">
                Standard baseline fee for orders without specific state rule.
              </span>
            </div>

            <div className="flex flex-col justify-center space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowsAnyQuantity}
                  onChange={(e) =>
                    setSettings({ ...settings, allowsAnyQuantity: e.target.checked })
                  }
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <span className="font-medium text-charcoal">Allow Any Quantity Order</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.deliveryEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, deliveryEnabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <span className="font-medium text-charcoal">Enable Pan-India Delivery</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Section C: Contact Settings */}
        <Card variant="default" className="p-6 border-border bg-surface space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Phone className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-serif font-bold text-primary uppercase tracking-wider">
              C. Contact Hotlines & Wholesale Support
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Official Business Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal font-mono focus:border-accent outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                WhatsApp Trade Hotline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal font-mono focus:border-accent outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Customer Support Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal font-mono focus:border-accent outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Godown Working Hours
              </label>
              <input
                type="text"
                value={settings.workingHours}
                onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:border-accent outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Section D: Operational Switches */}
        <Card variant="default" className="p-6 border-border bg-surface space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Power className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-serif font-bold text-primary uppercase tracking-wider">
              D. Operational Switches & Storefront Controls
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-surface-subtle rounded-lg border border-border space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-charcoal">
                <input
                  type="checkbox"
                  checked={settings.isStoreActive}
                  onChange={(e) => setSettings({ ...settings, isStoreActive: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <span>Storefront Online</span>
              </label>
              <p className="text-[10px] text-muted">
                Keep catalog accessible to buyers across India.
              </p>
            </div>

            <div className="p-3 bg-surface-subtle rounded-lg border border-border space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-charcoal">
                <input
                  type="checkbox"
                  checked={settings.allowNewOrders}
                  onChange={(e) => setSettings({ ...settings, allowNewOrders: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <span>Accept New Orders</span>
              </label>
              <p className="text-[10px] text-muted">
                Allow customers to place orders through checkout.
              </p>
            </div>

            <div className="p-3 bg-surface-subtle rounded-lg border border-border space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-charcoal">
                <input
                  type="checkbox"
                  checked={settings.allowWhatsAppEnquiries}
                  onChange={(e) =>
                    setSettings({ ...settings, allowWhatsAppEnquiries: e.target.checked })
                  }
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <span>WhatsApp Enquiries</span>
              </label>
              <p className="text-[10px] text-muted">
                Show 1-click WhatsApp buttons on product pages.
              </p>
            </div>
          </div>
        </Card>

        {/* Submit Bar */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleReset}
          >
            Cancel / Reset
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSaving}
            leftIcon={isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            {isSaving ? 'Saving Changes...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
