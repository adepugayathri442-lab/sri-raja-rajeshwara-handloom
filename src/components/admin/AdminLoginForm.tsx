'use client';

/**
 * Dedicated Admin Login Form Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Dedicated business owner/administrator sign-in interface
 * - Strict verification of `profiles.role === 'admin'`
 * - Email & Password authentication via Supabase Auth
 * - Google Sign-In support for verified owner Google accounts
 * - Clear denial of normal customer accounts with link to customer storefront
 * - Zero customer shopping navigation
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  LogIn,
  AlertCircle,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Logo } from '@/components/common/Logo';

interface AdminLoginFormProps {
  redirectTarget?: string;
  customerStoreUrl?: string;
}

export function AdminLoginForm({
  redirectTarget = '/admin',
  customerStoreUrl = process.env.NEXT_PUBLIC_CUSTOMER_URL || 'https://sri-raja-rajeshwara-handloom-8gqw.vercel.app',
}: AdminLoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signInWithGoogle, logout, isConfigured, isAuthenticated, isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [accessDeniedError, setAccessDeniedError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If already authenticated with admin role, automatically redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.replace(redirectTarget);
    }
  }, [isAuthenticated, isAdmin, router, redirectTarget]);

  // Derive error messages during render without cascading setState effects
  const errorParam = searchParams.get('error');
  const effectiveAccessDeniedError =
    accessDeniedError ||
    (errorParam === 'access_denied_customer'
      ? 'Access Denied: This account is registered with customer permissions and does not have administrator access. Please sign in with a verified administrator account, or use the wholesale customer storefront.'
      : null);
  const effectiveFormError =
    formError ||
    (errorParam && errorParam !== 'access_denied_customer' ? errorParam : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setAccessDeniedError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setFormError('Please enter both your administrator email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(cleanEmail, password);

      if (result.error) {
        setFormError(result.error);
        setIsSubmitting(false);
        return;
      }

      // Check role strictly: only role === 'admin' is permitted
      if (result.role !== 'admin') {
        // Log out immediately so the customer session is not held on the admin portal
        await logout();
        setAccessDeniedError(
          'Access Denied: This account is registered with customer permissions and does not have administrator access. Please sign in with a verified administrator account, or use the wholesale customer storefront.'
        );
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(redirectTarget);
        router.refresh();
      }, 300);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'An error occurred during administrator authentication.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setAccessDeniedError(null);
    setIsGoogleSubmitting(true);
    try {
      const result = await signInWithGoogle(redirectTarget);
      if (result.error) {
        setFormError(result.error);
        setIsGoogleSubmitting(false);
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Google authentication failed.');
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Identity & Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>Merchant Administration</span>
        </div>

        <div className="flex justify-center mb-2">
          <Logo variant="header" asLink={false} size="sm" />
        </div>

        <h1 className="text-xl sm:text-2xl font-serif font-bold text-primary">
          Owner Operations Portal
        </h1>
        <p className="text-xs text-muted mt-1 leading-relaxed max-w-sm mx-auto">
          Sign in with verified administrator credentials to manage wholesale orders, inventory, and trade settings.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 sm:p-8 space-y-5">
        {/* Supabase status warning if unconfigured */}
        {!isConfigured && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Supabase Connection Notice</span>
              <span>Supabase environment variables are missing in <code className="font-mono bg-white px-1 rounded">.env.local</code>. Please configure before logging in.</span>
            </div>
          </div>
        )}

        {/* Access Denied error alert */}
        {effectiveAccessDeniedError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-2">
            <div className="flex items-start gap-2 font-semibold text-red-900">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>Administrator Privileges Required</span>
            </div>
            <p className="leading-relaxed text-red-700 pl-6">
              {effectiveAccessDeniedError}
            </p>
            <div className="pl-6 pt-1">
              <a
                href={customerStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary underline hover:text-primary-hover"
              >
                <span>Go to Wholesale Customer Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* General form error alert */}
        {effectiveFormError && !effectiveAccessDeniedError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{effectiveFormError}</span>
          </div>
        )}

        {/* Success feedback */}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">Administrator verified. Redirecting to dashboard...</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1" htmlFor="admin-email">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                placeholder="owner@srhandloom.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || success}
                className="w-full pl-9 pr-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-charcoal placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1" htmlFor="admin-password">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || success}
                className="w-full pl-9 pr-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-charcoal placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting || success}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Admin Credentials...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Admin Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-surface px-3 text-[11px] uppercase tracking-wider text-muted font-medium">
            or
          </span>
        </div>

        {/* Google OAuth for Authorized Owner Google Account */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || isGoogleSubmitting || success}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-surface-subtle text-charcoal border border-border text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
        >
          {isGoogleSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-muted" />
              <span>Connecting with Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        {/* Security & Customer Redirection Notice */}
        <div className="pt-2 border-t border-border/70 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
            <Lock className="w-3 h-3 text-accent" />
            <span>Protected by Supabase Row-Level Security</span>
          </div>

          <p className="text-[11px] text-muted">
            Wholesale buyer looking to place an order?{' '}
            <a
              href={customerStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:text-accent underline inline-flex items-center gap-0.5"
            >
              <span>Visit Customer Storefront</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
