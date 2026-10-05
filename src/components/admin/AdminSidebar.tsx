'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingBag,
  Users,
  MessageSquareQuote,
  Truck,
  CreditCard,
  BarChart3,
  Settings,
  ArrowLeft,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/lib/auth/auth-context';

export const ADMIN_NAV_ITEMS = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Categories", href: "/admin/categories", icon: FolderTree },
  { title: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Stock", href: "/admin/stock", icon: Boxes },
  { title: "Wholesale Enquiries", href: "/admin/wholesale-enquiries", icon: MessageSquareQuote },
  { title: "Delivery Charges", href: "/admin/delivery-charges", icon: Truck },
  { title: "Payments", href: "/admin/payments", icon: CreditCard },
  { title: "Reports", href: "/admin/reports", icon: BarChart3 },
  { title: "Settings", href: "/admin/settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const customerStoreUrl = process.env.NEXT_PUBLIC_CUSTOMER_URL || 'https://sri-raja-rajeshwara-handloom-8gqw.vercel.app';

  const isItemActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname === href || pathname?.startsWith(`${href}/`) || pathname?.startsWith(`${href}?`);
  };

  return (
    <>
      {/* Mobile Top Navigation Bar (visible only on < lg) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-primary text-white h-14 px-4 flex items-center justify-between border-b border-primary-light/40 shadow-xs">
        <Link href="/admin" className="flex items-center gap-2 hover:opacity-90">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span className="font-serif font-bold text-sm tracking-wide">SRR Admin</span>
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={customerStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-white/80 hover:text-accent flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded"
          >
            <span>Store</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close admin navigation menu" : "Open admin navigation menu"}
            aria-expanded={mobileOpen}
            className="p-1.5 rounded-md hover:bg-white/10 text-white focus:outline-none cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5 text-accent" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] bg-primary text-white h-full flex flex-col shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-primary-light/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span className="font-serif font-bold text-sm">Owner Operations</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-1 text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-accent text-charcoal font-bold shadow-xs border border-accent ring-1 ring-accent/30'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-charcoal' : 'text-accent'}`} />
                      <span>{item.title}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User Profile & Sign Out & Return */}
            <div className="pt-3 border-t border-primary-light/30 space-y-2">
              {user && (
                <div className="flex items-center justify-between px-1 py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-accent text-charcoal flex items-center justify-center font-bold text-xs shrink-0">
                      {profile?.fullName ? profile.fullName[0].toUpperCase() : 'A'}
                    </div>
                    <span className="text-xs text-white/90 truncate font-medium">
                      {profile?.fullName || user?.email || 'Admin'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    title="Sign Out"
                    className="text-xs text-red-300 hover:text-red-100 flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Exit</span>
                  </button>
                </div>
              )}
              <a
                href={customerStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-xs text-white/70 hover:text-accent transition-colors py-1.5 px-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Wholesale Store</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar (hidden on < lg, visible on lg+) */}
      <aside className="hidden lg:flex w-64 bg-primary text-white flex-col shrink-0 sticky top-0 h-screen border-r border-primary-light/40 z-30">
        {/* Brand Identity / Header */}
        <div className="p-5 border-b border-primary-light/30">
          <div className="flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Portal</span>
          </div>
          <Logo variant="footer" asLink={false} size="sm" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Admin Navigation">
          <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider px-3 py-1.5 flex items-center justify-between">
            <span>Management Modules</span>
            <span className="text-[10px] text-accent/80 font-mono">11</span>
          </div>

          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-accent text-charcoal font-bold shadow-xs border border-accent ring-1 ring-accent/30'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-charcoal' : 'text-accent'}`} />
                  <span>{item.title}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Return to Storefront & System Info */}
        <div className="p-4 border-t border-primary-light/30 bg-primary-hover/50 space-y-2">
          <a
            href={customerStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-white/70 hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Wholesale Store</span>
          </a>
          <div className="text-[10px] text-white/40 pt-1">
            Sri Raja Rajeshwara Handloom • Phase 5
          </div>
        </div>
      </aside>
    </>
  );
}
