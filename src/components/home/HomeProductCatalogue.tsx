'use client';

/**
 * Product-First Wholesale Shopping Catalogue
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Meesho / Amazon-style mobile-first shopping experience:
 * - 2-column compact grid on mobile (360px - 390px)
 * - 3-column on tablet, 4-column on desktop
 * - Direct browse & immediate Buy / Enquire actions
 * - Unified real Image Catalogue Items & Normal Products
 * - Prioritizes latest database items first (created_at desc)
 * - Horizontal compact category filter row (default: "All")
 * - Image zoom modal / lightbox for catalogue photos
 */

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingBag,
  MessageCircle,
  Maximize2,
  X,
  Sparkles,
  Check,
  AlertCircle,
  Layers,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Container } from '@/components/common/Container';
import type { CategoryRow, CatalogueItem, Product } from '@/types';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/cart/cart-context';
import { getCatalogueItemEnquiryUrl, getProductEnquiryUrl } from '@/lib/whatsapp';

export type UnifiedItem =
  | {
      kind: 'catalogue_item';
      id: string;
      categoryId: string;
      categoryName: string;
      categorySlug: string;
      imageUrl: string;
      createdAt: string;
      sortOrder: number;
    }
  | {
      kind: 'product';
      id: string;
      product: Product;
      categoryId: string;
      categoryName: string;
      categorySlug: string;
      imageUrl: string;
      createdAt: string;
      sortOrder: number;
    };

export interface HomeProductCatalogueProps {
  categories: CategoryRow[];
  catalogueItems: CatalogueItem[];
  products: Product[];
}

