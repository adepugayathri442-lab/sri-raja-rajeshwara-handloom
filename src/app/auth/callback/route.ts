/**
 * Supabase OAuth Callback Route Handler
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Exchanges Google OAuth PKCE authorization code for a Supabase session.
 * 
 * Architecture & Deterministic Routing:
 * 1. Admin App Mode (NEXT_PUBLIC_APP_MODE === 'admin' or admin domain):
 *    - Base URL: https://admin-sri-raja-rajeshwara-handloom.vercel.app
 *    - Role Verification: Requires role === 'admin'.
 *    - Non-admin attempts: signed out immediately and redirected to /admin/login?error=access_denied_customer
 *    - Verified admin destination: /admin (Dashboard)
 *    - NEVER redirects to localhost in production.
 * 2. Customer App Mode:
 *    - Base URL: https://sri-raja-rajeshwara-handloom-8gqw.vercel.app
 *    - Profile synced as customer.
 *    - Destination: safe path preserved from cookie or query param (default /account).
 *    - NEVER redirects to localhost in production.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import {
  getAppBaseUrl,
  AUTH_NEXT_COOKIE_NAME,
  isExplicitAdminApp,
} from '@/lib/auth/auth-urls';

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl;
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    requestUrl.host ||
    '';

  const isAdminApp =
    isExplicitAdminApp() ||
    host.startsWith('admin.') ||
    host.includes('admin-sri-raja-rajeshwara-handloom') ||
    host.includes(':3001');

  // Deterministic Base URL: NEVER localhost in production
  const baseUrl = getAppBaseUrl(host);
  const loginPath = isAdminApp ? '/admin/login' : '/login';

  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Retrieve destination from query param or auth cookie
  const cookieNext = request.cookies.get(AUTH_NEXT_COOKIE_NAME)?.value;
  const rawNext =
    requestUrl.searchParams.get('next') ||
    (cookieNext ? decodeURIComponent(cookieNext) : null);

  let safeNext =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
      ? rawNext
      : isAdminApp
      ? '/admin'
      : '/account';

  // If in Admin app, prevent any redirect to customer-only pages (e.g. /account, /cart, /checkout)
  if (isAdminApp) {
    if (
      safeNext === '/account' ||
      safeNext.startsWith('/cart') ||
      safeNext.startsWith('/checkout') ||
      safeNext === '/login'
    ) {
      safeNext = '/admin';
    }
  }

  // Handle OAuth provider errors or cancellations
  if (error) {
    console.error('OAuth error from provider:', error, errorDescription);
    const redirectUrl = new URL(loginPath, baseUrl);
    const userFacingError =
      error === 'access_denied'
        ? 'Google sign-in was cancelled. Please try again.'
        : errorDescription || error;
    redirectUrl.searchParams.set('error', userFacingError);

    const errorResponse = NextResponse.redirect(redirectUrl);
    errorResponse.cookies.delete(AUTH_NEXT_COOKIE_NAME);
    return errorResponse;
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      const redirectUrl = new URL(loginPath, baseUrl);
      redirectUrl.searchParams.set('error', 'Authentication service configuration is missing.');
      const errRes = NextResponse.redirect(redirectUrl);
      errRes.cookies.delete(AUTH_NEXT_COOKIE_NAME);
      return errRes;
    }

    let redirectTargetUrl = new URL(safeNext, baseUrl);
    let response = NextResponse.redirect(redirectTargetUrl);

    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.redirect(redirectTargetUrl);
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const googleFullName =
            (user.user_metadata?.full_name as string) ||
            (user.user_metadata?.name as string) ||
            '';

          // Query existing profile to verify authorization
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .eq('id', user.id)
            .maybeSingle();

          // ------------------------------------------------------------------
          // CASE 1: ADMIN APPLICATION
          // ------------------------------------------------------------------
          if (isAdminApp) {
            // Strictly check admin role. Customers or unverified users CANNOT access admin.
            if (!existingProfile || existingProfile.role !== 'admin') {
              // Sign out from admin context so customer session is not active on admin site
              await supabase.auth.signOut();
              redirectTargetUrl = new URL(
                '/admin/login?error=access_denied_customer',
                baseUrl
              );
              response = NextResponse.redirect(redirectTargetUrl);
              response.cookies.delete(AUTH_NEXT_COOKIE_NAME);
              return response;
            }

            // Verified administrator: ensure destination is /admin
            redirectTargetUrl = new URL(safeNext || '/admin', baseUrl);
            response = NextResponse.redirect(redirectTargetUrl);
            response.cookies.delete(AUTH_NEXT_COOKIE_NAME);
            return response;
          }

          // ------------------------------------------------------------------
          // CASE 2: CUSTOMER APPLICATION
          // ------------------------------------------------------------------
          if (!existingProfile) {
            // New Google user on customer site: create customer profile record
            await supabase.from('profiles').insert({
              id: user.id,
              full_name: googleFullName,
              email: user.email || '',
              phone: (user.user_metadata?.phone as string) || '',
              customer_type: 'Retail Shop',
              business_name: null,
              role: 'customer',
            });
          } else {
            // Backfill name if missing
            if (!existingProfile.full_name && googleFullName) {
              await supabase
                .from('profiles')
                .update({ full_name: googleFullName })
                .eq('id', user.id);
            }
          }
        }
      } catch (profileErr) {
        console.warn('Profile synchronization notice during Google OAuth exchange:', profileErr);
      }

      response.cookies.delete(AUTH_NEXT_COOKIE_NAME);
      return response;
    }

    console.error('Failed to exchange OAuth code for session:', exchangeError.message);
    const redirectUrl = new URL(loginPath, baseUrl);
    redirectUrl.searchParams.set('error', exchangeError.message);
    const errRes = NextResponse.redirect(redirectUrl);
    errRes.cookies.delete(AUTH_NEXT_COOKIE_NAME);
    return errRes;
  }

  // Fallback: accessed callback without authorization code or error
  const fallbackUrl = new URL(loginPath, baseUrl);
  const fallbackRes = NextResponse.redirect(fallbackUrl);
  fallbackRes.cookies.delete(AUTH_NEXT_COOKIE_NAME);
  return fallbackRes;
}
