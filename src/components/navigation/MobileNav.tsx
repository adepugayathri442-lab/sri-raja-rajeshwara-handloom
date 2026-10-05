'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Search, ShoppingBag, MessageCircle, ArrowRight, User } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { businessConfig } from '@/config/business';
import { WHOLESALE_CATEGORIES } from '@/config/categories';
import { Badge } from '@/components/common/Badge';
import { Logo } from '@/components/common/Logo';
import { getGeneralEnquiryUrl } from '@/lib/whatsapp';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/cart/cart-context';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, profile } = useAuth();
  const { totalPieces } = useCart();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setIsSearchOpen(false);
  };

  const whatsappHref = getGeneralEnquiryUrl();

  return (
    <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
      {/* Search trigger */}
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className="p-2 text-charcoal hover:text-primary hover:bg-surface-subtle rounded-md transition-colors"
        aria-label="Search wholesale products"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Cart button */}
      <Link
        href="/cart"
        className="p-2 text-charcoal hover:text-primary hover:bg-surface-subtle rounded-md relative transition-colors"
        aria-label="Wholesale Cart"
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 bg-accent text-charcoal text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
          {totalPieces}
        </span>
      </Link>

      {/* Hamburger Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-primary hover:bg-surface-subtle rounded-md transition-colors"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Search Dropdown Bar */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-surface border-b border-border p-3.5 shadow-md z-40 animate-in slide-in-from-top-2">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted" />
            <input
              type="search"
              placeholder="Search wholesale towels, lungies, dhoties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 text-sm bg-surface-subtle border border-border rounded-md focus:outline-none focus:border-accent text-charcoal"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-muted hover:text-charcoal text-xs"
              >
                Clear
              </button>
            )}
          </form>
        </div>
      )}

      {/* Slide-out Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity"
          onClick={closeDrawer}
        />
      )}

      {/* Slide-out Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[86%] max-w-sm bg-surface z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header with Logo */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-cream">
          <Logo variant="header" size="sm" asLink={false} />
          <button
            onClick={closeDrawer}
            className="p-1.5 text-charcoal hover:bg-surface rounded-md shrink-0 ml-2"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Wholesale badge note */}
          <div className="p-3 bg-primary-subtle rounded-md border border-primary/20 text-xs text-primary leading-relaxed">
            <div className="font-semibold flex items-center gap-1.5 mb-0.5">
              <Badge variant="primary" size="sm">100% Wholesale</Badge>
              <span>Fixed Piece Rates</span>
            </div>
            Supplying retail shops, resellers, and institutions across India.
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted px-2 mb-1">
              Store Menu
            </div>
            {siteConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeDrawer}
                className="flex items-center justify-between px-3 py-2 text-xs sm:text-sm font-medium rounded-md text-charcoal hover:bg-surface-subtle transition-colors"
              >
                <span>{item.title}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-50" />
              </Link>
            ))}
          </div>

          {/* Core Categories Quick Links */}
          <div className="pt-2 border-t border-border/80">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Wholesale Categories (12)
              </span>
              <Link
                href="/categories"
                onClick={closeDrawer}
                className="text-[10px] text-accent font-semibold hover:underline"
              >
                All →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {WHOLESALE_CATEGORIES.map((cat) => {
                const isActive = pathname === `/categories/${cat.slug}`;
                return (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    onClick={closeDrawer}
                    aria-current={isActive ? 'page' : undefined}
                    className={`p-2 rounded border text-[11px] truncate flex items-center justify-between transition-all duration-150 ${
                      isActive
                        ? 'bg-primary text-white font-semibold border-accent shadow-xs ring-1 ring-accent/30'
                        : 'bg-surface-subtle hover:bg-surface-border rounded border-border/60 text-charcoal font-medium'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 ml-1" aria-hidden="true" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Account & Inquiry Links */}
          <div className="pt-2 border-t border-border/80 space-y-1">
            <Link
              href={isAuthenticated ? '/account' : '/login'}
              onClick={closeDrawer}
              className="flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-charcoal hover:bg-surface-subtle rounded-md"
            >
              <User className="w-4 h-4 text-muted" />
              <span>{isAuthenticated ? `My Account (${profile?.fullName || 'Logged In'})` : 'Merchant Login / Account'}</span>
            </Link>
            <Link
              href="/wholesale-enquiry"
              onClick={closeDrawer}
              className="flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-semibold text-primary hover:bg-surface-subtle rounded-md"
            >
              <MessageCircle className="w-4 h-4 text-accent" />
              <span>Wholesale Bulk Enquiry</span>
            </Link>
          </div>
        </div>

        {/* Drawer Footer CTA */}
        <div className="p-4 border-t border-border bg-cream space-y-2">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#128C7E] text-white rounded-md text-xs font-semibold shadow-xs hover:bg-[#075E54] transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>WhatsApp Enquiry ({businessConfig.contact.formattedPhone})</span>
          </a>
          <p className="text-[10px] text-center text-muted">
            {businessConfig.tagline}
          </p>
        </div>
      </div>
    </div>
  );
}
