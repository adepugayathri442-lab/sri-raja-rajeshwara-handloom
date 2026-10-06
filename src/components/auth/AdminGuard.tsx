'use client';

/**
 * Admin Route Guard Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Strict Access Control Rules:
 * - Admin access strictly requires: `profiles.role = 'admin'`
 * - Unauthenticated user accessing /admin or /admin/*:
 *     Safely routed to /admin/login
 * - Authenticated normal customer (`role = 'customer'`):
 *     Strictly blocked with Access Restricted screen and link to customer website
 * - Authenticated admin (`role = 'admin'`):
 *     Granted full access to Admin Portal
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { ShieldAlert, ArrowLeft, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading, profile, user, logout } = useAuth();
  const isLoginPage = pathname === '/admin/login';

  // If already authenticated with admin role and visiting /admin/login, send to dashboard
  useEffect(() => {
    if (isLoginPage && !isLoading && isAuthenticated && isAdmin) {
      router.replace('/admin');
    }
  }, [isLoginPage, isLoading, isAuthenticated, isAdmin, router]);

  // If unauthenticated and trying to access protected admin pages, send to login
  useEffect(() => {
    if (!isLoginPage && !isLoading && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isLoginPage, isLoading, isAuthenticated, router]);

  // 1. Loading state while verifying Supabase session & profiles.role
  if (isLoading) {
    if (isLoginPage) {
      return <>{children}</>;
    }
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

  // 2. Login page handling
  if (isLoginPage) {
    if (isAuthenticated && isAdmin) {
      return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-xs text-muted">Redirecting to Admin Dashboard...</p>
        </div>
      );
    }
    return <>{children}</>;
  }

  // 3. Unauthenticated visitor on protected admin route: redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
        <p className="text-xs text-muted">Redirecting to Administrator Sign In...</p>
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
              className="w-full sm:w-auto cursor-pointer"
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full cursor-pointer">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Go to Customer Store
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 5. Confirmed Admin: profiles.role === 'admin' -> grant full access
  return <>{children}</>;
}
