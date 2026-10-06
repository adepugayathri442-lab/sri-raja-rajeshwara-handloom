import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const PRODUCTION_DOMAIN = 'https://sri-raja-rajeshwara-handloom.vercel.app';

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';

  // 1. Permanently redirect any legacy deployment domain (-8gqw or admin-) to primary production domain
  if (host.includes('-8gqw') || host.includes('admin-sri-raja-rajeshwara-handloom')) {
    const permanentTarget = new URL(pathname + search, PRODUCTION_DOMAIN);
    return NextResponse.redirect(permanentTarget, 301);
  }

  // 2. Static assets and internal endpoints pass straight through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 3. Maintain Supabase auth session cookies & retrieve active session
  const { supabaseResponse, user } = await updateSession(request);

  // 4. If an OAuth authorization code lands on any page other than /auth/callback,
  // immediately forward to https://sri-raja-rajeshwara-handloom.vercel.app/auth/callback
  if (request.nextUrl.searchParams.has('code') && pathname !== '/auth/callback') {
    const callbackRedirect = new URL('/auth/callback', PRODUCTION_DOMAIN);
    request.nextUrl.searchParams.forEach((val, key) => {
      callbackRedirect.searchParams.set(key, val);
    });
    return NextResponse.redirect(callbackRedirect);
  }

  // 5. Admin route protection in the unified architecture:
  // Both Customer and Admin run within the SAME Next.js application.
  // When an unauthenticated visitor navigates to /admin or any /admin/* sub-route:
  // immediately redirect them to /admin/login without flashing customer pages or errors.
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return supabaseResponse;
    }

    if (!user) {
      const loginUrl = new URL('/admin/login', request.url.includes('localhost') ? request.url : PRODUCTION_DOMAIN);
      const redirectRes = NextResponse.redirect(loginUrl);
      supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c));
      return redirectRes;
    }

    return supabaseResponse;
  }

  // 6. Standard customer routes pass through with synchronized cookies
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
