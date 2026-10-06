/**
 * Deterministic Authentication & OAuth URL Resolver
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Strict Production Architecture:
 * - Single Production Domain: https://sri-raja-rajeshwara-handloom.vercel.app
 * - Customer Website: https://sri-raja-rajeshwara-handloom.vercel.app/
 * - Admin Portal: https://sri-raja-rajeshwara-handloom.vercel.app/admin
 * - Production OAuth Callback: https://sri-raja-rajeshwara-handloom.vercel.app/auth/callback
 * 
 * Rules:
 * - NEVER use deployment-specific Vercel preview domains (e.g. -8gqw).
 * - NEVER use window.location.origin for production OAuth callbacks.
 * - Localhost is permitted ONLY during non-production local development.
 */

export const PRODUCTION_SITE_URL = 'https://sri-raja-rajeshwara-handloom.vercel.app';
export const PRODUCTION_CUSTOMER_URL = 'https://sri-raja-rajeshwara-handloom.vercel.app';
export const PRODUCTION_ADMIN_URL = 'https://sri-raja-rajeshwara-handloom.vercel.app/admin';
export const PRODUCTION_AUTH_CALLBACK_URL = 'https://sri-raja-rajeshwara-handloom.vercel.app/auth/callback';
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

export function getAppBaseUrl(): string {
  if (isLocalhost()) {
    return 'http://localhost:3000';
  }
  return PRODUCTION_SITE_URL;
}

/**
 * Returns EXACT unified OAuth callback URL without query params.
 * In production, strictly: https://sri-raja-rajeshwara-handloom.vercel.app/auth/callback
 */
export function getAuthCallbackUrl(): string {
  if (isLocalhost()) {
    return 'http://localhost:3000/auth/callback';
  }
  return PRODUCTION_AUTH_CALLBACK_URL;
}
