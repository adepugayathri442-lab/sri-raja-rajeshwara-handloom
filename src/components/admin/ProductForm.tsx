'use client';

/**
 * Reusable Wholesale Product Form (Add & Edit)
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Rules:
 * - 100% Wholesale: Single fixed piece rate (₹X / piece).
 * - No quantity-based pricing tiers or retail discounts.
 * - Stock quantity non-negative integer.
 * - Multi-image upload to Supabase Storage 'product-images'.
 * - Primary image designation and reordering.
 * - Real-time storefront card preview.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Upload,
  Star,
  ArrowLeft,
  ArrowRight,
  Eye,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  Image as ImageIcon,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import type { CategoryRow } from '@/types';
import {
  createProduct,
  updateProduct,
  uploadProductImage,
  type AdminProductListItem,
  type AdminProductInput,
} from '@/lib/supabase/admin-catalog';
import { ProductCard } from '@/components/products/ProductCard';

interface ImageItem {
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductFormProps {
  categories: CategoryRow[];
  initialData?: AdminProductListItem;
  isEdit?: boolean;
}

export function ProductForm({ categories, initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();

  // Form Fields State
  const [name, setName] = useState(initialData?.name || '');
  const [productCode, setProductCode] = useState(initialData?.productCode || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [pricePerPiece, setPricePerPiece] = useState<string>(
    initialData ? String(initialData.pricePerPiece) : ''
  );
  const [stockQuantity, setStockQuantity] = useState<string>(
    initialData ? String(initialData.stockQuantity) : '0'
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [isActive, setIsActive] = useState<boolean>(initialData?.isActive ?? true);

  // Helper to generate SKU based on selected category
  const handleGenerateSku = () => {
    const cat = categories.find((c) => c.id === categoryId);
    const prefix = cat ? cat.slug.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() : 'TXT';
    const rand = Math.floor(100 + Math.random() * 900);
    setProductCode(`SRR-${prefix}-${rand}`);
  };

  // Images State
  const [images, setImages] = useState<ImageItem[]>(() => {
    if (!initialData || !initialData.images || initialData.images.length === 0) {
      return initialData?.imageUrl
        ? [{ url: initialData.imageUrl, isPrimary: true, sortOrder: 0 }]
        : [];
    }
    return initialData.images.map((url, idx) => ({
      url,
      isPrimary: url === initialData.imageUrl || idx === 0,
      sortOrder: idx,
    }));
  });

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Selected Category Object
  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  // Derived stock status
  const numericStock = parseInt(stockQuantity || '0', 10);
  const numericPrice = parseFloat(pricePerPiece || '0');
  const isOutOfStock = isNaN(numericStock) || numericStock <= 0;
  const isLowStock = !isOutOfStock && numericStock <= 10;

  // Primary image
  const primaryImageUrl = images.find((i) => i.isPrimary)?.url || images[0]?.url || null;

  // Handle Multi-file Image Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(`Uploading ${files.length} image(s)...`);
    setFormError(null);

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading image ${i + 1} of ${files.length}...`);

      const res = await uploadProductImage(file);
      if (res.success && res.url) {
        uploadedUrls.push(res.url);
      } else {
        errors.push(`${file.name}: ${res.error || 'Upload failed'}`);
      }
    }

    setIsUploading(false);
    setUploadProgress(null);

    if (errors.length > 0) {
      setFormError(`Some images could not be uploaded: ${errors.join(', ')}`);
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) => {
        const nextOrder = prev.length;
        const newItems: ImageItem[] = uploadedUrls.map((url, idx) => ({
          url,
          isPrimary: prev.length === 0 && idx === 0,
          sortOrder: nextOrder + idx,
        }));
        return [...prev, ...newItems];
      });
    }

    // Reset file input
    e.target.value = '';
  };

  // Set Primary Image
  const handleSetPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((item, idx) => ({
        ...item,
        isPrimary: idx === index,
      }))
    );
  };

  // Reorder Images (Move Left / Move Right)
  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy.map((item, idx) => ({ ...item, sortOrder: idx }));
    });
  };

  // Remove Image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const copy = prev.filter((_, idx) => idx !== index);
      // If removed image was primary, make first remaining primary
      if (copy.length > 0 && !copy.some((i) => i.isPrimary)) {
        copy[0].isPrimary = true;
      }
      return copy.map((item, idx) => ({ ...item, sortOrder: idx }));
    });
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    // Validation
    const cleanName = name.trim();
    const cleanCode = productCode.trim().toUpperCase();

    if (!cleanName) {
      setFormError('Product Name is required.');
      return;
    }
    if (!categoryId || !categoryId.trim()) {
      setFormError('Please select a wholesale category.');
      return;
    }
    if (!cleanCode) {
      setFormError('Product Code (SKU) is required. You can click "Auto-Generate SKU" if needed.');
      return;
    }
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setFormError('Wholesale Price per Piece must be a valid positive amount (greater than ₹0).');
      return;
    }
    if (isNaN(numericStock) || numericStock < 0 || !Number.isInteger(numericStock)) {
      setFormError('Stock Quantity must be a valid non-negative whole number (0 or greater).');
      return;
    }

    // Recommendation check for images
    if (images.length === 0) {
      const proceedWithoutPhoto = window.confirm(
        'Recommendation Notice:\n\nNo product photographs have been uploaded yet. At least one image is strongly recommended for wholesale buyers.\n\nDo you want to proceed and save this product without an image?'
      );
      if (!proceedWithoutPhoto) {
        return;
      }
    }

    setIsSubmitting(true);

    const payload: AdminProductInput = {
      name: cleanName,
      productCode: cleanCode,
      categoryId,
      pricePerPiece: numericPrice,
      stockQuantity: numericStock,
      description: description.trim() || cleanName,
      isActive,
      images: images.map((img, idx) => ({
        url: img.url,
        sortOrder: idx,
        isPrimary: img.isPrimary,
      })),
    };

    try {
      if (isEdit && initialData) {
        const res = await updateProduct(initialData.id, payload);
        if (res.success) {
          setSuccessMessage('Product updated successfully!');
          setTimeout(() => {
            router.push('/admin/products');
            router.refresh();
          }, 800);
        } else {
          setFormError(res.error || 'Failed to update product');
        }
      } else {
        const res = await createProduct(payload);
        if (res.success) {
          setSuccessMessage('Product created successfully!');
          setTimeout(() => {
            router.push('/admin/products');
            router.refresh();
          }, 800);
        } else {
          setFormError(res.error || 'Failed to create product');
        }
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'An error occurred during save.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted mb-1">
            <Link href="/admin/products" className="hover:text-primary">
              Products
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">
              {isEdit ? `Edit: ${initialData?.name}` : 'New Product'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            {isEdit ? 'Edit Wholesale Product' : 'Add New Wholesale Product'}
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            100% Wholesale Cloth Merchant • One fixed piece rate per item • Pan-India transport dispatch.
          </p>
        </div>

        {/* View Switcher: Form Editor vs Live Storefront Preview */}
        <div className="flex items-center gap-2 bg-surface-subtle p-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'editor'
                ? 'bg-surface text-primary shadow-2xs'
                : 'text-muted hover:text-charcoal'
            }`}
          >
            Form Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'preview'
                ? 'bg-surface text-primary shadow-2xs'
                : 'text-muted hover:text-charcoal'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Storefront Card Preview
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMessage} Redirecting to product catalogue...</span>
        </div>
      )}

      {/* Error Notification */}
      {formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* TAB 1: FORM EDITOR */}
      {activeTab === 'editor' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <Card variant="default" className="p-5 sm:p-6 bg-surface border-border space-y-4">
            <h2 className="text-base font-serif font-bold text-primary flex items-center gap-2">
              <Package className="w-4 h-4 text-accent" />
              <span>Basic Product Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-charcoal flex items-center justify-between">
                  <span>Product Name <span className="text-rose-600">*</span></span>
                  <span className="text-[11px] text-muted font-normal">e.g. Combed Richcott Bath Towel</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Combed Richcott Bath Towel 30x60"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent"
                />
              </div>

              {/* Product Code (SKU) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-charcoal flex items-center gap-1">
                    <span>Product Code / SKU <span className="text-rose-600">*</span></span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    className="text-[11px] text-accent hover:text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Auto-Generate SKU
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. SRR-TWL-001"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-mono uppercase bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent"
                />
              </div>

              {/* Wholesale Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal flex items-center justify-between">
                  <span>Wholesale Category <span className="text-rose-600">*</span></span>
                  <span className="text-[11px] text-muted font-normal">From 12 DB categories</span>
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="" disabled>-- Select Wholesale Category (Required) --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.group_name} Family)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Section 2: Wholesale Pricing & Stock */}
          <Card variant="default" className="p-5 sm:p-6 bg-surface border-border space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-serif font-bold text-primary flex items-center gap-2">
                <Truck className="w-4 h-4 text-accent" />
                <span>Wholesale Piece Rate & Stock Quantity</span>
              </h2>
              <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">
                100% Wholesale Model
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price per Piece */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal flex items-center justify-between">
                  <span>Wholesale Rate per Piece (₹) <span className="text-rose-600">*</span></span>
                  <span className="text-[11px] text-primary font-bold">Fixed Rate / Piece</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-serif font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="250"
                    value={pricePerPiece}
                    onChange={(e) => setPricePerPiece(e.target.value)}
                    className="w-full pl-8 pr-16 py-2 text-xs sm:text-sm font-semibold bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs font-medium">
                    / piece
                  </span>
                </div>
                <p className="text-[11px] text-muted">
                  Strictly one fixed wholesale piece rate. Do not add retail MRP or tiered discounts.
                </p>
              </div>

              {/* Stock Quantity */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal flex items-center justify-between">
                  <span>Stock Quantity (pieces) <span className="text-rose-600">*</span></span>
                  <span>
                    {isOutOfStock ? (
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Low Stock (≤ 10)
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        In Stock ({numericStock} pcs)
                      </span>
                    )}
                  </span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  placeholder="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent"
                />
                <p className="text-[11px] text-muted">
                  Integer quantity in warehouse inventory. 0 displays as &ldquo;Out of Stock&rdquo; on the storefront.
                </p>
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-charcoal block">Storefront Availability</span>
                <span className="text-[11px] text-muted">
                  When active, product appears in public catalogue for buyers.
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ml-2.5 text-xs font-semibold text-charcoal">
                  {isActive ? 'Active' : 'Inactive (Draft)'}
                </span>
              </label>
            </div>
          </Card>

          {/* Section 3: Product Images (Supabase Storage) */}
          <Card variant="default" className="p-5 sm:p-6 bg-surface border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-serif font-bold text-primary flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-accent" />
                    <span>Product Photography (Supabase Storage)</span>
                  </h2>
                  <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                    At least 1 photo recommended
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  Upload multiple authentic product photos. The marked Primary photo is shown on cards and thumbnails.
                </p>
              </div>
              <span className="text-[11px] text-muted">Max 5MB • JPG, PNG, WebP</span>
            </div>

            {/* Recommendation alert when no images uploaded yet */}
            {images.length === 0 && (
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Recommended: </span>
                  <span>
                    At least one clear product photograph is strongly advised for wholesale buyer catalog visibility.
                    Photos show buyers the authentic weave, border detail, and fabric finish.
                  </span>
                </div>
              </div>
            )}

            {/* Image Upload Zone */}
            <div className="border-2 border-dashed border-border hover:border-accent/80 rounded-xl p-6 text-center bg-surface-subtle/50 transition-colors">
              <input
                type="file"
                id="product-image-upload"
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
              <label
                htmlFor="product-image-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-primary-subtle text-primary flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold text-primary hover:underline">
                    Click to select images
                  </span>
                  <span className="text-xs text-muted"> or drag and drop</span>
                </div>
                {uploadProgress && (
                  <span className="text-xs text-accent font-semibold block">{uploadProgress}</span>
                )}
              </label>
            </div>

            {/* Uploaded Images Gallery */}
            {images.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-charcoal flex items-center justify-between">
                  <span>Uploaded Images ({images.length}):</span>
                  <span className="text-[11px] text-muted">Star indicates Primary Image</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={img.url}
                      className={`group relative rounded-xl border overflow-hidden bg-surface-subtle transition-all duration-150 ${
                        img.isPrimary
                          ? 'border-accent shadow-xs ring-2 ring-accent/30'
                          : 'border-border'
                      }`}
                    >
                      <div className="aspect-square relative">
                        <Image
                          src={img.url}
                          alt={`Product photo ${idx + 1}`}
                          fill
                          sizes="150px"
                          className="object-cover"
                        />
                      </div>

                      {/* Primary Badge */}
                      {img.isPrimary && (
                        <div className="absolute top-1.5 left-1.5 bg-accent text-charcoal text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>Primary</span>
                        </div>
                      )}

                      {/* Controls Overlay */}
                      <div className="p-1.5 bg-surface border-t border-border flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          title="Make Primary Image"
                          className={`p-1 rounded transition-colors ${
                            img.isPrimary
                              ? 'text-accent'
                              : 'text-muted hover:text-accent'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${img.isPrimary ? 'fill-current' : ''}`} />
                        </button>

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveImage(idx, idx - 1)}
                            title="Move Earlier"
                            className="p-1 text-muted hover:text-charcoal disabled:opacity-30"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === images.length - 1}
                            onClick={() => handleMoveImage(idx, idx + 1)}
                            title="Move Later"
                            className="p-1 text-muted hover:text-charcoal disabled:opacity-30"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Remove Image"
                          className="p-1 text-muted hover:text-rose-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Section 4: Descriptions */}
          <Card variant="default" className="p-5 sm:p-6 bg-surface border-border space-y-4">
            <h2 className="text-base font-serif font-bold text-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Product Description & Specifications</span>
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal flex items-center justify-between">
                <span>Wholesale Product Details</span>
                <span className="text-[11px] text-muted">Weave, yarn, borders, dimensions</span>
              </label>
              <textarea
                rows={4}
                placeholder="e.g. 100% pure combed rich-cotton bath towel with dense jacquard borders. Fast color dyed for institutional and commercial laundering durability. Packed in standard wholesale bundles."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-subtle border border-border rounded-lg text-charcoal focus:outline-none focus:border-accent resize-y"
              />
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
            <Button
              href="/admin/products"
              variant="outline"
              size="md"
              disabled={isSubmitting}
            >
              Cancel & Return
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting || isUploading}
                className="w-full sm:w-auto min-w-[180px]"
                leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              >
                {isSubmitting
                  ? 'Saving to Supabase...'
                  : isEdit
                  ? 'Update Wholesale Product'
                  : 'Save Wholesale Product'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: LIVE STOREFRONT CARD PREVIEW */}
      {activeTab === 'preview' && (
        <Card variant="default" className="p-6 bg-surface border-border space-y-6">
          <div className="border-b border-border pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif font-bold text-primary">
                Live Storefront Card Preview
              </h2>
              <p className="text-xs text-muted mt-0.5">
                This shows exactly how bulk buyers will see this item in the public catalogue on /products.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('editor')}
            >
              Back to Form
            </Button>
          </div>

          <div className="max-w-xs mx-auto">
            <ProductCard
              product={{
                id: initialData?.id || 'preview-temp-id',
                productCode: productCode || 'SRR-SAMPLE',
                name: name || 'Untitled Wholesale Product',
                slug: 'preview',
                categoryId: categoryId || 'cat-id',
                categoryName: selectedCategoryObj?.name || 'Category',
                groupName: selectedCategoryObj?.group_name || 'Group',
                pricePerPiece: numericPrice > 0 ? numericPrice : 250,
                stockQuantity: !isNaN(numericStock) ? numericStock : 0,
                description: description || 'Sample wholesale description',
                imageUrl: primaryImageUrl,
                images: images.map((i) => i.url),
                isActive,
              }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