export function HomeProductCatalogue({
  categories,
  catalogueItems,
  products,
}: HomeProductCatalogueProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, profile } = useAuth();
  const { addItem } = useCart();

  // Category filter state (default: "all")
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');

  // Lightbox Modal state for Image Catalogue items
  const [lightboxItem, setLightboxItem] = useState<{
    id: string;
    categoryName: string;
    imageUrl: string;
  } | null>(null);

  // Cart add feedback state
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // 1. Combine & sort items by real database timestamp (latest first)
  const allItems: UnifiedItem[] = useMemo(() => {
    const list: UnifiedItem[] = [];

    // Add Image Catalogue Items
    for (const item of catalogueItems) {
      const cat = categories.find((c) => c.id === item.categoryId);
      list.push({
        kind: 'catalogue_item',
        id: item.id,
        categoryId: item.categoryId,
        categoryName: item.categoryName || cat?.name || 'Wholesale Handloom',
        categorySlug: item.categorySlug || cat?.slug || '',
        imageUrl: item.imageUrl,
        createdAt: item.createdAt,
        sortOrder: item.sortOrder ?? 0,
      });
    }

    // Add Normal Products
    for (const prod of products) {
      const cat = categories.find((c) => c.id === prod.categoryId);
      const img = prod.imageUrl || (prod.images && prod.images.length > 0 ? prod.images[0] : '');
      list.push({
        kind: 'product',
        id: prod.id,
        product: prod,
        categoryId: prod.categoryId,
        categoryName: prod.categoryName || cat?.name || 'Wholesale Handloom',
        categorySlug: prod.categorySlug || cat?.slug || '',
        imageUrl: img || '',
        createdAt: prod.createdAt || new Date(0).toISOString(),
        sortOrder: 0,
      });
    }

    // Sort descending by created_at timestamp
    return list.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    });
  }, [catalogueItems, products, categories]);

  // 2. Filter by selected category
  const filteredItems = useMemo(() => {
    if (selectedCategorySlug === 'all') {
      return allItems;
    }
    const targetCat = categories.find(
      (c) => c.slug === selectedCategorySlug || c.id === selectedCategorySlug
    );
    if (!targetCat) return allItems;

    return allItems.filter(
      (item) => item.categoryId === targetCat.id || item.categorySlug === targetCat.slug
    );
  }, [allItems, selectedCategorySlug, categories]);

  // Handle Buy for Image Catalogue Item
  const handleBuyCatalogueItem = (item: {
    id: string;
    categoryName: string;
    imageUrl: string;
  }) => {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    const buyUrl = getCatalogueItemEnquiryUrl({
      categoryName: item.categoryName,
      itemId: item.id,
      imageUrl: item.imageUrl,
      intent: 'buy',
      customerName: profile?.fullName,
      businessName: profile?.businessName || undefined,
    });
    window.open(buyUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle Buy for Normal Product
  const handleBuyProduct = (prod: Product) => {
    const rawPrice = prod.pricePerPiece;
    const hasValidPrice = rawPrice !== null && rawPrice > 0;
    const isPriceVisible = Boolean(hasValidPrice && prod.priceVisible !== false);

    if (isPriceVisible && prod.pricePerPiece !== null) {
      addItem(
        {
          productId: prod.id,
          productCode: prod.productCode,
          name: prod.name,
          slug: prod.slug,
          pricePerPiece: prod.pricePerPiece,
          imageUrl: prod.imageUrl,
        },
        1
      );

      if (!isAuthenticated) {
        router.push('/login?next=/cart');
        return;
      }

      setAddedProductId(prod.id);
      setTimeout(() => setAddedProductId(null), 2000);
    } else {
      const enquiryUrl = getProductEnquiryUrl({
        name: prod.name,
        productCode: prod.productCode,
        pricePerPiece: prod.pricePerPiece,
        priceVisible: false,
        quantity: 1,
        customerName: profile?.fullName,
        businessName: profile?.businessName || undefined,
      });
      window.open(enquiryUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="py-4 sm:py-8">
      <Container size="xl">
        {/* ====================================================================
            1. COMPACT PRODUCT-FIRST HEADER
            ==================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 mb-3 border-b border-border/70">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-primary tracking-tight">
              Wholesale Products
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              Browse our latest wholesale textile collection
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] sm:text-xs text-muted font-medium bg-surface px-2.5 py-1 rounded-full border border-border/80 shadow-2xs">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </span>
            <span className="hidden sm:inline-flex text-[11px] font-semibold text-accent items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Fixed Wholesale Rates
            </span>
          </div>
        </div>

        {/* ====================================================================
            2. COMPACT CATEGORY / FILTER ROW (Horizontally scrollable on mobile)
            ==================================================================== */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {/* "All" Filter Pill */}
            <button
              type="button"
              onClick={() => setSelectedCategorySlug('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategorySlug === 'all'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-surface text-charcoal hover:bg-surface-subtle border border-border/80 hover:border-accent'
              }`}
            >
              All ({allItems.length})
            </button>

            {/* Existing 12 Categories */}
            {categories.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white font-semibold shadow-2xs'
                      : 'bg-surface text-charcoal hover:bg-surface-subtle border border-border/80 hover:border-accent font-medium'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ====================================================================
            3. MEESHO / AMAZON-STYLE PRODUCT GRID
               - Mobile: 2-column grid at 360px / 375px / 390px
               - Desktop: 4-column grid (3-column on tablet)
            ==================================================================== */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            {filteredItems.map((item) => {
              // --------------------------------------------------------------
              // A. IMAGE CATALOGUE ITEM CARD
              // --------------------------------------------------------------
              if (item.kind === 'catalogue_item') {
                const isImageFailed = Boolean(failedImages[item.id]);
                const enquiryUrl = getCatalogueItemEnquiryUrl({
                  categoryName: item.categoryName,
                  itemId: item.id,
                  imageUrl: item.imageUrl,
                  intent: 'enquire',
                  customerName: profile?.fullName,
                  businessName: profile?.businessName || undefined,
                });

                return (
                  <div
                    key={`cat-item-${item.id}`}
                    className="group bg-surface rounded-xl border border-border/80 hover:border-accent shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Natural 3:4 Portrait Media */}
                    <div
                      onClick={() =>
                        setLightboxItem({
                          id: item.id,
                          categoryName: item.categoryName,
                          imageUrl: item.imageUrl,
                        })
                      }
                      className="relative aspect-[3/4] bg-surface-subtle overflow-hidden cursor-pointer"
                      role="button"
                      tabIndex={0}
                      aria-label={`View photo for ${item.categoryName} wholesale item`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setLightboxItem({
                            id: item.id,
                            categoryName: item.categoryName,
                            imageUrl: item.imageUrl,
                          });
                        }
                      }}
                    >
                      {!isImageFailed ? (
                        <Image
                          src={item.imageUrl}
                          alt={`${item.categoryName} Wholesale Handloom Item`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [item.id]: true }))
                          }
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-cream/40 text-muted">
                          <AlertCircle className="w-5 h-5 mb-1 text-muted/60" />
                          <span className="text-[10px] font-medium">{item.categoryName}</span>
                          <span className="text-[9px] text-muted/70">Photo unavailable</span>
                        </div>
                      )}

                      {/* Hover Zoom Overlay Icon */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="p-1.5 sm:p-2 rounded-full bg-surface/90 text-primary shadow-xs">
                          <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </span>
                      </div>

                      {/* Category Label Pill */}
                      <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 pointer-events-none">
                        <span className="px-1.5 sm:px-2 py-0.5 bg-surface/90 backdrop-blur-xs text-primary font-semibold text-[9px] sm:text-[10px] rounded border border-border shadow-2xs truncate max-w-[120px] inline-block">
                          {item.categoryName}
                        </span>
                      </div>
                    </div>

                    {/* Compact Card Details & Actions */}
                    <div className="p-2 sm:p-2.5 bg-surface border-t border-border/70 flex flex-col justify-between flex-1 gap-1.5">
                      <div className="min-w-0">
                        <div className="text-[11px] sm:text-xs font-semibold text-primary truncate flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-accent shrink-0" />
                          <span>Rate on Enquiry</span>
                        </div>
                        <div className="text-[10px] text-muted truncate">
                          Ref #{item.id.slice(0, 8)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-1 sm:gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleBuyCatalogueItem(item)}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2 rounded-md text-[11px] sm:text-xs font-bold bg-primary text-white hover:bg-primary-hover active:scale-98 transition-all shadow-2xs cursor-pointer"
                          title={
                            isAuthenticated
                              ? 'Book wholesale order on WhatsApp'
                              : 'Sign in to buy this item'
                          }
                        >
                          <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>Buy</span>
                        </button>

                        <a
                          href={enquiryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] sm:text-xs font-semibold bg-[#128C7E]/10 text-[#075E54] hover:bg-[#128C7E] hover:text-white transition-all border border-[#128C7E]/30"
                          title="Inquire wholesale price on WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                          <span>Get Price / Enquire</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              }

              // --------------------------------------------------------------
              // B. NORMAL PRODUCT CARD
              // --------------------------------------------------------------
              const prod = item.product;
              const isImageFailed = Boolean(failedImages[prod.id]);
              const rawPrice = prod.pricePerPiece;
              const hasValidPrice = rawPrice !== null && rawPrice > 0;
              const isPriceVisible = Boolean(hasValidPrice && prod.priceVisible !== false);
              const isOutOfStock =
                prod.stockStatus === 'out_of_stock' || prod.stockQuantity <= 0;

              const whatsappUrl = getProductEnquiryUrl({
                name: prod.name,
                productCode: prod.productCode,
                pricePerPiece: prod.pricePerPiece,
                priceVisible: isPriceVisible,
                quantity: 1,
              });

              return (
                <div
                  key={`prod-${prod.id}`}
                  className="group bg-surface rounded-xl border border-border/80 hover:border-accent shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Natural 3:4 Portrait Media */}
                  <Link
                    href={`/products/${prod.slug}`}
                    className="block relative aspect-[3/4] bg-surface-subtle overflow-hidden"
                  >
                    {prod.imageUrl && !isImageFailed ? (
                      <Image
                        src={prod.imageUrl}
                        alt={`${prod.name} Wholesale Handloom`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [prod.id]: true }))
                        }
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-cream/40 text-muted">
                        <Layers className="w-5 h-5 mb-1 text-muted/60" />
                        <span className="text-[10px] font-medium truncate max-w-[120px]">
                          {prod.name}
                        </span>
                        <span className="text-[9px] text-muted/70">Handloom Stock</span>
                      </div>
                    )}

                    {/* Category Label Pill */}
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 pointer-events-none">
                      <span className="px-1.5 sm:px-2 py-0.5 bg-surface/90 backdrop-blur-xs text-primary font-semibold text-[9px] sm:text-[10px] rounded border border-border shadow-2xs truncate max-w-[120px] inline-block">
                        {item.categoryName}
                      </span>
                    </div>

                    {/* Stock Status Badge */}
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 pointer-events-none">
                      {isOutOfStock ? (
                        <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 font-semibold text-[9px] rounded border border-rose-200 shadow-2xs">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 font-semibold text-[9px] rounded border border-emerald-200 shadow-2xs">
                          In Stock
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Compact Card Details & Actions */}
                  <div className="p-2 sm:p-2.5 bg-surface border-t border-border/70 flex flex-col justify-between flex-1 gap-1.5">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${prod.slug}`}
                        className="text-xs sm:text-sm font-semibold text-charcoal hover:text-primary transition-colors line-clamp-1 block"
                        title={prod.name}
                      >
                        {prod.name}
                      </Link>

                      {isPriceVisible && prod.pricePerPiece !== null ? (
                        <div className="text-xs sm:text-sm font-bold text-primary mt-0.5 truncate">
                          ₹{prod.pricePerPiece.toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] font-normal text-muted">/ pc</span>
                        </div>
                      ) : (
                        <div className="text-[11px] sm:text-xs font-bold text-primary mt-0.5 truncate">
                          Price on Enquiry
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1 sm:gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleBuyProduct(prod)}
                        disabled={isOutOfStock}
                        className={`w-full inline-flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2 rounded-md text-[11px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                          isOutOfStock
                            ? 'bg-surface-subtle text-muted cursor-not-allowed border border-border'
                            : addedProductId === prod.id
                            ? 'bg-emerald-700 text-white'
                            : 'bg-primary text-white hover:bg-primary-hover active:scale-98'
                        }`}
                        title={
                          isOutOfStock
                            ? 'Currently out of stock'
                            : 'Buy or add to wholesale cart'
                        }
                      >
                        {addedProductId === prod.id ? (
                          <>
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>Added to Cart!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>{isOutOfStock ? 'Out of Stock' : 'Buy'}</span>
                          </>
                        )}
                      </button>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] sm:text-xs font-semibold bg-[#128C7E]/10 text-[#075E54] hover:bg-[#128C7E] hover:text-white transition-all border border-[#128C7E]/30"
                        title="Inquire wholesale price on WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                        <span>Get Price / Enquire</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State when filter yields 0 items */
          <div className="bg-surface rounded-2xl border border-border p-8 sm:p-12 text-center max-w-xl mx-auto my-6 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-primary">
              No Wholesale Items Found
            </h3>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-md mx-auto">
              We are regularly uploading fresh loom batches. Contact us on WhatsApp for bulk bookings
              or piece-rate quotes for this category.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedCategorySlug('all')}
                className="px-4 py-2 rounded-md text-xs font-semibold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
              >
                View All Wholesale Products
              </button>
              <Link
                href="/wholesale-enquiry"
                className="px-4 py-2 rounded-md text-xs font-semibold bg-surface border border-border text-charcoal hover:bg-surface-subtle transition-colors"
              >
                Send Wholesale Enquiry
              </Link>
            </div>
          </div>
        )}

        {/* ====================================================================
            4. LIGHTBOX / FULL-SCREEN PHOTO ZOOM MODAL
            ==================================================================== */}
        {lightboxItem && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
            onClick={() => setLightboxItem(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${lightboxItem.categoryName} photo preview`}
          >
            <div
              className="relative bg-surface rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-border flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between bg-surface-subtle">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                    {lightboxItem.categoryName}
                  </span>
                  <span className="text-xs text-muted font-mono hidden sm:inline">
                    Ref: {lightboxItem.id.slice(0, 8)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxItem(null)}
                  className="p-1.5 rounded-full text-charcoal hover:bg-surface hover:text-primary transition-colors cursor-pointer"
                  aria-label="Close photo preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Image Display */}
              <div className="relative aspect-[3/4] sm:aspect-square bg-cream/30 overflow-hidden flex-1 max-h-[65vh]">
                <Image
                  src={lightboxItem.imageUrl}
                  alt={`${lightboxItem.categoryName} Wholesale Item`}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-contain"
                  priority
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="p-3 sm:p-4 bg-surface border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="text-left w-full sm:w-auto">
                  <div className="text-xs font-semibold text-primary flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span>Wholesale Piece Rate Available on Enquiry</span>
                  </div>
                  <div className="text-[11px] text-muted">
                    Single fixed rate per piece • Direct transport parcel dispatch.
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const item = lightboxItem;
                      setLightboxItem(null);
                      handleBuyCatalogueItem(item);
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-md text-xs font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Buy</span>
                  </button>

                  <a
                    href={getCatalogueItemEnquiryUrl({
                      categoryName: lightboxItem.categoryName,
                      itemId: lightboxItem.id,
                      imageUrl: lightboxItem.imageUrl,
                      intent: 'enquire',
                      customerName: profile?.fullName,
                      businessName: profile?.businessName || undefined,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-md text-xs font-semibold bg-[#128C7E] text-white hover:bg-[#075E54] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            5. SUBTLE WHOLESALE FOOTER REASSURANCE
            ==================================================================== */}
        <div className="mt-8 pt-6 border-t border-border/70 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted">
          <div className="flex items-center gap-2 bg-surface p-2.5 rounded-lg border border-border/60">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span>100% Wholesale • Fixed piece rates</span>
          </div>
          <div className="flex items-center gap-2 bg-surface p-2.5 rounded-lg border border-border/60">
            <Layers className="w-4 h-4 text-accent shrink-0" />
            <span>Any quantity order volume accepted</span>
          </div>
          <div className="flex items-center gap-2 bg-surface p-2.5 rounded-lg border border-border/60">
            <Truck className="w-4 h-4 text-primary shrink-0" />
            <span>Delivery across India via transport</span>
          </div>
        </div>
      </Container>
    </div>
  );
}
