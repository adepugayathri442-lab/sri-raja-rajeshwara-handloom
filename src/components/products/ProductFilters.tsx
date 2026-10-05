'use client';

import React from 'react';
import { Filter, ArrowUpDown, Search } from 'lucide-react';
import { WHOLESALE_CATEGORIES } from '@/config/categories';

export interface ProductFiltersProps {
  selectedCategory?: string;
  onSelectCategory?: (slug: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
}

export function ProductFilters({
  selectedCategory = 'all',
  onSelectCategory,
  searchQuery = '',
  onSearchChange,
  sortBy = 'default',
  onSortChange,
}: ProductFiltersProps) {
  return (
    <div className="bg-surface p-4 sm:p-5 rounded-lg border border-border mb-8 shadow-2xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-muted flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-accent" />
            Category:
          </span>

          <button
            type="button"
            onClick={() => onSelectCategory?.('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-surface-subtle text-charcoal/80 hover:bg-surface-border'
            }`}
          >
            All Categories
          </button>

          {WHOLESALE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory?.(cat.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-primary text-white font-semibold'
                    : 'bg-surface-subtle text-charcoal/80 hover:bg-surface-border border border-border/60'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {onSearchChange && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
              <input
                type="text"
                placeholder="Filter by keyword..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-surface-subtle border border-border rounded text-charcoal focus:outline-none focus:border-accent"
              />
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted">
            <ArrowUpDown className="w-3.5 h-3.5 text-accent" />
            <span>Sort:</span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="text-xs bg-surface-subtle border border-border rounded px-2.5 py-1.5 text-charcoal focus:outline-none focus:border-accent"
          >
            <option value="default">Default Merchant Order</option>
            <option value="price-asc">Wholesale Price (Low to High)</option>
            <option value="price-desc">Wholesale Price (High to Low)</option>
            <option value="name-asc">Alphabetical (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Model Reminder Banner */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted">
        <span className="font-medium text-primary">
          • Single Fixed Rate Per Piece Across All Quantities
        </span>
        <span className="hidden sm:inline">
          Ready for Supabase catalog data connection
        </span>
      </div>
    </div>
  );
}
