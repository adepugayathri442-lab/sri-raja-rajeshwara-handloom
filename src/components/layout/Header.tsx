'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import { getGeneralEnquiryUrl } from '@/lib/whatsapp';
import { businessConfig } from '@/config/business';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/cart/cart-context';
import { Logo } from '@/components/common/Logo';
import { Navbar } from '@/components/navigation/Navbar';
import { MobileNav } from '@/components/navigation/MobileNav';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { isAuthenticated, profile } = useAuth();
  const { totalPieces } = useCart();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const whatsappHref = getGeneralEnquiryUrl();

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-border shadow-2xs">
      {/* Top B2B Wholesale Announcement Bar */}
      <div className="bg-primary text-white text-xs py-1.5 px-4 border-b border-primary-light">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="hidden sm:inline-flex items-center gap-1 text-accent font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Wholesale
            </span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span className="text-white/90">Fixed Piece Rates — Any Quantity Order</span>
            <span className="hidden md:inline text-white/40">•</span>
            <span className="hidden md:inline-flex items-center gap-1 text-white/80">
              <Truck className="w-3.5 h-3.5 text-accent" />
              Delivery Across India
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[11px]">
            <Link
              href="/wholesale-enquiry"
              className="text-accent hover:text-white transition-colors font-medium underline underline-offset-2"
            >
              Bulk Enquiry Form
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Identity / Logo */}
          <Logo variant="header" />

          {/* Desktop Navigation Links */}
          <Navbar />

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {/* Desktop Search Toggle / Bar */}
            <div className="relative">
              {isSearchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center absolute right-0 top-1/2 -translate-y-1/2 bg-surface border border-accent rounded-md shadow-md z-30 w-72"
                >
                  <Search className="w-4 h-4 text-muted ml-3 shrink-0" />
                  <input
                    type="search"
                    placeholder="Search wholesale products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-1.5 px-2 text-xs bg-transparent focus:outline-none text-charcoal"
                    autoFocus
                    onBlur={() => !searchQuery && setIsSearchOpen(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="text-xs text-muted hover:text-charcoal px-2"
                  >
                    Esc
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-charcoal/80 hover:text-primary hover:bg-surface-subtle rounded-md transition-colors"
                  aria-label="Search wholesale textiles"
                  title="Search products"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* WhatsApp Quick Action */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#128C7E]/10 text-[#075E54] hover:bg-[#128C7E] hover:text-white transition-all border border-[#128C7E]/30"
              title={`Direct WhatsApp Wholesale Enquiry (${businessConfig.contact.formattedPhone})`}
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp</span>
            </a>

            {/* Merchant Login / Account */}
            <Link
              href={isAuthenticated ? '/account' : '/login'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-charcoal/80 hover:text-primary hover:bg-surface-subtle rounded-md transition-colors"
              title={isAuthenticated ? 'My Merchant Account' : 'Sign In'}
            >
              <User className="w-4 h-4" />
              <span>{isAuthenticated ? (profile?.fullName?.split(' ')[0] || 'Account') : 'Login'}</span>
            </Link>

            {/* Wholesale Cart */}
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-md transition-colors shadow-xs"
              title="Wholesale Order Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden lg:inline">Cart</span>
              <span className="px-1.5 py-0.2 bg-accent text-charcoal text-[11px] font-bold rounded-full min-w-4 text-center">
                {totalPieces}
              </span>
            </Link>
          </div>

          {/* Mobile Controls */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
