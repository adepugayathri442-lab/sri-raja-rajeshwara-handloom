'use client';

/**
 * Admin Stock & Warehouse Inventory Management Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Live stock piece counts and thresholds
 * - Status indicators: In Stock (> 10 pcs), Low Stock (1-10 pcs), Out of Stock (0 pcs)
 * - Quick action "Edit Stock" linking directly to the product editor
 * - Desktop table and mobile responsive card view
 * - No duplicated product system: Uses existing Phase 4 product editor
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Search,
  X,
  RefreshCw,
  Edit,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  Plus,
  Minus,
  Loader2,
  Check,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  getAdminStockList,
  type AdminStockItem,
} from '@/lib/supabase/admin-operations';
import { updateProductStock } from '@/lib/supabase/admin-catalog';

export function AdminStockView() {
  const [items, setItems] = useState<AdminStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Stock Adjustment Modal State
  const [editingItem, setEditingItem] = useState<AdminStockItem | null>(null);
  const [newQuantity, setNewQuantity] = useState<string>('0');
  const [isSavingStock, setIsSavingStock] = useState(false);
  const [stockSaveError, setStockSaveError] = useState<string | null>(null);
  const [stockSuccessMsg, setStockSuccessMsg] = useState<string | null>(null);

  const handleOpenQuickStock = (item: AdminStockItem) => {
    setEditingItem(item);
    setNewQuantity(String(item.stockQuantity));
    setStockSaveError(null);
  };

  const handleAdjustBy = (delta: number) => {
    const current = parseInt(newQuantity, 10) || 0;
    const nextVal = Math.max(0, current + delta);
    setNewQuantity(String(nextVal));
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const parsed = parseInt(newQuantity, 10);
    if (isNaN(parsed) || parsed < 0) {
      setStockSaveError('Please enter a valid non-negative piece quantity.');
      return;
    }

    setIsSavingStock(true);
    setStockSaveError(null);

    const res = await updateProductStock(editingItem.id, parsed);
    setIsSavingStock(false);

    if (res.success) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                stockQuantity: parsed,
                stockStatus:
                  parsed === 0
                    ? 'Out of Stock'
                    : parsed <= 10
                    ? 'Low Stock'
                    : 'In Stock',
              }
            : i
        )
      );
      setStockSuccessMsg(`Inventory updated: ${editingItem.name} now has ${parsed} pcs.`);
      setEditingItem(null);
      setTimeout(() => setStockSuccessMsg(null), 3500);
    } else {
      setStockSaveError(res.error || 'Failed to update stock in database.');
    }
  };

  // Filters
  const [search, setSearch] = useState('');
  const [stockStatus, setStockStatus] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');

  const loadStock = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminStockList({
        search,
        stockStatus,
      });
      setItems(data);
    } catch (err) {
      console.error('Failed to load stock list:', err);
      setError('Unable to load inventory data from database.');
    } finally {
      setIsLoading(false);
    }
  }, [search, stockStatus]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadStock();
    }, 300);
    return () => clearTimeout(handler);
  }, [loadStock]);

  const clearFilters = () => {
    setSearch('');
    setStockStatus('all');
  };

  // Quick summary counts
  const totalCount = items.length;
  const lowStockCount = items.filter((i) => i.stockStatus === 'Low Stock').length;
  const outOfStockCount = items.filter((i) => i.stockStatus === 'Out of Stock').length;
  const inStockCount = items.filter((i) => i.stockStatus === 'In Stock').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted mb-1">
            <Link href="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <span className="text-primary font-medium">Stock</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            Warehouse Stock & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Monitor real-time piece stock, identify critical low inventory, and edit piece balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            href="/admin/products/new"
            variant="primary"
            size="sm"
            leftIcon={<Package className="w-3.5 h-3.5" />}
          >
            Add New Product
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadStock}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          variant="default"
          onClick={() => setStockStatus('all')}
          className={`p-4 border transition-all cursor-pointer ${
            stockStatus === 'all'
              ? 'border-primary ring-2 ring-primary/20 bg-surface'
              : 'border-border bg-surface hover:border-border/80'
          }`}
        >
          <span className="text-xs text-muted block mb-1">Total Products</span>
          <div className="text-2xl font-serif font-bold text-primary">{totalCount}</div>
        </Card>

        <Card
          variant="default"
          onClick={() => setStockStatus('in-stock')}
          className={`p-4 border transition-all cursor-pointer ${
            stockStatus === 'in-stock'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30'
              : 'border-border bg-surface hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-800 block mb-1">In Stock (&gt; 10 pcs)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-800">{inStockCount}</div>
        </Card>

        <Card
          variant="default"
          onClick={() => setStockStatus('low-stock')}
          className={`p-4 border transition-all cursor-pointer ${
            stockStatus === 'low-stock'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30'
              : 'border-border bg-surface hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-800 block mb-1">Low Stock (1–10 pcs)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-800">{lowStockCount}</div>
        </Card>

        <Card
          variant="default"
          onClick={() => setStockStatus('out-of-stock')}
          className={`p-4 border transition-all cursor-pointer ${
            stockStatus === 'out-of-stock'
              ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30'
              : 'border-border bg-surface hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-800 block mb-1">Out of Stock (0 pcs)</span>
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-rose-800">{outOfStockCount}</div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card variant="default" className="p-4 sm:p-5 border-border bg-surface shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name or product code / SKU..."
              className="w-full pl-9 pr-9 py-2 bg-surface-subtle border border-border rounded-lg text-xs text-charcoal focus:border-accent focus:bg-surface outline-none transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 min-w-[180px]">
            <select
              value={stockStatus}
              onChange={(e) =>
                setStockStatus(e.target.value as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock')
              }
              aria-label="Filter by Stock Status"
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-xs text-charcoal font-medium focus:border-accent outline-none"
            >
              <option value="all">All Inventory Statuses</option>
              <option value="in-stock">In Stock (&gt; 10 pcs)</option>
              <option value="low-stock">Low Stock (1–10 pcs)</option>
              <option value="out-of-stock">Out of Stock (0 pcs)</option>
            </select>
          </div>

          {(search || stockStatus !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Inventory List */}
      {isLoading ? (
        <Card variant="default" className="p-12 text-center border-border">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-muted">Checking warehouse stock levels...</p>
        </Card>
      ) : error ? (
        <Card variant="default" className="p-8 text-center border-rose-200 bg-rose-50/40">
          <p className="text-xs text-rose-700">{error}</p>
          <Button variant="outline" size="sm" onClick={loadStock} className="mt-3">
            Retry
          </Button>
        </Card>
      ) : items.length === 0 ? (
        <Card variant="default" className="p-12 sm:p-16 text-center border-border">
          <div className="w-14 h-14 rounded-full bg-cream-100 text-muted flex items-center justify-center mx-auto mb-4 border border-border">
            <Boxes className="w-7 h-7 text-muted" />
          </div>
          <h2 className="text-xl font-serif font-bold text-primary">
            No products match criteria
          </h2>
          <p className="text-xs text-muted max-w-md mx-auto mt-1 leading-relaxed">
            {search || stockStatus !== 'all'
              ? 'Try modifying your search query or reset the inventory status filter.'
              : 'The warehouse catalog does not contain any products yet. Use the existing Phase 4 product creator to add initial stock.'}
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            {(search || stockStatus !== 'all') && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filter Parameters
              </Button>
            )}
            <Button
              href="/admin/products/new"
              variant="primary"
              size="sm"
              leftIcon={<Package className="w-3.5 h-3.5" />}
            >
              Add First Wholesale Product
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block bg-surface border border-border rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border text-muted font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">SKU / Code</th>
                    <th className="py-3 px-4">Wholesale Category</th>
                    <th className="py-3 px-4 text-right">Fixed Rate / Piece</th>
                    <th className="py-3 px-4 text-center">Available Stock</th>
                    <th className="py-3 px-4 text-center">Stock Status</th>
                    <th className="py-3 px-4 text-center">Catalog State</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {items.map((i) => (
                    <tr key={i.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-charcoal">
                        <Link href={`/admin/products/${i.id}/edit`} className="hover:text-primary">
                          {i.name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-primary">
                        {i.productCode}
                      </td>
                      <td className="py-3.5 px-4 text-muted">
                        <div className="font-medium text-charcoal">{i.categoryName}</div>
                        <div className="text-[10px] text-muted">{i.groupName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-serif font-bold text-charcoal">
                        ₹{i.pricePerPiece.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-base text-primary">
                          {i.stockQuantity}
                        </span>
                        <span className="text-[10px] text-muted ml-1">pcs</span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            i.stockStatus === 'In Stock'
                              ? 'bg-emerald-100 text-emerald-800'
                              : i.stockStatus === 'Low Stock'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {i.stockStatus === 'In Stock' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : i.stockStatus === 'Low Stock' ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {i.stockStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            i.isActive
                              ? 'bg-primary/10 text-primary'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {i.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenQuickStock(i)}
                            className="px-2.5 py-1.5 bg-accent hover:bg-accent-hover text-charcoal rounded text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                            <span>Quick Adjust</span>
                          </button>
                          <Link
                            href={`/admin/products/${i.id}/edit`}
                            title="Full Product Editor"
                            className="px-2 py-1.5 bg-surface-subtle hover:bg-surface-border text-muted hover:text-charcoal border border-border rounded text-xs font-medium inline-flex items-center transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards Stack */}
          <div className="md:hidden space-y-3">
            {items.map((i) => (
              <div
                key={i.id}
                className="bg-surface border border-border rounded-xl p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-charcoal">{i.name}</h3>
                    <p className="text-xs font-mono font-bold text-primary mt-0.5">
                      SKU: {i.productCode}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                      i.stockStatus === 'In Stock'
                        ? 'bg-emerald-100 text-emerald-800'
                        : i.stockStatus === 'Low Stock'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {i.stockStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/60">
                  <div>
                    <span className="text-[10px] text-muted block">Category:</span>
                    <span className="font-medium text-charcoal">{i.categoryName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block">Wholesale Rate:</span>
                    <span className="font-serif font-bold text-charcoal">
                      ₹{i.pricePerPiece.toLocaleString('en-IN')} / pc
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted block text-[10px]">Available Inventory:</span>
                    <span className="font-bold text-lg text-primary">{i.stockQuantity} pcs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenQuickStock(i)}
                      className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-charcoal rounded text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Boxes className="w-3.5 h-3.5" />
                      <span>Adjust</span>
                    </button>
                    <Link
                      href={`/admin/products/${i.id}/edit`}
                      className="px-2.5 py-1.5 bg-surface-subtle border border-border rounded text-xs text-muted"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stock Adjustment Modal */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="w-full max-w-md bg-surface rounded-2xl border border-border shadow-xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Boxes className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-primary">
                    Update Warehouse Stock
                  </h3>
                  <p className="text-[11px] text-muted font-mono">
                    SKU: {editingItem.productCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 text-muted hover:text-charcoal rounded-md hover:bg-surface-subtle cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary */}
            <div className="p-3.5 bg-cream/70 rounded-xl border border-accent/20 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-charcoal block">{editingItem.name}</span>
                <span className="text-[11px] text-muted">{editingItem.categoryName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted block uppercase">Current Stock</span>
                <span className="font-bold text-base text-primary font-mono">
                  {editingItem.stockQuantity} pcs
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1" htmlFor="quick-stock-input">
                  New Available Quantity (Pieces)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustBy(-10)}
                    className="p-2.5 bg-surface-subtle hover:bg-surface-border text-charcoal border border-border rounded-lg text-xs font-bold cursor-pointer"
                    title="Subtract 10 pcs"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    id="quick-stock-input"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="flex-1 text-center font-mono font-bold text-lg py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:border-accent focus:bg-surface outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAdjustBy(10)}
                    className="p-2.5 bg-surface-subtle hover:bg-surface-border text-charcoal border border-border rounded-lg text-xs font-bold cursor-pointer"
                    title="Add 10 pcs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-muted mr-1">Quick:</span>
                {[
                  { label: '+25', delta: 25 },
                  { label: '+50', delta: 50 },
                  { label: '+100', delta: 100 },
                  { label: '+500', delta: 500 },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => handleAdjustBy(btn.delta)}
                    className="px-2.5 py-1 bg-surface-subtle hover:bg-surface-border border border-border text-[11px] font-semibold text-charcoal rounded cursor-pointer"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {stockSaveError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{stockSaveError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                  disabled={isSavingStock}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSavingStock}
                  leftIcon={
                    isSavingStock ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )
                  }
                >
                  {isSavingStock ? 'Saving Pieces...' : 'Save Stock Quantity'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Success Notification */}
      {stockSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-900 text-white rounded-xl shadow-lg border border-emerald-700 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
          <span>{stockSuccessMsg}</span>
        </div>
      )}
    </div>
  );
}
