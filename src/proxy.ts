import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static assets and internal endpoints pass straight through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Maintain Supabase auth session cookies & retrieve active session
  const { supabaseResponse, user } = await updateSession(request);

  // 3. If an OAuth authorization code lands on a page instead of /auth/callback,
  // forward immediately to /auth/callback for PKCE session exchange.
  if (request.nextUrl.searchParams.has('code') && pathname !== '/auth/callback') {
    const callbackRedirect = request.nextUrl.clone();
    callbackRedirect.pathname = '/auth/callback';
    return NextResponse.redirect(callbackRedirect);
  }

  // 4. Admin route protection in the unified architecture:
  // Both Customer and Admin run within the SAME Next.js application.
  // When an unauthenticated visitor navigates to /admin or any /admin/* sub-route:
  // immediately redirect them to /admin/login without flashing customer pages or errors.
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return supabaseResponse;
    }

    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      const redirectRes = NextResponse.redirect(loginUrl);
      supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c));
      return redirectRes;
    }

    return supabaseResponse;
  }

  // 5. Standard customer routes pass through with synchronized cookies
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
