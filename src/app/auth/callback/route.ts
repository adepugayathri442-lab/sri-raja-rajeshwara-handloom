/**
 * Supabase OAuth Callback Route Handler
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Exchanges Google OAuth PKCE authorization code for a Supabase session.
 * 
 * Unified Production Architecture:
 * - Production Base URL: https://sri-raja-rajeshwara-handloom.vercel.app
 * - Callback URL: https://sri-raja-rajeshwara-handloom.vercel.app/auth/callback
 * 
 * Flow & Security:
 * 1. Exchanges OAuth code for session cookies.
 * 2. If login initiated from /admin (or requested destination starts with /admin):
 *    - Query profiles to check role.
 *    - If role === 'admin': Redirect to /admin (Admin Dashboard) with session cookies preserved.
 *    - If role !== 'admin': Sign out session immediately and redirect to /admin/login?error=access_denied_customer.
 * 3. If login initiated from customer storefront:
 *    - Upsert customer profile if needed.
 *    - Redirect to safe customer destination (e.g. /account, /checkout).
 * 4. Preserves all session cookies on all redirect responses.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import {
  getAppBaseUrl,
  AUTH_NEXT_COOKIE_NAME,
} from '@/lib/auth/auth-urls';

function createRedirectWithCookies(
  targetUrl: URL | string,
  cookieSource: NextResponse
): NextResponse {
  const finalRes = NextResponse.redirect(targetUrl);
  cookieSource.cookies.getAll().forEach((cookie) => {
    finalRes.cookies.set(cookie);
  });
  finalRes.cookies.delete(AUTH_NEXT_COOKIE_NAME);
  return finalRes;
}

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl;
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    requestUrl.host ||
    '';

  const baseUrl = getAppBaseUrl(host);

  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Retrieve destination from query param or auth cookie
  const cookieNext = request.cookies.get(AUTH_NEXT_COOKIE_NAME)?.value;
  const rawNext =
    requestUrl.searchParams.get('next') ||
    (cookieNext ? decodeURIComponent(cookieNext) : null);

  const isAdminFlow = Boolean(rawNext && rawNext.startsWith('/admin'));

  const safeNext =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
      ? rawNext
      : isAdminFlow
      ? '/admin'
      : '/account';

  const loginPath = isAdminFlow ? '/admin/login' : '/login';

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

    // Default redirect response that will accumulate session cookies via setAll
    const redirectTargetUrl = new URL(safeNext, baseUrl);
    const cookieCollectorResponse = NextResponse.redirect(redirectTargetUrl);

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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieCollectorResponse.cookies.set(name, value, options)
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
          let existingProfile = null;

          const { data: profileById } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .eq('id', user.id)
            .maybeSingle();

          existingProfile = profileById;

          if (!existingProfile && user.email) {
            const { data: profileByEmail } = await supabase
              .from('profiles')
              .select('id, full_name, role')
              .eq('email', user.email.toLowerCase())
              .maybeSingle();

            if (profileByEmail) {
              existingProfile = profileByEmail;
            }
          }

          // ------------------------------------------------------------------
          // CASE 1: ADMIN FLOW (Initiated from /admin or safeNext is /admin)
          // ------------------------------------------------------------------
          if (isAdminFlow) {
            // Strictly check admin role. Customers or unverified users CANNOT access admin.
            if (!existingProfile || existingProfile.role !== 'admin') {
              // Sign out from admin context so customer session is not active on admin portal
              await supabase.auth.signOut();
              const accessDeniedUrl = new URL(
                '/admin/login?error=access_denied_customer',
                baseUrl
              );
              return createRedirectWithCookies(accessDeniedUrl, cookieCollectorResponse);
            }

            // Verified administrator: redirect to /admin with full session cookies
            const adminDestination = safeNext.startsWith('/admin') ? safeNext : '/admin';
            const adminTargetUrl = new URL(adminDestination, baseUrl);
            return createRedirectWithCookies(adminTargetUrl, cookieCollectorResponse);
          }

          // ------------------------------------------------------------------
          // CASE 2: CUSTOMER FLOW
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

          // If an admin signed in through customer portal without specific destination, send to /admin
          if (existingProfile?.role === 'admin' && safeNext === '/account') {
            const adminTargetUrl = new URL('/admin', baseUrl);
            return createRedirectWithCookies(adminTargetUrl, cookieCollectorResponse);
          }

          const customerTargetUrl = new URL(safeNext, baseUrl);
          return createRedirectWithCookies(customerTargetUrl, cookieCollectorResponse);
        }
      } catch (profileErr) {
        console.warn('Profile synchronization notice during Google OAuth exchange:', profileErr);
      }

      return createRedirectWithCookies(redirectTargetUrl, cookieCollectorResponse);
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
