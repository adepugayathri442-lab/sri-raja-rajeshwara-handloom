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
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';

const ADMIN_NAV_ITEMS = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Categories", href: "/admin/categories", icon: FolderTree },
  { title: "Stock", href: "/admin/stock", icon: Boxes },
  { title: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Wholesale Enquiries", href: "/admin/wholesale-enquiries", icon: MessageSquareQuote },
  { title: "Delivery Charges", href: "/admin/delivery-charges", icon: Truck },
  { title: "Payments", href: "/admin/payments", icon: CreditCard },
  { title: "Reports & Sales", href: "/admin/reports", icon: BarChart3 },
  { title: "Settings", href: "/admin/settings", icon: Settings },
] as const;


export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Navigation Bar (visible only on < lg) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-primary text-white h-14 px-4 flex items-center justify-between border-b border-primary-light/40 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span className="font-serif font-bold text-sm tracking-wide">SRR Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle admin navigation menu"
          className="p-1.5 rounded-md hover:bg-white/10 text-white focus:outline-none"
        >
          {mobileOpen ? <X className="w-5 h-5 text-accent" /> : <Menu className="w-5 h-5" />}
        </button>
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
                className="p-1 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-accent text-charcoal font-semibold shadow-xs'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom link */}
            <div className="pt-4 border-t border-primary-light/30">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-xs text-white/70 hover:text-accent transition-colors py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Wholesale Store</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar (hidden on < lg, visible on lg+) */}
      <aside className="hidden lg:flex w-64 bg-primary text-white flex-col shrink-0 min-h-screen border-r border-primary-light/40">
        {/* Brand Identity / Header */}
        <div className="p-5 border-b border-primary-light/30">
          <div className="flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Portal</span>
          </div>
          <Logo variant="footer" asLink={false} size="sm" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider px-3 py-1.5">
            Management Modules
          </div>

          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-accent text-charcoal font-semibold shadow-xs'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Return to Storefront & System Info */}
        <div className="p-4 border-t border-primary-light/30 bg-primary-hover/50 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-white/70 hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Wholesale Store</span>
          </Link>
          <div className="text-[10px] text-white/40 pt-1">
            Sri Raja Rajeshwara Handloom • Phase 5
          </div>
        </div>
      </aside>
    </>
  );
}
