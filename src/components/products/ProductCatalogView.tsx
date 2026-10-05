'use client';

/**
 * Wholesale Product Catalog Interactive View
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Real-time Supabase product querying
 * - Debounced search by name, product code, description
 * - Category filter (12 categories)
 * - Availability filter (in stock only)
 * - Sorting: Newest, Price (Low/High), Name (A-Z)
 * - Clean URL query string synchronisation
 * - Polished Empty State when 0 products exist in database
 */

import React, { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, ArrowUpDown, X, RefreshCw, ShieldCheck } from 'lucide-react';
import type { CategoryRow, Product } from '@/types';
import { getProducts } from '@/lib/supabase/catalog';
import { ProductCard } from './ProductCard';
import { EmptyProductState } from './EmptyProductState';

export type CatalogSortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

export interface ProductCatalogViewProps {
  categories: CategoryRow[];
  initialCategorySlug?: string;
  initialSearch?: string;
}

export function ProductCatalogView({
  categories,
  initialCategorySlug = 'all',
  initialSearch = '',
}: ProductCatalogViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State from URL or initial props
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || initialCategorySlug
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('q') || initialSearch
  );
  const [sortBy, setSortBy] = useState<CatalogSortOption>(
    (searchParams.get('sort') as CatalogSortOption) || 'newest'
  );
  const [inStockOnly, setInStockOnly] = useState<boolean>(
    searchParams.get('inStock') === 'true'
  );

  // Products and loading states
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Find active category object purely declaratively
  const selectedCategoryDetails = useMemo(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      return categories.find((c) => c.slug === selectedCategory) || null;
    }
    return null;
  }, [selectedCategory, categories]);

  // Synchronise state with URL params
  const updateUrlParams = useCallback(
    (newParams: { category?: string; q?: string; sort?: string; inStock?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newParams.category !== undefined) {
        if (newParams.category === 'all') params.delete('category');
        else params.set('category', newParams.category);
      }

      if (newParams.q !== undefined) {
        if (!newParams.q.trim()) params.delete('q');
        else params.set('q', newParams.q.trim());
      }

      if (newParams.sort !== undefined) {
        if (newParams.sort === 'newest') params.delete('sort');
        else params.set('sort', newParams.sort);
      }

      if (newParams.inStock !== undefined) {
        if (!newParams.inStock) params.delete('inStock');
        else params.set('inStock', 'true');
      }

      const queryString = params.toString();
      startTransition(() => {
        router.replace(queryString ? `/products?${queryString}` : '/products', { scroll: false });
      });
    },
    [router, searchParams]
  );

  // Fetch products from Supabase
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await getProducts({
        categorySlug: selectedCategory,
        search: searchQuery,
        sortBy,
        inStockOnly,
      });

      setProducts(res.products);
    } catch (err: unknown) {
      console.error('Failed to load products:', err);
      setError('Unable to load wholesale products. Please check your connection or contact us on WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy, inStockOnly]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(handler);
  }, [loadProducts]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    updateUrlParams({ category: slug });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateUrlParams({ q: val });
  };

  const handleSortChange = (val: CatalogSortOption) => {
    setSortBy(val);
    updateUrlParams({ sort: val });
  };

  const handleInStockToggle = (checked: boolean) => {
    setInStockOnly(checked);
    updateUrlParams({ inStock: checked });
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('newest');
    setInStockOnly(false);
    router.replace('/products', { scroll: false });
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Toolbar */}
      <div className="bg-surface rounded-xl border border-border p-4 sm:p-6 shadow-2xs space-y-4">
        {/* Top Controls: Search + Sort + InStock */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="search"
              placeholder="Search products by name, product code (e.g. SRR-TWL)..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-surface-subtle border border-border rounded-lg focus:outline-none focus:border-accent text-charcoal"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: In Stock + Sorting */}
          <div className="flex flex-wrap items-center gap-3">
            {/* In Stock Only Checkbox */}
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-charcoal select-none bg-surface-subtle px-3 py-2 rounded-lg border border-border">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => handleInStockToggle(e.target.checked)}
                className="rounded border-border text-primary focus:ring-accent w-4 h-4"
              />
              <span>In Stock Only</span>
            </label>

            {/* Sort Dropdown */}
            <div className="inline-flex items-center gap-1.5 bg-surface-subtle px-3 py-1.5 rounded-lg border border-border text-xs text-charcoal">
              <ArrowUpDown className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="text-muted hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as CatalogSortOption)}
                className="bg-transparent text-xs font-medium text-charcoal focus:outline-none cursor-pointer py-1"
              >
                <option value="newest">Newest Listed</option>
                <option value="price-asc">Wholesale Price: Low to High</option>
                <option value="price-desc">Wholesale Price: High to Low</option>
                <option value="name-asc">Product Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Pills (All 12 Real Wholesale Categories) */}
        <div className="pt-3 border-t border-border/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-accent" />
              Wholesale Categories ({categories.length}):
            </span>

            {(selectedCategory !== 'all' || searchQuery || inStockOnly) && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] text-accent hover:text-accent-hover font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Filters
              </button>
            )}
          </div>

          {/* Horizontal scrollable pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            <button
              type="button"
              onClick={() => handleCategorySelect('all')}
              aria-pressed={selectedCategory === 'all'}
              className={`group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all duration-200 ease-in-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white border-2 border-accent shadow-xs ring-1 ring-accent/30 font-bold'
                  : 'bg-surface-subtle text-charcoal/80 hover:text-primary hover:bg-cream/80 border border-border hover:border-accent/60'
              }`}
            >
              <span>All Categories</span>
              {selectedCategory === 'all' && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
              )}
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.slug)}
                  aria-pressed={isSelected}
                  className={`group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs shrink-0 transition-all duration-200 ease-in-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${
                    isSelected
                      ? 'bg-primary text-white font-bold border-2 border-accent shadow-xs ring-1 ring-accent/40'
                      : 'bg-surface-subtle text-charcoal/85 hover:text-primary hover:bg-cream/80 border border-border hover:border-accent/60 font-medium'
                  }`}
                >
                  <span>{cat.name}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Category Header (if specific category is chosen) */}
        {selectedCategoryDetails && (
          <div className="mt-3 p-3.5 bg-cream/70 rounded-lg border border-accent/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase font-bold text-accent tracking-wider">
                {selectedCategoryDetails.group_name} Family
              </div>
              <h4 className="text-sm sm:text-base font-serif font-bold text-primary">
                {selectedCategoryDetails.name}
              </h4>
              {selectedCategoryDetails.description && (
                <p className="text-xs text-muted mt-0.5 max-w-2xl">
                  {selectedCategoryDetails.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleCategorySelect('all')}
              className="self-start sm:self-center text-xs text-primary hover:text-accent font-medium inline-flex items-center gap-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Show All</span>
            </button>
          </div>
        )}

        {/* Model Transparency Note */}
        <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-muted gap-2">
          <span className="flex items-center gap-1 font-medium text-primary">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            100% Wholesale • Fixed Rate Per Piece • No Minimum Order Tier Restrictions
          </span>
          <span>Delivery Across India via Reliable Transport</span>
        </div>
      </div>

      {/* Product Grid / Loading / Empty States */}
      <div>
        {/* Error State */}
        {error && (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center max-w-xl mx-auto my-6 space-y-3">
            <p className="text-sm text-rose-800 font-medium">{error}</p>
            <button
              type="button"
              onClick={loadProducts}
              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-hover transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-surface rounded-xl border border-border p-4 animate-pulse space-y-4"
              >
                <div className="aspect-4/3 bg-surface-subtle rounded-lg" />
                <div className="h-4 bg-surface-subtle rounded w-3/4" />
                <div className="h-3 bg-surface-subtle rounded w-1/2" />
                <div className="pt-4 border-t border-border flex justify-between">
                  <div className="h-5 bg-surface-subtle rounded w-1/3" />
                  <div className="h-5 bg-surface-subtle rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Grid when Products Exist */}
        {!isLoading && !error && products.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-muted mb-4 px-1">
              <span>Showing {products.length} wholesale product{products.length === 1 ? '' : 's'}</span>
              <span>Fixed price per piece</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State when Database Contains 0 Products */}
        {!isLoading && !error && products.length === 0 && (
          <EmptyProductState
            categoryName={selectedCategoryDetails?.name}
            categorySlug={selectedCategoryDetails?.slug}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
}
