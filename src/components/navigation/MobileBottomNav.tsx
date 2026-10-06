'use client';

/**
 * Mobile Bottom Navigation Bar
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - App-like sticky bottom navigation bar exclusively for mobile viewports (hidden on md: and above)
 * - 6 key B2B wholesale destinations:
 *   1. Home (/)
 *   2. Categories (/categories)
 *   3. Products (/products)
 *   4. Enquiry (/wholesale-enquiry)
 *   5. Cart (/cart) with live piece badge
 *   6. Account (/account or /login)
 * - Touch-friendly targets (>= 48px), high contrast, accessible labels
 * - Safe area support for iOS / modern Android navigation bars
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutGrid,
  Package,
  MessageSquareQuote,
  ShoppingBag,
  User,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/cart/cart-context';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, profile } = useAuth();
  const { totalPieces } = useCart();

  // Do not render bottom nav inside admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Categories',
      href: '/categories',
      icon: LayoutGrid,
      isActive: pathname.startsWith('/categories'),
    },
    {
      label: 'Products',
      href: '/products',
      icon: Package,
      isActive: pathname.startsWith('/product'),
    },
    {
      label: 'Enquiry',
      href: '/wholesale-enquiry',
      icon: MessageSquareQuote,
      isActive: pathname === '/wholesale-enquiry',
    },
    {
      label: 'Cart',
      href: '/cart',
      icon: ShoppingBag,
      isActive: pathname === '/cart',
      badge: totalPieces > 0 ? totalPieces : undefined,
    },
    {
      label: isAuthenticated ? (profile?.fullName ? profile.fullName.split(' ')[0] : 'Account') : 'Account',
      href: isAuthenticated ? '/account' : '/login',
      icon: User,
      isActive: pathname.startsWith('/account') || pathname.startsWith('/login') || pathname.startsWith('/register'),
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden safe-area-bottom"
    >
      <div className="grid grid-cols-6 h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 transition-colors select-none ${
                active
                  ? 'text-primary font-bold'
                  : 'text-charcoal/70 hover:text-primary font-medium'
              }`}
            >
              {/* Active top pip */}
              {active && (
                <span
                  className="absolute top-0 w-8 h-0.5 bg-accent rounded-full animate-in fade-in duration-200"
                  aria-hidden="true"
                />
              )}

              <div className="relative flex items-center justify-center w-6 h-6">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    active ? 'scale-110 text-primary stroke-[2.25]' : 'stroke-[1.75]'
                  }`}
                  aria-hidden="true"
                />

                {item.badge !== undefined && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-accent text-charcoal font-bold text-[10px] flex items-center justify-center shadow-xs border border-surface leading-none"
                    aria-label={`${item.badge} items in cart`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 tracking-tight truncate max-w-full px-0.5 ${
                  active ? 'text-primary font-bold' : 'text-charcoal/80'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
