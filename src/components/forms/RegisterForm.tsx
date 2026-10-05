'use client';

import React, { useState } from 'react';
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
  const redirectTarget = searchParams.get('redirect') || '/account';
  const urlError = searchParams.get('error');
  const { register, isConfigured } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('Retail Shop');

  const [formError, setFormError] = useState<string | null>(null);
  const [dismissedUrlError, setDismissedUrlError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeError = formError || (!dismissedUrlError ? urlError : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDismissedUrlError(true);
    setFormError(null);

    if (!fullName.trim() || !phone.trim() || !email.trim() || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      fullName,
      phone,
      email,
      password,
      businessName: businessName || undefined,
      customerType,
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
    <form className="space-y-4" onSubmit={handleSubmit}>
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
            Or register with business details
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            className="w-full px-3 py-2 text-xs bg-surface border border-accent/30 rounded-md text-charcoal focus:outline-none focus:border-accent"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Mobile / Phone Number *
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            className="w-full px-3 py-2 text-xs bg-surface border border-accent/30 rounded-md text-charcoal focus:outline-none focus:border-accent"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            Customer Type *
          </label>
          <select
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value as CustomerType)}
            className="w-full px-3 py-2 text-xs bg-surface border border-accent/30 rounded-md text-charcoal focus:outline-none focus:border-accent"
            disabled={isSubmitting}
          >
            {CUSTOMER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. merchant@clothstore.com"
            className="w-full px-3 py-2 text-xs bg-surface border border-accent/30 rounded-md text-charcoal focus:outline-none focus:border-accent"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Password * <span className="text-muted font-normal">(min 6 chars)</span>
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 text-xs bg-surface border border-accent/30 rounded-md text-charcoal focus:outline-none focus:border-accent"
            disabled={isSubmitting}
          />
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
            Registering Account...
          </span>
        ) : (
          'Register Wholesale Account'
        )}
      </Button>
    </form>
  );
}
