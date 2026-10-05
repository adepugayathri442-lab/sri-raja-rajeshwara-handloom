'use client';

/**
 * Admin Route Guard Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Access Control Rules:
 * - Admin access strictly depends on: `profiles.role = 'admin'`
 * - If user is not authenticated: redirect to `/login?redirect=/admin`
 * - If user is a normal customer (`role = 'customer'`): BLOCK access and redirect to `/account`
 * - If user is verified admin (`role = 'admin'`): grant access and render admin children
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { ShieldAlert, Lock, ArrowLeft, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading, isConfigured, profile, user } = useAuth();

  useEffect(() => {
    if (!isLoading && isConfigured) {
      if (!isAuthenticated) {
        // Unauthenticated visitor -> redirect to login with return target
        router.replace('/login?redirect=/admin');
      } else if (!isAdmin) {
        // Normal customer account -> block and redirect to customer account page
        router.replace('/account');
      }
    }
  }, [isLoading, isConfigured, isAuthenticated, isAdmin, router]);

  // Loading state while verifying Supabase session & profiles.role
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8">
        <div className="p-8 rounded-xl bg-white border border-accent/20 shadow-sm max-w-sm w-full text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-base font-serif font-bold text-primary">Verifying Owner Access</h2>
          <p className="text-xs text-muted mt-1">
            Checking Supabase credentials and database permission...
          </p>
        </div>
      </div>
    );
  }

  // If Supabase environment variables are missing
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-accent/30 shadow-md p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent block mb-1">
              Admin Portal Security
            </span>
            <h1 className="text-xl font-serif font-bold text-primary">
              Supabase Configuration Required
            </h1>
          </div>

          <p className="text-xs text-charcoal/70 leading-relaxed">
            The admin portal requires active Supabase Database and Auth environment variables in <code className="font-mono bg-surface-alt px-1.5 py-0.5 rounded text-[11px] text-primary">.env.local</code>.
          </p>

          <div className="bg-surface-alt rounded-lg p-3 text-left border border-accent/20 text-xs font-mono space-y-1 text-charcoal/80">
            <p className="text-[11px] text-muted font-sans font-semibold uppercase">Required Variables:</p>
            <p>NEXT_PUBLIC_SUPABASE_URL=...</p>
            <p>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Return to Storefront
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated user attempting to access /admin (shows while redirecting)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-accent/30 shadow-md p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent block mb-1">
              Owner Control Center
            </span>
            <h1 className="text-xl font-serif font-bold text-primary">
              Admin Authentication Required
            </h1>
          </div>

          <p className="text-xs text-charcoal/70 leading-relaxed">
            Access to Sri Raja Rajeshwara Handloom administrative controls, stock management, and customer orders is restricted to verified administrators. Redirecting to sign in...
          </p>

          <div className="pt-3 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link href="/login?redirect=/admin" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full">
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign In as Admin
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Return to Storefront
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated, but normal customer role: strictly blocked and redirecting to /account
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-red-200 shadow-md p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto border border-red-200">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600 block mb-1">
              Access Restricted
            </span>
            <h1 className="text-xl font-serif font-bold text-primary">
              Admin Privileges Required
            </h1>
          </div>

          <p className="text-xs text-charcoal/70 leading-relaxed">
            Logged in as <strong className="text-charcoal font-semibold">{profile?.fullName || user?.email}</strong> with customer role. This account does not have owner/administrator permissions. Redirecting to your customer account...
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link href="/account" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full">
                Go to My Account
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Return to Storefront
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Confirmed Admin: profiles.role === 'admin'
  return <>{children}</>;
}
