'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
      {siteConfig.mainNav.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname?.startsWith(item.href);

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
