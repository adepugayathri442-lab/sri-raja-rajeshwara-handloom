/**
 * Deterministic Authentication & OAuth URL Resolver
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Rules:
 * 1. If running as Admin (NEXT_PUBLIC_APP_MODE === 'admin' or admin domain):
 *    - Base URL: https://admin-sri-raja-rajeshwara-handloom.vercel.app
 *    - OAuth Callback: https://admin-sri-raja-rajeshwara-handloom.vercel.app/auth/callback
 * 2. If running as Customer (default):
 *    - Base URL: https://sri-raja-rajeshwara-handloom-8gqw.vercel.app
 *    - OAuth Callback: https://sri-raja-rajeshwara-handloom-8gqw.vercel.app/auth/callback
 * 3. Localhost is permitted ONLY during local development (when hostname is localhost / 127.0.0.1).
 *    In production builds, localhost is NEVER used as a fallback under ANY condition.
 */

export const PRODUCTION_CUSTOMER_URL = 'https://sri-raja-rajeshwara-handloom-8gqw.vercel.app';
export const PRODUCTION_ADMIN_URL = 'https://admin-sri-raja-rajeshwara-handloom.vercel.app';
export const AUTH_NEXT_COOKIE_NAME = 'srr_auth_next';

export function isExplicitAdminApp(): boolean {
  return process.env.NEXT_PUBLIC_APP_MODE === 'admin';
}

export function isLocalhost(hostOrOrigin?: string): boolean {
  // In production builds or on Vercel, localhost is NEVER allowed
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    return false;
  }
  if (typeof window !== 'undefined') {
    const h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1';
  }
  if (hostOrOrigin) {
    return hostOrOrigin.includes('localhost') || hostOrOrigin.includes('127.0.0.1');
  }
  return false;
}

export function getAppBaseUrl(hostOrOrigin?: string): string {
  // 1. Identify Admin Application
  const isHostAdmin = hostOrOrigin
    ? hostOrOrigin.includes('admin.') ||
      hostOrOrigin.includes('admin-sri-raja-rajeshwara-handloom') ||
      hostOrOrigin.includes(':3001')
    : false;
  const isClientAdmin =
    typeof window !== 'undefined' &&
    (window.location.hostname.startsWith('admin.') ||
      window.location.hostname.includes('admin-sri-raja-rajeshwara-handloom') ||
      window.location.port === '3001');

  const isAdmin = isExplicitAdminApp() || isHostAdmin || isClientAdmin;

  // 2. Local development check (strictly only for non-production localhost / 127.0.0.1)
  if (isLocalhost(hostOrOrigin)) {
    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }
    if (isAdmin) {
      return 'http://localhost:3001';
    }
    return 'http://localhost:3000';
  }

  // 3. Deterministic Production URL (NEVER localhost in production)
  if (isAdmin) {
    return process.env.NEXT_PUBLIC_ADMIN_URL || PRODUCTION_ADMIN_URL;
  }
  return (
    process.env.NEXT_PUBLIC_CUSTOMER_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    PRODUCTION_CUSTOMER_URL
  );
}

/**
 * Returns EXACT OAuth callback URL without query params.
 * Admin: https://admin-sri-raja-rajeshwara-handloom.vercel.app/auth/callback
 * Customer: https://sri-raja-rajeshwara-handloom-8gqw.vercel.app/auth/callback
 */
export function getAuthCallbackUrl(hostOrOrigin?: string): string {
  const baseUrl = getAppBaseUrl(hostOrOrigin);
  return `${baseUrl}/auth/callback`;
}
