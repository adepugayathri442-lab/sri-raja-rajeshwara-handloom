/**
 * Supabase OAuth Callback Route Handler
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Exchanges Google OAuth PKCE authorization code for a Supabase session.
 * Safely initializes customer profile records without requiring a separate password
 * or registration form. Preserves original destination (e.g. /checkout).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl;
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/account';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Prevent open redirect vulnerabilities: only allow relative paths
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/account';

  // Handle OAuth provider cancellation or errors
  if (error) {
    console.error('Google OAuth error from provider:', error, errorDescription);
    const redirectUrl = new URL('/login', requestUrl.origin);
    const userFacingError =
      error === 'access_denied'
        ? 'Google sign-in was cancelled. Please try again or sign in with your email.'
        : errorDescription || error;
    redirectUrl.searchParams.set('error', userFacingError);
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      const redirectUrl = new URL('/login', requestUrl.origin);
      redirectUrl.searchParams.set('error', 'Authentication service configuration is missing.');
      return NextResponse.redirect(redirectUrl);
    }

    let redirectTargetUrl = new URL(safeNext, requestUrl.origin);
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
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const googleFullName =
            (user.user_metadata?.full_name as string) ||
            (user.user_metadata?.name as string) ||
            '';

          // Query existing profile to verify state
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .eq('id', user.id)
            .maybeSingle();

          if (!existingProfile) {
            // New Google user: Ensure customer profile exists
            // RULE: Role is ALWAYS 'customer' — NEVER grant admin automatically
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
            // Existing customer profile: preserve all existing details.
            // Only backfill full_name if it was completely blank and Google provides it.
            if (!existingProfile.full_name && googleFullName) {
              await supabase
                .from('profiles')
                .update({ full_name: googleFullName })
                .eq('id', user.id);
            }

            // If an existing verified admin logs in with Google and no custom redirect was requested, send to /admin
            if (existingProfile.role === 'admin' && safeNext === '/account') {
              redirectTargetUrl = new URL('/admin', requestUrl.origin);
              response = NextResponse.redirect(redirectTargetUrl);
            }
          }
        }
      } catch (profileErr) {
        // Non-blocking fallback; Supabase database trigger handles integrity
        console.warn('Profile synchronization notice during Google OAuth exchange:', profileErr);
      }

      return response;
    }

    console.error('Failed to exchange OAuth code for session:', exchangeError.message);
    const redirectUrl = new URL('/login', requestUrl.origin);
    redirectUrl.searchParams.set('error', exchangeError.message);
    return NextResponse.redirect(redirectUrl);
  }

  // Fallback: accessed callback without authorization code or error
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
