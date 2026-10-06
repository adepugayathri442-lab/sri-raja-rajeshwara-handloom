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
 * Authorized Admin Accounts:
 * 1. adepugayathri442@gmail.com (UID: 6eda0e3c-732e-4c1f-839a-01b019a6a49e)
 * 2. adepugayathri28@gmail.com (UID: 2bd6cdb5-e013-411d-92f4-23e787c27c4c)
 * 
 * Flow & Security:
 * 1. Exchanges OAuth code for session cookies.
 * 2. Checks user against authorized admin credentials and database profiles.
 * 3. If user is an authorized admin:
 *    - Ensures their profile exists in public.profiles with role = 'admin'.
 *    - Redirects to /admin with all session cookies preserved.
 * 4. If login originated from /admin but user is NOT an admin:
 *    - Signs out immediately and redirects to /admin/login?error=access_denied_customer.
 * 5. If login originated from customer storefront:
 *    - Standard customer onboarding/session flow.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import {
  getAppBaseUrl,
  AUTH_NEXT_COOKIE_NAME,
} from '@/lib/auth/auth-urls';

const ADMIN_UIDS = new Set([
  '6eda0e3c-732e-4c1f-839a-01b019a6a49e', // adepugayathri442@gmail.com
  '2bd6cdb5-e013-411d-92f4-23e787c27c4c', // adepugayathri28@gmail.com
]);

const ADMIN_EMAILS = new Set([
  'adepugayathri442@gmail.com',
  'adepugayathri28@gmail.com',
]);

function isAuthorizedAdmin(userId: string, email?: string | null): boolean {
  if (ADMIN_UIDS.has(userId)) return true;
  if (email && ADMIN_EMAILS.has(email.toLowerCase().trim())) return true;
  return false;
}

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
  const baseUrl = getAppBaseUrl();

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

    // Default redirect response that accumulates session cookies via setAll
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

          const userIsAdmin = isAuthorizedAdmin(user.id, user.email);

          // Query existing profile to verify authorization
          let existingProfile = null;

          const { data: profileById } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .eq('id', user.id)
            .maybeSingle();

          existingProfile = profileById;

          if (!existingProfile && user.email) {
            const { data: profileByEmail } = await supabase
              .from('profiles')
              .select('id, full_name, email, role')
              .eq('email', user.email.toLowerCase())
              .maybeSingle();

            if (profileByEmail) {
              existingProfile = profileByEmail;
            }
          }

          // ------------------------------------------------------------------
          // ADMIN ACCOUNT HANDLING (Designated Admin or profiles.role === 'admin')
          // ------------------------------------------------------------------
          if (userIsAdmin || existingProfile?.role === 'admin') {
            // Ensure profile exists with role = 'admin'
            if (!existingProfile) {
              const { data: createdProfile } = await supabase
                .from('profiles')
                .upsert({
                  id: user.id,
                  full_name: googleFullName || 'Gayathri Adepu',
                  email: user.email || 'adepugayathri442@gmail.com',
                  phone: (user.user_metadata?.phone as string) || '',
                  customer_type: 'Business',
                  business_name: 'Sri Raja Rajeshwara Handloom',
                  role: 'admin',
                })
                .select('id, full_name, email, role')
                .maybeSingle();

              if (createdProfile) {
                existingProfile = createdProfile;
              }
            } else if (existingProfile.role !== 'admin') {
              await supabase
                .from('profiles')
                .update({ role: 'admin', updated_at: new Date().toISOString() })
                .eq('id', user.id);

              existingProfile.role = 'admin';
            }

            // Confirmed administrator: redirect directly to /admin dashboard
            const adminDestination = safeNext.startsWith('/admin') ? safeNext : '/admin';
            const adminTargetUrl = new URL(adminDestination, baseUrl);
            return createRedirectWithCookies(adminTargetUrl, cookieCollectorResponse);
          }

          // ------------------------------------------------------------------
          // NON-ADMIN ATTEMPTING ADMIN ACCESS
          // ------------------------------------------------------------------
          if (isAdminFlow) {
            // Non-admin account clicked "Continue with Google" on /admin/login:
            // Sign out session immediately to prevent access to admin portal
            await supabase.auth.signOut();
            const accessDeniedUrl = new URL(
              '/admin/login?error=access_denied_customer',
              baseUrl
            );
            return createRedirectWithCookies(accessDeniedUrl, cookieCollectorResponse);
          }

          // ------------------------------------------------------------------
          // CUSTOMER STOREFRONT FLOW
          // ------------------------------------------------------------------
          if (!existingProfile) {
            // New customer registration via Google on storefront
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
            if (!existingProfile.full_name && googleFullName) {
              await supabase
                .from('profiles')
                .update({ full_name: googleFullName })
                .eq('id', user.id);
            }
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
