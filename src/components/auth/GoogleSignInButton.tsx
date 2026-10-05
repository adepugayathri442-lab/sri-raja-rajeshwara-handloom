'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  redirectTarget?: string;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  buttonText?: string;
}

export function GoogleSignInButton({
  redirectTarget,
  onError,
  disabled = false,
  className = '',
  buttonText = 'Continue with Google',
}: GoogleSignInButtonProps) {
  const { signInWithGoogle, isConfigured } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    if (!isConfigured) {
      onError?.('Supabase credentials are not yet configured in environment variables.');
      return;
    }

    setIsLoading(true);
    const result = await signInWithGoogle(redirectTarget);
    if (result.error) {
      setIsLoading(false);
      onError?.(result.error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-label={buttonText}
      className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-surface hover:bg-neutral-50/80 active:bg-neutral-100 text-charcoal border border-accent/40 hover:border-accent rounded-md font-medium text-xs sm:text-sm transition-all duration-150 shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
      ) : (
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.02h3.87c2.26-2.09 3.67-5.17 3.67-9.12z"
            fill="#4285F4"
          />
          <path
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.12C3.26 21.36 7.34 24 12 24z"
            fill="#34A853"
          />
          <path
            d="M5.27 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.61H1.27C.46 8.23 0 10.06 0 12s.46 3.77 1.27 5.39l4-3.12z"
            fill="#FBBC05"
          />
          <path
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.27 6.61l4 3.12c.95-2.85 3.6-4.98 6.73-4.98z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span className="font-semibold text-charcoal tracking-tight">
        {isLoading ? 'Connecting to Google...' : buttonText}
      </span>
    </button>
  );
}
