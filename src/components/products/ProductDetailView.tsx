'use client';

/**
 * Wholesale Product Detail View Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Rules:
 * - 100% Wholesale: One fixed wholesale rate per piece.
 * - Total = pricePerPiece * quantity.
 * - NO quantity-based tier discounts.
 * - Real stock display: In Stock / Low Stock / Out of Stock.
 * - WhatsApp order formatting matching required specifications.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  MessageCircle, 
  ArrowLeft, 
  Package, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Truck, 
  Layers, 
  Minus, 
  Plus 
} from 'lucide-react';
import type { Product } from '@/types';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/cart/cart-context';
import { getProductEnquiryUrl } from '@/lib/whatsapp';

export interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());

  const rawImages = product.images && product.images.length > 0
    ? product.images
    : product.imageUrl
    ? [product.imageUrl]
    : [];

  const images = rawImages.filter(
    (img): img is string => typeof img === 'string' && img.trim() !== '' && img !== 'null'
  );

  const rawPrice = product.pricePerPiece !== null && product.pricePerPiece !== undefined && !isNaN(Number(product.pricePerPiece))
    ? Number(product.pricePerPiece)
    : null;
  const hasValidPrice = rawPrice !== null && rawPrice > 0;
  const isPriceVisible = Boolean(hasValidPrice && product.priceVisible !== false);

  const stockStatus = product.stockStatus || (product.stockQuantity <= 0 ? 'out_of_stock' : product.stockQuantity <= 10 ? 'limited' : 'full');
  const isOutOfStock = stockStatus === 'out_of_stock' || product.stockQuantity <= 0;
  const isLowStock = stockStatus === 'limited';
  const currentTotal = hasValidPrice ? (rawPrice || 0) * quantity : 0;

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return;
    if (!isOutOfStock && product.stockQuantity > 0 && newQty > product.stockQuantity) {
      setQuantity(product.stockQuantity);
      return;
    }
    setQuantity(newQty);
  };

  const handleAddToCart = () => {
    if (isOutOfStock || !isPriceVisible || product.pricePerPiece === null) return;
    addItem({
      productId: product.id,
      productCode: product.productCode,
      name: product.name,
      slug: product.slug,
      pricePerPiece: product.pricePerPiece,
      imageUrl: images[0] || product.imageUrl,
    }, quantity);

    if (!isAuthenticated) {
      router.push('/login?next=/cart');
      return;
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const whatsappHref = getProductEnquiryUrl({
    productName: product.name,
    productCode: product.productCode,
    pricePerPiece: product.pricePerPiece,
    priceVisible: isPriceVisible,
    quantity,
  });

  return (
    <div className="space-y-8">
      {/* Breadcrumb Back Link */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Wholesale Catalogue</span>
        </Link>
        {product.categoryName && (
          <>
            <span>/</span>
            <Link
              href={product.categorySlug ? `/categories/${product.categorySlug}` : '/categories'}
              className="hover:text-primary transition-colors"
            >
              {product.categoryName}
            </Link>
          </>
        )}
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Image Gallery (5 cols on lg) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Display Image */}
          <div className="relative aspect-4/3 sm:aspect-square bg-surface-subtle rounded-xl border border-border overflow-hidden shadow-xs">
            {images.length > 0 && !failedIndices.has(selectedImageIndex) ? (
              <Image
                src={images[selectedImageIndex] || images[0]}
                alt={`${product.name} - Wholesale Indian Handloom`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                onError={() => setFailedIndices((prev) => new Set(prev).add(selectedImageIndex))}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-cream to-surface-subtle">
                <div className="w-20 h-20 rounded-full bg-primary/5 text-primary flex items-center justify-center mb-3 border border-border">
                  <Package className="w-10 h-10 text-primary/60" />
                </div>
                <h4 className="font-serif font-bold text-primary text-base">
                  Sri Raja Rajeshwara Handloom
                </h4>
                <p className="text-xs text-muted mt-1 max-w-xs">
                  Authentic wholesale textile merchandise. High-resolution photographs will be available upon merchant portal upload.
                </p>
              </div>
            )}

            {/* In-Stock Floating Badge */}
            <div className="absolute top-3 left-3">
              {isOutOfStock ? (
                <span className="px-2.5 py-1 bg-rose-50 text-rose-800 font-semibold text-xs rounded-md border border-rose-200 shadow-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-semibold text-xs rounded-md border border-amber-200 shadow-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Limited Stock
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-semibold text-xs rounded-md border border-emerald-200 shadow-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Full Stock
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails (Desktop & Mobile Scrollable) */}
          {images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-lg border overflow-hidden shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-accent ring-2 ring-accent/30 shadow-xs'
                      : 'border-border opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image thumbnail ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Specification & Ordering Box (6 cols on lg) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            {/* Category & Product Code */}
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              {product.categoryName && (
                <Badge variant="primary" size="sm">
                  {product.categoryName}
                </Badge>
              )}
              {product.groupName && (
                <Badge variant="subtle" size="sm">
                  {product.groupName} Family
                </Badge>
              )}
              {product.productCode && (
                <span className="text-xs font-mono font-medium text-muted bg-surface-subtle px-2 py-0.5 rounded border border-border">
                  SKU: {product.productCode}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-primary tracking-tight">
              {product.name}
            </h1>
          </div>

          {/* Wholesale Fixed Piece Pricing Block */}
          {isPriceVisible && product.pricePerPiece !== null ? (
            <div className="p-5 bg-surface rounded-xl border border-border shadow-xs space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-muted block">
                    Uniform Wholesale Rate
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-primary flex items-baseline gap-1 mt-0.5">
                    <span>₹{product.pricePerPiece.toLocaleString('en-IN')}</span>
                    <span className="text-sm font-normal text-muted">/ piece</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-accent block">
                    Wholesale Model
                  </span>
                  <span className="text-xs font-semibold text-charcoal">
                    Fixed Rate • Any Volume
                  </span>
                </div>
              </div>

              {/* Explicit Notice: No tiers or discounts */}
              <div className="p-2.5 bg-cream/70 rounded-md border border-border/70 text-xs text-charcoal/80 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                <span>
                  One fixed rate per piece across any quantity. No hidden markups or minimum volume tier restrictions.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-surface rounded-xl border border-amber-200/80 bg-amber-50/40 shadow-xs space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-muted block">
                    Wholesale Pricing
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-primary flex items-baseline gap-1 mt-0.5">
                    <span>Price Available on Enquiry</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-accent block">
                    Wholesale Model
                  </span>
                  <span className="text-xs font-semibold text-charcoal">
                    Direct Mill Rate
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-white/80 rounded-md border border-amber-200 text-xs text-charcoal/80 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                <span>
                  Wholesale pricing for this design is shared directly upon request. Click &quot;Get Price&quot; below for instant WhatsApp rate.
                </span>
              </div>
            </div>
          )}

          {/* Quantity Selector & Real-Time Total */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
              <label htmlFor="quantity-selector">Order Quantity (Pieces):</label>
              {isPriceVisible ? (
                <span>Total Value: <strong className="text-primary text-sm font-bold">₹{currentTotal.toLocaleString('en-IN')}</strong></span>
              ) : (
                <span className="text-muted">Enquiry Quantity</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center bg-surface border border-border rounded-lg shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-3 text-charcoal hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  id="quantity-selector"
                  type="number"
                  min="1"
                  max={!isOutOfStock && product.stockQuantity > 0 ? product.stockQuantity : undefined}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  disabled={isOutOfStock}
                  className="w-16 py-2 text-center text-sm font-bold text-primary bg-transparent focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={isOutOfStock || (!isOutOfStock && product.stockQuantity > 0 && quantity >= product.stockQuantity)}
                  className="p-3 text-charcoal hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-muted">
                {isOutOfStock ? (
                  <span className="text-rose-600 font-semibold">Out of Stock</span>
                ) : isLowStock ? (
                  <span className="text-amber-700 font-semibold">Limited Stock Available</span>
                ) : (
                  <span className="text-emerald-700 font-semibold">Full Stock Available</span>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs: Add to Cart & WhatsApp Order / Get Price */}
          <div className="space-y-3 pt-2">
            {isPriceVisible ? (
              <>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-3.5 px-6 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    isOutOfStock
                      ? 'bg-surface-subtle text-muted cursor-not-allowed border border-border'
                      : isAdded
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-primary text-white hover:bg-primary-hover shadow-md active:scale-99'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added {quantity} Pieces to Wholesale Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{isOutOfStock ? 'Product Out of Stock' : `Add ${quantity} Pieces to Wholesale Cart (₹${currentTotal.toLocaleString('en-IN')})`}</span>
                    </>
                  )}
                </button>

                {/* Direct WhatsApp Order */}
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 rounded-lg font-bold text-sm bg-[#128C7E] text-white hover:bg-[#075E54] flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Order on WhatsApp (Direct Confirmation)</span>
                </a>
              </>
            ) : (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-lg font-bold text-sm bg-[#128C7E] text-white hover:bg-[#075E54] flex items-center justify-center gap-2 transition-colors shadow-md active:scale-99"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Get Price (WhatsApp Enquiry)</span>
              </a>
            )}
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="pt-6 border-t border-border space-y-2">
              <h3 className="text-xs uppercase font-bold text-primary tracking-wider">
                Wholesale Product Specifications
              </h3>
              <p className="text-sm text-charcoal/90 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Commercial Dispatch Highlights */}
          <div className="pt-4 border-t border-border/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted">
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>Pan-India transport parcel dispatch. Freight billed separately at actuals.</span>
            </div>
            <div className="flex items-start gap-2">
              <Layers className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>Direct loom booking & secure mill bailing available for large volume requirements.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
