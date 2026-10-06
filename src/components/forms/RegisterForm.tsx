'use client';

/**
 * Wholesale Customer Registration Form
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Title: "Create Your Wholesale Account"
 * - 6 Required Fields:
 *   1. Full Name *
 *   2. Email Address *
 *   3. Mobile Number * (Indian mobile: 10 digits starting 6-9)
 *   4. Password * (min 6 chars)
 *   5. Confirm Password * (must match)
 *   6. Customer Type * (Retail Shop, Reseller, Business, Institution, Bulk Buyer, Other)
 * - 2 Optional Business Fields:
 *   7. Business / Shop Name
 *   8. GST Number (optional)
 * - Comprehensive inline validation & duplicate account detection
 * - Support ?next= and ?redirect= parameters to seamlessly restore user intent
 * - Strictly assigns role = 'customer'
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import type { CustomerType } from '@/types/database.types';
import { Button } from '@/components/common/Button';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const CUSTOMER_TYPES: readonly CustomerType[] = [
  'Retail Shop',
  'Reseller',
  'Business',
  'Institution',
  'Bulk Buyer',
  'Other',
];

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('next') || searchParams.get('redirect') || '/account';
  const urlError = searchParams.get('error');
  const { register, isConfigured } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('Retail Shop');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  // Validation & UI State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [dismissedUrlError, setDismissedUrlError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeError = formError || (!dismissedUrlError ? urlError : null);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Full Name
    if (!fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    }

    // 2. Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    // 3. Indian Mobile Number (10 digits starting with 6, 7, 8, or 9)
    const cleanedPhone = phone.replace(/[\s\-+]/g, '').replace(/^91/, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!cleanedPhone) {
      errors.phone = 'Mobile number is required.';
    } else if (!phoneRegex.test(cleanedPhone)) {
      errors.phone = 'Enter a valid 10-digit Indian mobile number (starts with 6-9).';
    }

    // 4. Password
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    // 5. Confirm Password
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm Password is required.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    // 6. Customer Type
    if (!customerType) {
      errors.customerType = 'Please select a customer type.';
    }

    // Optional GST validation (15 alphanumeric characters if entered)
    if (gstNumber.trim()) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
      if (!gstRegex.test(gstNumber.trim())) {
        errors.gstNumber = 'Please enter a valid 15-character GSTIN format or leave blank.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDismissedUrlError(true);
    setFormError(null);

    if (!validate()) {
      setFormError('Please resolve the errors highlighted below.');
      return;
    }

    const cleanedPhone = phone.replace(/[\s\-+]/g, '').replace(/^91/, '');

    setIsSubmitting(true);
    const result = await register({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanedPhone,
      password,
      customerType,
      businessName: businessName.trim() || undefined,
      gstNumber: gstNumber.trim().toUpperCase() || undefined,
    });
    setIsSubmitting(false);

    if (result.error) {
      setFormError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push(redirectTarget);
      }, 700);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {!isConfigured && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            Supabase Auth is ready. Set <code className="font-mono text-primary font-semibold">NEXT_PUBLIC_SUPABASE_URL</code> and anon key in <code className="font-mono text-primary font-semibold">.env.local</code> to activate live account creation.
          </p>
        </div>
      )}

      {activeError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{activeError}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>Account created successfully! Redirecting...</span>
        </div>
      )}

      <div>
        <GoogleSignInButton
          redirectTarget={redirectTarget}
          buttonText="Sign up with Google"
          onError={(err) => {
            setDismissedUrlError(true);
            setFormError(err);
          }}
          disabled={isSubmitting}
        />
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-accent/20"></div>
        </div>
        <div className="relative flex justify-center text-2xs uppercase">
          <span className="bg-surface px-2.5 text-muted font-medium tracking-wider">
            Or create wholesale account with details
          </span>
        </div>
      </div>

      {/* Row 1: Full Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: '' }));
            }}
            placeholder="e.g. Ramesh Kumar"
            className={`w-full px-3 py-2 text-xs bg-surface border rounded-md text-charcoal focus:outline-none transition-colors ${
              fieldErrors.fullName ? 'border-red-500 focus:border-red-500 bg-red-50/20' : 'border-accent/30 focus:border-accent'
            }`}
            disabled={isSubmitting}
          />
          {fieldErrors.fullName && (
            <p className="text-[11px] text-red-600 mt-1">{fieldErrors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
            }}
            placeholder="e.g. merchant@clothstore.com"
            className={`w-full px-3 py-2 text-xs bg-surface border rounded-md text-charcoal focus:outline-none transition-colors ${
              fieldErrors.email ? 'border-red-500 focus:border-red-500 bg-red-50/20' : 'border-accent/30 focus:border-accent'
            }`}
            disabled={isSubmitting}
          />
          {fieldErrors.email && (
            <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email}</p>
          )}
        </div>
      </div>

      {/* Row 2: Mobile Number & Customer Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Mobile Number * <span className="text-muted font-normal">(10 Digits)</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs text-muted font-medium select-none">+91</span>
            <input
              type="tel"
              required
              maxLength={10}
              value={phone}
              onChange={(e) => {
                const numeric = e.target.value.replace(/\D/g, '');
                setPhone(numeric);
                if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: '' }));
              }}
              placeholder="9876543210"
              className={`w-full pl-11 pr-3 py-2 text-xs bg-surface border rounded-md text-charcoal focus:outline-none transition-colors ${
                fieldErrors.phone ? 'border-red-500 focus:border-red-500 bg-red-50/20' : 'border-accent/30 focus:border-accent'
              }`}
              disabled={isSubmitting}
            />
          </div>
          {fieldErrors.phone && (
            <p className="text-[11px] text-red-600 mt-1">{fieldErrors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Customer Type *
          </label>
          <select
            value={customerType}
            onChange={(e) => {
              setCustomerType(e.target.value as CustomerType);
              if (fieldErrors.customerType) setFieldErrors((prev) => ({ ...prev, customerType: '' }));
            }}
            className={`w-full px-3 py-2 text-xs bg-surface border rounded-md text-charcoal focus:outline-none transition-colors ${
              fieldErrors.customerType ? 'border-red-500 focus:border-red-500' : 'border-accent/30 focus:border-accent'
            }`}
            disabled={isSubmitting}
          >
            {CUSTOMER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {fieldErrors.customerType && (
            <p className="text-[11px] text-red-600 mt-1">{fieldErrors.customerType}</p>
          )}
        </div>
      </div>

      {/* Row 3: Password & Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Password * <span className="text-muted font-normal">(min 6 chars)</span>
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder="••••••••"
            className={`w-full px-3 py-2 text-xs bg-surface border rounded-md text-charcoal focus:outline-none transition-colors ${
              fieldErrors.password ? 'border-red-500 focus:border-red-500 bg-red-50/20' : 'border-accent/30 focus:border-accent'
            }`}
            disabled={isSubmitting}
          />
          {fieldErrors.password && (
            <p className="text-[11px] text-red-600 mt-1">{fieldErrors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Confirm Password *
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            placeholder="••••••••"
            className={`w-full px-3 py-2 text-xs bg-surface border rounded-md text-charcoal focus:outline-none transition-colors ${
              fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500 bg-red-50/20' : 'border-accent/30 focus:border-accent'
            }`}
            disabled={isSubmitting}
          />
          {fieldErrors.confirmPassword && (
            <p className="text-[11px] text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
          )}
        </div>
      </div>

      {/* Row 4: Optional Business Info (Shop Name & GST Number) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Business / Shop Name <span className="text-muted font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Sri Balaji Cloth Store"
            className="w-full px-3 py-2 text-xs bg-surface border border-accent/30 rounded-md text-charcoal focus:outline-none focus:border-accent"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            GST Number <span className="text-muted font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            maxLength={15}
            value={gstNumber}
            onChange={(e) => {
              setGstNumber(e.target.value.toUpperCase());
              if (fieldErrors.gstNumber) setFieldErrors((prev) => ({ ...prev, gstNumber: '' }));
            }}
            placeholder="e.g. 36AAAAA0000A1Z5"
            className={`w-full px-3 py-2 text-xs bg-surface border rounded-md text-charcoal focus:outline-none uppercase ${
              fieldErrors.gstNumber ? 'border-red-500 focus:border-red-500 bg-red-50/20' : 'border-accent/30 focus:border-accent'
            }`}
            disabled={isSubmitting}
          />
          {fieldErrors.gstNumber && (
            <p className="text-[11px] text-red-600 mt-1">{fieldErrors.gstNumber}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        disabled={isSubmitting}
        className="mt-3"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating Wholesale Account...
          </span>
        ) : (
          'Create Wholesale Account'
        )}
      </Button>

      <div className="pt-2 text-center">
        <p className="text-xs text-muted">
          Already registered?{' '}
          <Link
            href={redirectTarget ? `/login?next=${encodeURIComponent(redirectTarget)}` : '/login'}
            className="text-primary font-semibold hover:text-accent transition-colors"
          >
            Sign In here →
          </Link>
        </p>
      </div>
    </form>
  );
}
