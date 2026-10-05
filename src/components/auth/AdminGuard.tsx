'use client';

/**
 * Admin Route Guard Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Access Control Rules:
 * - Admin access strictly depends on: `profiles.role = 'admin'`
 * - If user is not authenticated: render dedicated AdminLoginForm directly
 * - If user is a normal customer (`role = 'customer'`): BLOCK access with clear denial & link to customer storefront
 * - If user is verified admin (`role = 'admin'`): grant access and render admin children
 */

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { ShieldAlert, Lock, ArrowLeft, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, isAdmin, isLoading, isConfigured, profile, user, logout } = useAuth();
  const customerStoreUrl = process.env.NEXT_PUBLIC_CUSTOMER_URL || 'https://sri-raja-rajeshwara-handloom-8gqw.vercel.app';

  // 1. Loading state while verifying Supabase session & profiles.role
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8">
        <div className="p-8 rounded-xl bg-white border border-accent/20 shadow-sm max-w-sm w-full text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-base font-serif font-bold text-primary">Verifying Administrator Access</h2>
          <p className="text-xs text-muted mt-1">
            Checking Supabase credentials and database permissions...
          </p>
        </div>
      </div>
    );
  }

  // 2. If Supabase environment variables are missing
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
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
            <a href={customerStoreUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Return to Storefront
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthenticated visitor: render dedicated Admin Login Form directly
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <AdminLoginForm redirectTarget="/admin" customerStoreUrl={customerStoreUrl} />
      </div>
    );
  }

  // 4. Authenticated, but normal customer role: strictly blocked
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-md p-6 sm:p-8 text-center space-y-4">
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
            Logged in as <strong className="text-charcoal font-semibold">{profile?.fullName || user?.email}</strong> with customer role. This account does not have owner/administrator permissions.
          </p>

          <div className="p-3 bg-red-50/60 rounded-lg text-xs text-red-800 text-left border border-red-100">
            <p className="font-semibold mb-1">Why am I seeing this?</p>
            <p className="text-[11px] leading-relaxed">
              The Admin Portal is restricted to Sri Raja Rajeshwara Handloom merchant owners. Normal customer accounts cannot access order dispatches, inventory, or business settings.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              className="w-full sm:w-auto"
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
            <a href={customerStoreUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Go to Customer Store
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 5. Confirmed Admin: profiles.role === 'admin' -> grant full access
  return <>{children}</>;
}
