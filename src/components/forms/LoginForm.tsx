'use client';

/**
 * Customer Wholesale Login Form
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Email, Password, Login button
 * - Continue with Google (returns to safe destination, role: customer)
 * - Create Account link with preserved return destination
 * - Forgot Password reset request flow
 * - Automatic redirect to requested ?next= page or /account
 * - Strictly keeps customers on customer pages (never /admin)
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/common/Button';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { createClient } from '@/lib/supabase/client';
import { getAppBaseUrl } from '@/lib/auth/auth-urls';
import { AlertCircle, Loader2, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('next') || searchParams.get('redirect') || '/account';
  const urlError = searchParams.get('error');
  const { login, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [dismissedUrlError, setDismissedUrlError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const activeError = formError || (!dismissedUrlError ? urlError : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDismissedUrlError(true);
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email.trim().toLowerCase(), password);
    setIsSubmitting(false);

    if (result.error) {
      setFormError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        // Customer login never routes to /admin unless user is a verified admin
        if (result.role === 'admin' && (!redirectTarget || redirectTarget === '/account')) {
          router.push('/admin');
        } else {
          router.push(redirectTarget);
        }
      }, 500);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetMessage(null);

    if (!resetEmail.trim()) {
      setResetError('Please enter your registered email address.');
      return;
    }

    setIsResetting(true);
    try {
      const supabase = createClient();
      if (!supabase) {
        setResetError('Database client is not available. Please try again later.');
        setIsResetting(false);
        return;
      }

      const callbackUrl = `${getAppBaseUrl()}/account`;
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
        redirectTo: callbackUrl,
      });

      if (error) {
        setResetError(error.message);
      } else {
        setResetMessage('Password reset link sent! Check your inbox to set a new password.');
      }
    } catch {
      setResetError('Failed to send password reset instructions. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(false);
              setResetError(null);
              setResetMessage(null);
            }}
            className="p-1 -ml-1 text-muted hover:text-charcoal rounded-md flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </div>

        <div>
          <h2 className="text-base font-semibold text-primary">Reset Your Password</h2>
          <p className="text-xs text-muted mt-0.5">
            Enter your registered merchant email address. We will send a secure password reset link.
          </p>
        </div>

        {resetError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{resetError}</span>
          </div>
        )}

        {resetMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{resetMessage}</span>
          </div>
        )}

        <form onSubmit={handleForgotPassword} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Registered Email Address *
            </label>
            <input
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="e.g. merchant@clothstore.com"
              className="w-full px-3.5 py-2.5 text-xs bg-surface border border-accent/30 rounded-md focus:outline-none focus:border-accent text-charcoal shadow-2xs"
              disabled={isResetting}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            disabled={isResetting}
            leftIcon={<KeyRound className="w-3.5 h-3.5" />}
          >
            {isResetting ? 'Sending Instructions...' : 'Send Password Reset Link'}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {!isConfigured && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            Supabase Auth is ready. Add your <code className="font-mono text-primary font-semibold">NEXT_PUBLIC_SUPABASE_URL</code> and anon key to <code className="font-mono text-primary font-semibold">.env.local</code> to activate live login.
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
          <span>Login successful! Redirecting to your account...</span>
        </div>
      )}

      <div>
        <GoogleSignInButton
          redirectTarget={redirectTarget}
          buttonText="Continue with Google"
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
            Or sign in with email
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-charcoal mb-1">
          Registered Email Address *
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. merchant@clothstore.com"
          className="w-full px-3.5 py-2.5 text-xs bg-surface border border-accent/30 rounded-md focus:outline-none focus:border-accent text-charcoal shadow-2xs"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-charcoal">
            Password *
          </label>
          <button
            type="button"
            onClick={() => {
              setResetEmail(email);
              setShowForgotPassword(true);
            }}
            className="text-[11px] text-accent hover:underline font-medium"
          >
            Forgot Password?
          </button>
        </div>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 text-xs bg-surface border border-accent/30 rounded-md focus:outline-none focus:border-accent text-charcoal shadow-2xs"
          disabled={isSubmitting}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        disabled={isSubmitting}
        className="mt-2"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Authenticating...
          </span>
        ) : (
          'Sign In to Wholesale Account'
        )}
      </Button>

      {/* Direct Create Account Option */}
      <div className="pt-2 text-center">
        <p className="text-xs text-muted">
          Don&apos;t have a wholesale account?{' '}
          <Link
            href={redirectTarget ? `/register?next=${encodeURIComponent(redirectTarget)}` : '/register'}
            className="text-primary font-semibold hover:text-accent transition-colors"
          >
            Create Account →
          </Link>
        </p>
      </div>
    </form>
  );
}
