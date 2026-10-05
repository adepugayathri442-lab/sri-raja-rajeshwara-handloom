'use client';

/**
 * Category Navigation & Filter Bar
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Provides responsive, accessible category navigation where the active category
 * is distinctly highlighted using the Deep Loom Emerald and Antique Muted Gold palette.
 * Supports keyboard navigation, touch scrolling, and route synchronization.
 */

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Layers } from 'lucide-react';
import { WHOLESALE_CATEGORIES } from '@/config/categories';

interface CategoryNavigationProps {
  activeSlug?: string;
  className?: string;
  showAllOption?: boolean;
  basePath?: '/categories' | '/products';
}

export function CategoryNavigation({
  activeSlug,
  className = '',
  showAllOption = true,
  basePath = '/categories',
}: CategoryNavigationProps) {
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Determine active slug: either prop or extracted from pathname
  const currentSlug = React.useMemo(() => {
    if (activeSlug) return activeSlug;
    if (pathname.startsWith('/categories/')) {
      return pathname.replace('/categories/', '');
    }
    if (pathname === '/categories') return 'all';
    return 'all';
  }, [activeSlug, pathname]);

  // Smoothly scroll active category into view on load/change
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeElement = scrollContainerRef.current.querySelector('[data-active="true"]');
    if (activeElement && typeof activeElement.scrollIntoView === 'function') {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentSlug]);

  return (
    <nav
      aria-label="Wholesale Product Categories"
      className={`w-full overflow-hidden bg-surface rounded-xl border border-border p-2 sm:p-2.5 shadow-2xs ${className}`}
    >
      <div
        ref={scrollContainerRef}
        tabIndex={0}
        aria-label="Scrollable Categories list"
        className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        {showAllOption && (
          <Link
            href={basePath === '/products' ? '/products' : '/categories'}
            data-active={currentSlug === 'all'}
            aria-current={currentSlug === 'all' ? 'page' : undefined}
            className={`group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all duration-200 ease-in-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${
              currentSlug === 'all'
                ? 'bg-primary text-white border-2 border-accent shadow-xs ring-1 ring-accent/30'
                : 'bg-surface-subtle text-charcoal/80 hover:text-primary hover:bg-cream/80 border border-border hover:border-accent/60'
            }`}
          >
            <Layers
              className={`w-3.5 h-3.5 transition-colors ${
                currentSlug === 'all' ? 'text-accent' : 'text-muted group-hover:text-primary'
              }`}
            />
            <span>All Categories</span>
            {currentSlug === 'all' && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
            )}
          </Link>
        )}

        {WHOLESALE_CATEGORIES.map((cat) => {
          const isActive = currentSlug === cat.slug;
          const href = basePath === '/products'
            ? `/products?category=${cat.slug}`
            : `/categories/${cat.slug}`;

          return (
            <Link
              key={cat.id}
              href={href}
              data-active={isActive}
              aria-current={isActive ? 'page' : undefined}
              className={`group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs shrink-0 transition-all duration-200 ease-in-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${
                isActive
                  ? 'bg-primary text-white font-bold border-2 border-accent shadow-xs ring-1 ring-accent/40'
                  : 'bg-surface-subtle text-charcoal/85 hover:text-primary hover:bg-cream/80 border border-border hover:border-accent/60 font-medium'
              }`}
            >
              <Sparkles
                className={`w-3 h-3 transition-colors ${
                  isActive ? 'text-accent' : 'text-accent/60 group-hover:text-accent'
                }`}
                aria-hidden="true"
              />
              <span>{cat.name}</span>
              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 shadow-2xs"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
