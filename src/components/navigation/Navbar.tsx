'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { WHOLESALE_CATEGORIES } from '@/config/categories';

export function Navbar() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Group the 12 wholesale categories by family
  const categoryGroups = React.useMemo(() => {
    const groups: Record<string, typeof WHOLESALE_CATEGORIES[number][]> = {
      'Towels': [],
      'Lungies': [],
      'Traditional Cloth': [],
      'Dhoties': [],
      'Shawls': [],
    };
    for (const cat of WHOLESALE_CATEGORIES) {
      if (groups[cat.groupName]) {
        groups[cat.groupName].push(cat);
      }
    }
    return groups;
  }, []);

  return (
    <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
      {siteConfig.mainNav.map((item) => {
        const isCategories = item.href === '/categories';
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname?.startsWith(item.href);

        if (isCategories) {
          return (
            <div
              key={item.href}
              className="relative group"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <Link
                href="/categories"
                className={`px-3.5 py-2 text-sm font-medium rounded-md transition-colors duration-150 inline-flex items-center gap-1.5 ${
                  isActive
                    ? 'text-primary font-semibold bg-surface-subtle border-b-2 border-accent'
                    : 'text-charcoal/80 hover:text-primary hover:bg-surface-subtle/80'
                }`}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <span>{item.title}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180 text-accent' : ''
                  }`}
                />
              </Link>

              {/* Dropdown Menu */}
              <div
                className={`absolute left-0 top-full pt-2 w-[520px] transition-all duration-200 z-50 ${
                  dropdownOpen
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible pointer-events-none -translate-y-1'
                }`}
              >
                <div className="bg-surface rounded-xl border border-border shadow-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-border/80">
                    <span className="text-xs font-serif font-bold text-primary flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      Wholesale Categories (12)
                    </span>
                    <Link
                      href="/categories"
                      onClick={() => setDropdownOpen(false)}
                      className="text-[11px] font-semibold text-accent hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <span>All Categories</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {Object.entries(categoryGroups).map(([groupName, cats]) => (
                      <div key={groupName} className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted block px-1">
                          {groupName}
                        </span>
                        <div className="space-y-0.5">
                          {cats.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/categories/${cat.slug}`}
                              onClick={() => setDropdownOpen(false)}
                              className={`block px-2 py-1 rounded text-xs transition-colors ${
                                pathname === `/categories/${cat.slug}`
                                  ? 'bg-primary-subtle text-primary font-bold'
                                  : 'text-charcoal/90 hover:bg-surface-subtle hover:text-primary'
                              }`}
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3.5 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
              isActive
                ? 'text-primary font-semibold bg-surface-subtle border-b-2 border-accent'
                : 'text-charcoal/80 hover:text-primary hover:bg-surface-subtle/80'
            }`}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
