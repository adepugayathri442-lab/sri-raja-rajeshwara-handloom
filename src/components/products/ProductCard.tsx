'use client';

/**
 * Wholesale Product Card
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Rules:
 * - 100% Wholesale: single fixed wholesale rate per piece.
 * - Format: "₹X / piece".
 * - NO retail price, NO MRP, NO fake discounts, NO quantity tiers.
 * - Stock badge: In Stock / Low Stock / Out of Stock.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, MessageCircle, ArrowRight, Package, Check, AlertCircle } from 'lucide-react';
import type { Product } from '@/types';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/cart/cart-context';
import { getProductEnquiryUrl } from '@/lib/whatsapp';

export interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const rawPrice = product.pricePerPiece !== null && product.pricePerPiece !== undefined && !isNaN(Number(product.pricePerPiece))
    ? Number(product.pricePerPiece)
    : null;
  const hasValidPrice = rawPrice !== null && rawPrice > 0;
  const isPriceVisible = Boolean(hasValidPrice && product.priceVisible !== false);

  const stockStatus = product.stockStatus || (product.stockQuantity <= 0 ? 'out_of_stock' : product.stockQuantity <= 10 ? 'limited' : 'full');
  const isOutOfStock = stockStatus === 'out_of_stock' || product.stockQuantity <= 0;
  const isLimitedStock = stockStatus === 'limited';

  const displayImage = product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : null);
  const hasValidImage = Boolean(
    displayImage &&
    typeof displayImage === 'string' &&
    displayImage.trim() !== '' &&
    displayImage !== 'null' &&
    !imageError
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock || !isPriceVisible || product.pricePerPiece === null) return;
    
    addItem({
      productId: product.id,
      productCode: product.productCode,
      name: product.name,
      slug: product.slug,
      pricePerPiece: product.pricePerPiece,
      imageUrl: product.imageUrl,
    }, 1);

    if (!isAuthenticated) {
      router.push('/login?next=/cart');
      return;
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const whatsappHref = getProductEnquiryUrl({
    name: product.name,
    productCode: product.productCode,
    pricePerPiece: product.pricePerPiece,
    priceVisible: isPriceVisible,
    quantity: 1,
  });

  return (
    <div className="group bg-surface rounded-xl border border-border hover:border-accent shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Product Media Area */}
        <Link href={`/products/${product.slug}`} className="block relative aspect-4/3 bg-surface-subtle overflow-hidden">
          {hasValidImage ? (
            <Image
              src={displayImage!}
              alt={`${product.name} - Wholesale Handloom`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-cream to-surface-subtle border-b border-border/60">
              <div className="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center mb-2">
                <Package className="w-6 h-6 text-primary/60" />
              </div>
              <span className="text-[11px] font-medium text-muted">
                Sri Raja Rajeshwara Handloom
              </span>
              <span className="text-[10px] text-muted/70 mt-0.5">
                Wholesale Textile Stock
              </span>
            </div>
          )}

          {/* Top Overlays */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
            {product.categoryName && (
              <span className="px-2 py-0.5 bg-surface/90 backdrop-blur-xs text-primary font-semibold text-[10px] rounded border border-border shadow-xs">
                {product.categoryName}
              </span>
            )}

            {/* Stock Badge */}
            {isOutOfStock ? (
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-semibold text-[10px] rounded border border-rose-200 shadow-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Out of Stock
              </span>
            ) : isLimitedStock ? (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-semibold text-[10px] rounded border border-amber-200 shadow-xs">
                Limited Stock
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-semibold text-[10px] rounded border border-emerald-200 shadow-xs flex items-center gap-1">
                <Check className="w-3 h-3" />
                Full Stock
              </span>
            )}
          </div>
        </Link>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {product.productCode && (
            <div className="text-[11px] font-mono text-muted mb-1 tracking-wider uppercase">
              {product.productCode}
            </div>
          )}

          <Link href={`/products/${product.slug}`} className="block group/title">
            <h3 className="text-base sm:text-lg font-serif font-bold text-primary group-hover/title:text-accent transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {product.description && (
            <p className="mt-1.5 text-xs text-muted line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Wholesale Fixed Piece Rate or Get Price Notice */}
          <div className="mt-4 pt-3 border-t border-border/60 flex items-baseline justify-between">
            {isPriceVisible && product.pricePerPiece !== null ? (
              <div>
                <span className="text-[10px] text-muted block uppercase tracking-wider font-medium">
                  Wholesale Rate
                </span>
                <div className="text-lg sm:text-xl font-bold text-primary">
                  ₹{product.pricePerPiece.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-muted">/ piece</span>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-[10px] text-muted block uppercase tracking-wider font-medium">
                  Wholesale Rate
                </span>
                <div className="text-sm sm:text-base font-bold text-primary">
                  Price on Enquiry
                </div>
              </div>
            )}

            <div className="text-right">
              <span className="text-[10px] text-muted block">Order Volume</span>
              <span className="text-xs font-semibold text-charcoal">Any Quantity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-4 sm:p-5 pt-0 grid grid-cols-2 gap-2 border-t border-border/40 mt-2">
        {!isPriceVisible ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-bold bg-[#128C7E] text-white hover:bg-[#075E54] shadow-xs active:scale-98 transition-all"
            title="Get Wholesale Price on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Get Price</span>
          </a>
        ) : (
          <>
            {/* Add to Wholesale Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`col-span-2 sm:col-span-1 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                isOutOfStock
                  ? 'bg-surface-subtle text-muted cursor-not-allowed border border-border'
                  : added
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-primary text-white hover:bg-primary-hover shadow-xs active:scale-98'
              }`}
              title={isOutOfStock ? 'Currently out of stock' : 'Add to Wholesale Order Cart'}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                </>
              )}
            </button>

            {/* WhatsApp Direct Enquiry */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 sm:col-span-1 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold bg-[#128C7E]/10 text-[#075E54] hover:bg-[#128C7E] hover:text-white transition-all border border-[#128C7E]/30"
              title="Direct WhatsApp Enquiry with Product Details"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </a>
          </>
        )}

        {/* View Details Link */}
        <Link
          href={`/products/${product.slug}`}
          className="col-span-2 text-center text-xs font-semibold text-primary hover:text-accent pt-1 inline-flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>View Product</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
