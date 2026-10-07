'use client';

/**
 * Admin Product List & Management Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Dynamic product table with responsive mobile card fallback
 * - Search by name, product code (SKU)
 * - Category filtering (all 12 categories)
 * - Stock availability filtering (In Stock, Low Stock <= 10, Out of Stock, Inactive)
 * - Sorting: Newest, Oldest, Name, Wholesale Price, Stock
 * - Quick status toggle (Active / Inactive)
 * - Safe Delete with confirmation modal and historical order integrity check
 * - Quick Storefront Card Preview
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  X,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import type { CategoryRow } from '@/types';
import {
  getAdminProducts,
  toggleProductActive,
  deleteProduct,
  type AdminProductListItem,
  type GetAdminProductsOptions,
} from '@/lib/supabase/admin-catalog';
import { ProductCard } from '@/components/products/ProductCard';
import { AdminExportButton } from './AdminExportButton';
import { exportProductsDataset, type ProductExportItem } from '@/lib/export/export-utils';

export interface AdminProductListProps {
  categories: CategoryRow[];
}

export function AdminProductList({ categories }: AdminProductListProps) {
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availability, setAvailability] = useState<GetAdminProductsOptions['availability']>('all');
  const [sortBy, setSortBy] = useState<GetAdminProductsOptions['sortBy']>('newest');

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState<AdminProductListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Preview modal state
  const [previewProduct, setPreviewProduct] = useState<AdminProductListItem | null>(null);

  // Load products from Supabase
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminProducts({
        search: searchQuery,
        categoryId: selectedCategory,
        availability,
        sortBy,
      });
      setProducts(res.products);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load admin products:', err);
      setError('Unable to load wholesale products. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, availability, sortBy]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(handler);
  }, [loadProducts]);

  // Quick toggle active/inactive status
  const handleToggleActive = async (product: AdminProductListItem) => {
    const newStatus = !product.isActive;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isActive: newStatus } : p))
    );

    const res = await toggleProductActive(product.id, newStatus);
    if (!res.success) {
      // Revert if failed
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: !newStatus } : p))
      );
      alert(`Could not update status: ${res.error}`);
    }
  };

  // Safe delete handler
  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    const res = await deleteProduct(productToDelete.id);
    setIsDeleting(false);

    if (res.success) {
      setProductToDelete(null);
      loadProducts();
    } else {
      setDeleteError(res.error || 'Failed to delete product.');
      if (res.archivedInstead) {
        // Refresh product list to show updated inactive status
        loadProducts();
      }
    }
  };

  const handleExport = (format: 'csv' | 'excel') => {
    if (products.length === 0) return;
    const exportData: ProductExportItem[] = products.map((p) => ({
      name: p.name,
      productCode: p.productCode,
      categoryName: p.categoryName,
      pricePerPiece: p.pricePerPiece,
      stockQuantity: p.stockQuantity,
      isActive: p.isActive,
      description: p.description,
      createdAt: p.createdAt,
    }));
    exportProductsDataset(exportData, format);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted mb-1">
            <Link href="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <span className="text-primary font-medium">Products</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            Wholesale Products Catalog
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Manage textile lines, piece rates, stock, and photography across all 12 categories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <AdminExportButton
            onExport={handleExport}
            disabled={products.length === 0 || isLoading}
            label="Export"
          />
          <Button
            href="/admin/products/new"
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add Wholesale Product
          </Button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search by name, SKU (e.g. SRR-TWL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.group_name})
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as GetAdminProductsOptions['availability'])}
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="all">All Stock Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive / Draft Only</option>
              <option value="in-stock">In Stock (&gt; 10 pcs)</option>
              <option value="low-stock">Low Stock (1–10 pcs)</option>
              <option value="out-of-stock">Out of Stock (0 pcs)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as GetAdminProductsOptions['sortBy'])}
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="newest">Sort: Newest Listed</option>
              <option value="oldest">Sort: Oldest Listed</option>
              <option value="name-asc">Sort: Product Name A–Z</option>
              <option value="name-desc">Sort: Product Name Z–A</option>
              <option value="price-asc">Sort: Wholesale Rate: Low to High</option>
              <option value="price-desc">Sort: Wholesale Rate: High to Low</option>
              <option value="stock-asc">Sort: Stock: Low to High</option>
              <option value="stock-desc">Sort: Stock: High to Low</option>
            </select>
          </div>
        </div>

        {/* Toolbar Footer Summary */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted">
          <span>
            Showing <strong className="text-charcoal font-semibold">{products.length}</strong> of{' '}
            <strong className="text-charcoal font-semibold">{total}</strong> products
          </span>

          <div className="flex items-center gap-3">
            {(searchQuery || selectedCategory !== 'all' || availability !== 'all' || sortBy !== 'newest') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setAvailability('all');
                  setSortBy('newest');
                }}
                className="text-[11px] text-accent hover:text-accent-hover font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Filters
              </button>
            )}
            <button
              type="button"
              onClick={loadProducts}
              className="text-[11px] text-primary hover:text-accent font-medium flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadProducts}
            className="font-semibold underline ml-2 hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Product Content: Loading, Empty, or Table */}
      {isLoading ? (
        <div className="bg-surface border border-border rounded-xl p-8 space-y-4 animate-pulse">
          <div className="h-6 bg-surface-subtle rounded w-1/4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-surface-subtle rounded-lg" />
            ))}
          </div>
        </div>
      ) : products.length === 0 ? (
        <Card variant="default" className="p-10 sm:p-14 text-center border-border bg-surface">
          <div className="w-14 h-14 rounded-full bg-primary-subtle text-primary flex items-center justify-center mx-auto mb-3">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-serif font-bold text-primary">No Wholesale Products Found</h3>
          <p className="text-xs sm:text-sm text-muted mt-1 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'all' || availability !== 'all'
              ? 'No products match your selected filter criteria. Try clearing filters or changing search terms.'
              : 'The wholesale database currently has zero products listed. Click below to add your first product with verified wholesale rates and photography.'}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              href="/admin/products/new"
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Add First Wholesale Product
            </Button>
            {(searchQuery || selectedCategory !== 'all' || availability !== 'all') && (
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setAvailability('all');
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table Layout (hidden on small mobile screens) */}
          <div className="hidden md:block bg-surface border border-border rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border text-muted font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 w-14">Image</th>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Wholesale Rate</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {products.map((p) => {
                    const isOutOfStock = p.stockQuantity <= 0;
                    const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= 10;

                    return (
                      <tr key={p.id} className="hover:bg-cream/40 transition-colors">
                        {/* Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="w-12 h-12 rounded-lg bg-surface-subtle border border-border overflow-hidden relative shrink-0">
                            {p.imageUrl ? (
                              <Image
                                src={p.imageUrl}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted">
                                <Package className="w-5 h-5 text-muted/60" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Name & SKU */}
                        <td className="py-3 px-4">
                          <div className="font-serif font-bold text-primary text-sm">
                            {p.name}
                          </div>
                          <div className="font-mono text-[11px] text-muted flex items-center gap-1 mt-0.5">
                            <span>SKU:</span>
                            <span className="text-charcoal font-semibold">{p.productCode}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="font-medium text-charcoal">{p.categoryName || '—'}</span>
                          <span className="text-[10px] text-muted block">{p.groupName}</span>
                        </td>

                        {/* Wholesale Price */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif font-bold text-primary text-sm">
                              ₹{p.pricePerPiece.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-muted">/ pc</span>
                          </div>
                          {p.priceVisible === false ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 mt-0.5">
                              Price Hidden
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 block mt-0.5">
                              Visible
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Low Stock ({p.stockQuantity})
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {p.stockQuantity} pcs
                            </span>
                          )}
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(p)}
                            title={p.isActive ? 'Click to Deactivate' : 'Click to Activate'}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                              p.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-surface-subtle text-muted hover:bg-surface-border border border-border'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-600' : 'bg-muted'}`} />
                            <span>{p.isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>

                        {/* Updated Date */}
                        <td className="py-3 px-4 text-muted text-[11px] whitespace-nowrap">
                          {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }) : '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 justify-end">
                            <button
                              type="button"
                              onClick={() => setPreviewProduct(p)}
                              title="Preview Storefront Card"
                              className="p-1.5 text-muted hover:text-primary hover:bg-surface-subtle rounded-md transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              title="Edit Product"
                              className="p-1.5 text-muted hover:text-accent hover:bg-surface-subtle rounded-md transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => setProductToDelete(p)}
                              title="Delete Product"
                              className="p-1.5 text-muted hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Layout (Visible on small screens) */}
          <div className="md:hidden space-y-3">
            {products.map((p) => {
              const isOutOfStock = p.stockQuantity <= 0;
              const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= 10;

              return (
                <div
                  key={p.id}
                  className="bg-surface border border-border rounded-xl p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg bg-surface-subtle border border-border overflow-hidden relative shrink-0">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          <Package className="w-6 h-6 text-muted/60" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] text-accent font-semibold uppercase tracking-wider">
                          {p.categoryName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-subtle text-muted'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>

                      <h3 className="font-serif font-bold text-primary text-sm truncate mt-0.5">
                        {p.name}
                      </h3>
                      <div className="font-mono text-[10px] text-muted">SKU: {p.productCode}</div>

                      <div className="mt-2 flex items-baseline justify-between">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="font-serif font-bold text-primary text-base">
                              ₹{p.pricePerPiece.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-muted"> / piece</span>
                          </div>
                          {p.priceVisible === false && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 mt-0.5">
                              Price Hidden
                            </span>
                          )}
                        </div>

                        <div>
                          {isOutOfStock ? (
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Low Stock ({p.stockQuantity})
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted">
                              {p.stockQuantity} pcs in stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPreviewProduct(p)}
                      className="text-xs text-muted hover:text-primary flex items-center gap-1 font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="px-3 py-1 bg-surface-subtle hover:bg-surface-border border border-border rounded text-xs font-semibold text-charcoal inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => setProductToDelete(p)}
                        className="p-1.5 text-rose-700 hover:bg-rose-50 rounded border border-rose-200"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-serif font-bold text-primary text-lg">
                Delete Wholesale Product?
              </h3>
              <p className="text-xs text-charcoal/80 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-primary font-semibold">&ldquo;{productToDelete.name}&rdquo;</strong>{' '}
                (SKU: {productToDelete.productCode})?
              </p>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 leading-relaxed">
                {deleteError}
              </div>
            )}

            <div className="p-3 bg-surface-subtle border border-border rounded-lg text-[11px] text-muted space-y-1">
              <div className="font-semibold text-charcoal">Historical Accounting Safety:</div>
              <p>
                If this product has existing historical orders, the system will preserve past customer invoices by deactivating the item instead of deleting it.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="md"
                disabled={isDeleting}
                onClick={() => {
                  setProductToDelete(null);
                  setDeleteError(null);
                }}
              >
                Cancel
              </Button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors"
              >
                {isDeleting ? 'Processing...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storefront Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="text-xs font-serif font-bold text-primary flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-accent" />
                <span>Storefront Card Live Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="text-muted hover:text-charcoal p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <ProductCard
                product={{
                  id: previewProduct.id,
                  productCode: previewProduct.productCode,
                  name: previewProduct.name,
                  slug: previewProduct.slug,
                  categoryId: previewProduct.categoryId,
                  categoryName: previewProduct.categoryName,
                  groupName: previewProduct.groupName,
                  pricePerPiece: previewProduct.pricePerPiece,
                  stockQuantity: previewProduct.stockQuantity,
                  description: previewProduct.description,
                  imageUrl: previewProduct.imageUrl,
                  images: previewProduct.images,
                  isActive: previewProduct.isActive,
                  priceVisible: previewProduct.priceVisible,
                }}
              />
            </div>

            <div className="pt-2 flex justify-between items-center text-[11px] text-muted border-t border-border">
              <span>This is how buyers see this item on /products</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewProduct(null)}
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
