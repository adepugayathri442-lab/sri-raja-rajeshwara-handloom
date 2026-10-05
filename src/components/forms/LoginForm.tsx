'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/common/Button';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/account';
  const urlError = searchParams.get('error');
  const { login, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [dismissedUrlError, setDismissedUrlError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeError = formError || (!dismissedUrlError ? urlError : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDismissedUrlError(true);
    setFormError(null);

    if (!email || !password) {
      setFormError('Please enter both your email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.error) {
      setFormError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        if (result.role === 'admin' && (!redirectTarget || redirectTarget === '/account')) {
          router.push('/admin');
        } else {
          router.push(redirectTarget);
        }
      }, 500);
    }
  };

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
          <span>Login successful! Redirecting...</span>
        </div>
      )}

      <div>
        <GoogleSignInButton
          redirectTarget={redirectTarget}
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
          className="w-full px-3.5 py-2.5 text-sm bg-surface border border-accent/30 rounded-md focus:outline-none focus:border-accent text-charcoal shadow-2xs"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-charcoal">
            Password *
          </label>
        </div>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 text-sm bg-surface border border-accent/30 rounded-md focus:outline-none focus:border-accent text-charcoal shadow-2xs"
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
          'Sign In to Merchant Account'
        )}
      </Button>
    </form>
  );
}
