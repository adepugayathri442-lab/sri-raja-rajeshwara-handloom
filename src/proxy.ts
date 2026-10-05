import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const ADMIN_SECTIONS = [
  'products',
  'categories',
  'orders',
  'customers',
  'stock',
  'wholesale-enquiries',
  'delivery-charges',
  'payments',
  'reports',
  'settings',
  'login',
];

const CUSTOMER_ONLY_ROUTES = [
  'cart',
  'checkout',
  'wholesale-enquiry',
];

export async function proxy(request: NextRequest) {
  // 1. Maintain Supabase auth session cookies
  const supabaseResponse = await updateSession(request);

  const { pathname, search } = request.nextUrl;

  // Static assets and internal endpoints pass straight through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return supabaseResponse;
  }

  // If an OAuth authorization code lands on a page instead of /auth/callback,
  // immediately forward to /auth/callback so the PKCE code exchange executes cleanly.
  if (request.nextUrl.searchParams.has('code') && pathname !== '/auth/callback') {
    const callbackRedirect = request.nextUrl.clone();
    callbackRedirect.pathname = '/auth/callback';
    return NextResponse.redirect(callbackRedirect);
  }

  // 2. Identify whether request belongs to Admin Application or Customer Application
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const isExplicitAdminMode = process.env.NEXT_PUBLIC_APP_MODE === 'admin';
  const isAdminDomain =
    host.startsWith('admin.') ||
    host.includes('admin-sri-raja-rajeshwara-handloom') ||
    host.includes(':3001'); // Port 3001 reserved for local admin testing
  const isAdminApp = isExplicitAdminMode || isAdminDomain;

  const adminBaseUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin-sri-raja-rajeshwara-handloom.vercel.app';
  const customerBaseUrl =
    process.env.NEXT_PUBLIC_CUSTOMER_URL || 'https://sri-raja-rajeshwara-handloom-8gqw.vercel.app';

  // --------------------------------------------------------------------------
  // CASE A: CUSTOMER WEBSITE MODE
  // --------------------------------------------------------------------------
  if (!isAdminApp) {
    // If visitor or merchant enters /admin on the public customer storefront,
    // seamlessly redirect them to the dedicated Admin Production Website.
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      // In production (or when NEXT_PUBLIC_ADMIN_URL is defined), redirect to separate admin site
      if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ADMIN_URL) {
        const subPath = pathname.replace(/^\/admin/, '') || '/';
        const targetUrl = new URL(subPath + search, adminBaseUrl);
        const redirectRes = NextResponse.redirect(targetUrl, 307);
        supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c));
        return redirectRes;
      }
    }

    // Normal customer storefront browsing
    return supabaseResponse;
  }

  // --------------------------------------------------------------------------
  // CASE B: DEDICATED ADMIN WEBSITE MODE
  // --------------------------------------------------------------------------

  // If a shopping-only route is accessed on the Admin website, redirect to customer storefront
  if (CUSTOMER_ONLY_ROUTES.some((route) => pathname === `/${route}` || pathname.startsWith(`/${route}/`))) {
    const targetUrl = new URL(pathname + search, customerBaseUrl);
    const redirectRes = NextResponse.redirect(targetUrl, 307);
    supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c));
    return redirectRes;
  }

  // Root on Admin website -> rewrite to /admin (Dashboard)
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    const rewriteRes = NextResponse.rewrite(url);
    supabaseResponse.cookies.getAll().forEach((c) => rewriteRes.cookies.set(c));
    return rewriteRes;
  }

  // Clean admin routes (e.g. /orders, /products, /stock) -> rewrite to /admin/*
  for (const section of ADMIN_SECTIONS) {
    if (pathname === `/${section}` || pathname.startsWith(`/${section}/`)) {
      const url = request.nextUrl.clone();
      url.pathname = `/admin${pathname}`;
      const rewriteRes = NextResponse.rewrite(url);
      supabaseResponse.cookies.getAll().forEach((c) => rewriteRes.cookies.set(c));
      return rewriteRes;
    }
  }

  // Already prefixed with /admin or standard fallback
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
