/**
 * Deterministic Authentication & OAuth URL Resolver
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Unified Production Architecture:
 * - Single Vercel Project & Deployment: https://sri-raja-rajeshwara-handloom.vercel.app
 * - Customer Website: https://sri-raja-rajeshwara-handloom.vercel.app/
 * - Admin Portal: https://sri-raja-rajeshwara-handloom.vercel.app/admin
 * - Unified Auth Callback: https://sri-raja-rajeshwara-handloom.vercel.app/auth/callback
 * 
 * Localhost is allowed strictly during local development.
 * In production builds, localhost is NEVER used under ANY condition.
 */

export const PRODUCTION_SITE_URL = 'https://sri-raja-rajeshwara-handloom.vercel.app';
export const PRODUCTION_CUSTOMER_URL = PRODUCTION_SITE_URL;
export const PRODUCTION_ADMIN_URL = `${PRODUCTION_SITE_URL}/admin`;
export const AUTH_NEXT_COOKIE_NAME = 'srr_auth_next';

export function isExplicitAdminApp(): boolean {
  return false;
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
  // Local development check (strictly only for non-production localhost / 127.0.0.1)
  if (isLocalhost(hostOrOrigin)) {
    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }
    return 'http://localhost:3000';
  }

  // In browser on production, use the actual origin if on vercel.app or custom domain
  if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')) {
    return window.location.origin;
  }

  // Server context: verify host header if provided
  if (hostOrOrigin && !hostOrOrigin.includes('localhost') && !hostOrOrigin.includes('127.0.0.1')) {
    const cleanHost = hostOrOrigin.replace(/^https?:\/\//, '').split('/')[0];
    if (cleanHost && !cleanHost.includes('admin-') && !cleanHost.includes('-8gqw')) {
      return `https://${cleanHost}`;
    }
  }

  // Deterministic Production URL
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_CUSTOMER_URL;
  if (envUrl && !envUrl.includes('admin-') && !envUrl.includes('-8gqw')) {
    return envUrl;
  }

  return PRODUCTION_SITE_URL;
}

/**
 * Returns EXACT unified OAuth callback URL without query params.
 * Single production callback: https://sri-raja-rajeshwara-handloom.vercel.app/auth/callback
 */
export function getAuthCallbackUrl(hostOrOrigin?: string): string {
  const baseUrl = getAppBaseUrl(hostOrOrigin);
  return `${baseUrl}/auth/callback`;
}
