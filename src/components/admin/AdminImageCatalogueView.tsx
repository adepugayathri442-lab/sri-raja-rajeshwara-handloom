'use client';

/**
 * Admin Image-Only Wholesale Catalogue View
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Rules:
 * - Simple flow: Select Category -> Upload Photos -> Save
 * - No complex product fields (no name, SKU, price, stock, description).
 * - Each uploaded photo is stored as a separate catalogue item.
 * - Belong exclusively to the selected category.
 * - Storage path: catalogue/{categoryId}/{itemId}-{filename} in product-images bucket.
 * - Delete safely removes DB record and Storage object.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Upload,
  Trash2,
  FolderTree,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  X,
  ExternalLink,
  Layers,
  Info,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { getCategories } from '@/lib/supabase/catalog';
import {
  getAllCatalogueItems,
  createMultipleCatalogueItems,
  deleteCatalogueItem,
} from '@/lib/supabase/image-catalogue';
import type { CategoryRow, CatalogueItem } from '@/types';

export function AdminImageCatalogueView() {
  // Categories from Supabase (defaults to existing 12 categories)
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');

  // New Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Existing Items State
  const [catalogueItems, setCatalogueItems] = useState<CatalogueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Categories & Existing Catalogue Items
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const [cats, items] = await Promise.all([
        getCategories(),
        getAllCatalogueItems(),
      ]);

      setCategories(cats);

      setSelectedCategoryId((prev) => {
        if (!prev && cats.length > 0) {
          const deeksha = cats.find((c) => c.slug === 'deeksha-cloth');
          return deeksha ? deeksha.id : cats[0].id;
        }
        return prev;
      });

      setCatalogueItems(items);
    } catch (err) {
      console.error('Failed to load catalogue data:', err);
      setActionError('Unable to connect to database. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getCategories(),
      getAllCatalogueItems(),
    ]).then(([cats, items]) => {
      if (isMounted) {
        setCategories(cats);
        setSelectedCategoryId((prev) => {
          if (!prev && cats.length > 0) {
            const deeksha = cats.find((c) => c.slug === 'deeksha-cloth');
            return deeksha ? deeksha.id : cats[0].id;
          }
          return prev;
        });
        setCatalogueItems(items);
        setIsLoading(false);
      }
    }).catch((err) => {
      if (isMounted) {
        console.error('Failed to load catalogue data:', err);
        setActionError('Unable to connect to database. Please check your network connection.');
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle local file selection and generate previews
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const MAX_SIZE = 5 * 1024 * 1024;

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      if (!validMimes.includes(file.type)) {
        setUploadMessage({
          text: `Skipped "${file.name}": Only JPG, PNG, and WebP images are allowed.`,
          type: 'error',
        });
        continue;
      }
      if (file.size > MAX_SIZE) {
        setUploadMessage({
          text: `Skipped "${file.name}": Exceeds 5MB size limit.`,
          type: 'error',
        });
        continue;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);

    // Reset input value to allow re-selecting same files
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove a single photo from pending selection
  const handleRemovePreview = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all pending selections
  const handleClearPreviews = () => {
    previews.forEach((p) => URL.revokeObjectURL(p));
    setSelectedFiles([]);
    setPreviews([]);
  };

  // Save / Upload all selected photos under selected category
  const handleSaveUploads = async () => {
    if (!selectedCategoryId) {
      setUploadMessage({ text: 'Please select a category first.', type: 'error' });
      return;
    }

    if (selectedFiles.length === 0) {
      setUploadMessage({ text: 'Please select at least one photo to upload.', type: 'error' });
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const result = await createMultipleCatalogueItems({
        categoryId: selectedCategoryId,
        files: selectedFiles,
      });

      if (result.success) {
        const catObj = categories.find((c) => c.id === selectedCategoryId);
        setUploadMessage({
          text: `Successfully uploaded ${result.createdCount} separate image items to ${catObj?.name || 'category'}!`,
          type: 'success',
        });

        // Clear preview selections
        handleClearPreviews();

        // Refresh list
        const updated = await getAllCatalogueItems();
        setCatalogueItems(updated);
      } else {
        setUploadMessage({
          text: `Upload failed: ${result.errors.join(', ')}`,
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Error uploading catalogue items:', err);
      setUploadMessage({
        text: err instanceof Error ? err.message : 'Upload failed. Please check connection.',
        type: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Delete an image catalogue item
  const handleDeleteItem = async (item: CatalogueItem) => {
    const catName = item.categoryName || 'this category';
    if (!confirm(`Are you sure you want to delete this catalogue image item from ${catName}? This cannot be undone.`)) {
      return;
    }

    setDeletingId(item.id);
    setActionError(null);

    try {
      const res = await deleteCatalogueItem(item.id, item.storagePath);
      if (res.success) {
        setCatalogueItems((prev) => prev.filter((it) => it.id !== item.id));
      } else {
        setActionError(res.error || 'Failed to delete item.');
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      setActionError('Error deleting item. Check connection.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter items by selected category filter
  const displayedItems = catalogueItems.filter((item) => {
    if (filterCategoryId === 'all') return true;
    return item.categoryId === filterCategoryId;
  });

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4 text-accent" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
              Image Catalogue Management
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Simple Category → Image upload. Each uploaded photo becomes a separate catalogue card with Buy & WhatsApp Enquiry buttons. No complex product details required.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedCategoryObj?.slug && (
            <a
              href={`/categories/${selectedCategoryObj.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md bg-surface text-charcoal hover:text-primary border border-border hover:border-accent transition-colors shadow-2xs"
            >
              <span>View {selectedCategoryObj.name} Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Supabase Architecture / Migration Status Notice */}
      <div className="p-4 rounded-xl bg-surface border border-accent/40 text-charcoal text-xs shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-primary block">Supabase Migration & Storage Architecture</span>
            <span className="text-muted leading-relaxed">
              Database schema is defined in <code className="px-1.5 py-0.5 bg-cream/80 rounded font-mono text-[11px] text-charcoal">supabase/catalogue_items_migration.sql</code>. Each uploaded photo is stored in Supabase Storage under <code className="px-1.5 py-0.5 bg-cream/80 rounded font-mono text-[11px] text-charcoal">product-images/catalogue/&#123;categoryId&#125;/...</code>.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            12 Categories Active
          </span>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-600 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================================== */}
      {/* 1. SIMPLE UPLOAD SECTION: Select Category -> Upload Photos -> Save */}
      {/* ======================================================================== */}
      <Card variant="default" className="p-6 sm:p-8 bg-surface border-border shadow-xs">
        <div className="flex items-center gap-2 pb-4 border-b border-border mb-6">
          <FolderTree className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-serif font-bold text-primary">
            Upload Item Photos by Category
          </h2>
        </div>

        <div className="space-y-6">
          {/* Step 1: Select Existing Category */}
          <div>
            <label htmlFor="category-select" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
              Step 1: Select Wholesale Category (12 Existing Categories)
            </label>
            <select
              id="category-select"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full sm:w-80 px-3.5 py-2.5 bg-surface rounded-lg border border-border text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.group_name} Family)
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted">
              Photos uploaded will belong strictly to <strong className="text-charcoal font-semibold">{selectedCategoryObj?.name || 'the selected category'}</strong> and will appear only under its category listing page.
            </p>
          </div>

          {/* Step 2: Upload Images */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
              Step 2: Add Photos (Multiple Selection Supported)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              id="catalogue-file-input"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-accent rounded-xl p-8 text-center bg-cream/30 hover:bg-cream/60 transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="text-sm font-semibold text-primary">
                Click to browse or drag & drop photos here
              </div>
              <div className="text-xs text-muted mt-1">
                JPG, JPEG, PNG, WebP up to 5MB each. You can select multiple photos at once.
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-md shadow-2xs group-hover:bg-primary-hover">
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Photos</span>
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Photo Previews before Saving */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  Selected Photos ({selectedFiles.length} {selectedFiles.length === 1 ? 'item' : 'items'} to be created)
                </div>
                <button
                  type="button"
                  onClick={handleClearPreviews}
                  disabled={isUploading}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {/* Grid of Pending Photos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {previews.map((previewUrl, index) => (
                  <div
                    key={index}
                    className="relative aspect-[3/4] bg-surface-subtle rounded-lg overflow-hidden border border-border group"
                  >
                    <Image
                      src={previewUrl}
                      alt={`Pending upload ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-1.5 right-1.5">
                      <button
                        type="button"
                        onClick={() => handleRemovePreview(index)}
                        disabled={isUploading}
                        className="p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                        title="Remove this photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 truncate text-center">
                      Item #{index + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* Step 4: Save Button */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleSaveUploads}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary-hover active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading {selectedFiles.length} items to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      <span>Save {selectedFiles.length} Catalogue Items</span>
                    </>
                  )}
                </button>

                <span className="text-xs text-muted">
                  Each photo will be saved as an independent item under {selectedCategoryObj?.name}.
                </span>
              </div>
            </div>
          )}

          {uploadMessage && (
            <div
              className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
                uploadMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {uploadMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{uploadMessage.text}</span>
            </div>
          )}
        </div>
      </Card>

      {/* ======================================================================== */}
      {/* 2. EXISTING CATALOGUE ITEMS LIST / MANAGEMENT */}
      {/* ======================================================================== */}
      <Card variant="default" className="p-6 sm:p-8 bg-surface border-border shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
          <div>
            <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
              <span>Existing Image Catalogue Items</span>
              <Badge variant="primary" size="sm">
                {displayedItems.length} {displayedItems.length === 1 ? 'item' : 'items'}
              </Badge>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Filter by category, view uploaded photos, or delete unwanted items.
            </p>
          </div>

          {/* Filter by Category */}
          <div className="flex items-center gap-2">
            <label htmlFor="filter-cat" className="text-xs font-semibold text-charcoal shrink-0">
              Filter:
            </label>
            <select
              id="filter-cat"
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="px-3 py-1.5 bg-surface-subtle rounded-md border border-border text-xs font-semibold text-charcoal focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Categories ({catalogueItems.length})</option>
              {categories.map((cat) => {
                const count = catalogueItems.filter((i) => i.categoryId === cat.id).length;
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Items Grid */}
        {displayedItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayedItems.map((item) => {
              const isDeleting = deletingId === item.id;
              return (
                <div
                  key={item.id}
                  className="group bg-surface rounded-lg border border-border hover:border-accent overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all"
                >
                  {/* Photo Thumbnail */}
                  <div className="relative aspect-[3/4] bg-surface-subtle overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.categoryName || 'Catalogue item'}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category Badge on Thumbnail */}
                    <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white backdrop-blur-2xs truncate max-w-[85%]">
                        {item.categoryName || 'Category'}
                      </span>
                    </div>

                    {/* Storage Path Info on Hover */}
                    <a
                      href={item.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      title="Open full photo in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Item Details & Actions */}
                  <div className="p-2.5 bg-surface border-t border-border flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] text-muted font-mono">
                      <span>Ref: {item.id.slice(0, 8)}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item)}
                      disabled={isDeleting}
                      className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                      title="Permanently delete from database and storage"
                    >
                      {isDeleting ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-border rounded-xl bg-cream/20">
            <Layers className="w-10 h-10 text-muted/60 mx-auto mb-2" />
            <div className="text-sm font-semibold text-charcoal">
              No catalogue items found {filterCategoryId !== 'all' ? 'for this category' : 'yet'}.
            </div>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              Use the upload form above to select a category and upload photos.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
