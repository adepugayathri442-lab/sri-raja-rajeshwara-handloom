'use client';

/**
 * Image-Only Wholesale Catalogue Item Card
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Rules:
 * - Shows ONLY the uploaded item photo + Buy + Enquiry buttons.
 * - Zero fake product names, prices, SKUs, or descriptions.
 * - Buy button enforces authentication (redirects to login if guest, returns to page).
 * - Enquiry button opens official WhatsApp with Category and Item Ref.
 * - Clicking image opens full-screen zoom preview.
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingBag, MessageCircle, Maximize2, AlertCircle } from 'lucide-react';
import type { CatalogueItem } from '@/types';
import { useAuth } from '@/lib/auth/auth-context';
import { getCatalogueItemEnquiryUrl } from '@/lib/whatsapp';

export interface CatalogueItemCardProps {
  item: CatalogueItem;
  categoryName: string;
  onImageClick?: (item: CatalogueItem) => void;
}

export function CatalogueItemCard({
  item,
  categoryName,
  onImageClick,
}: CatalogueItemCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, profile } = useAuth();
  const [imageError, setImageError] = useState(false);

  const enquiryUrl = getCatalogueItemEnquiryUrl({
    categoryName,
    itemId: item.id,
    imageUrl: item.imageUrl,
    intent: 'enquire',
    customerName: profile?.fullName,
    businessName: profile?.businessName || undefined,
  });

  const buyUrl = getCatalogueItemEnquiryUrl({
    categoryName,
    itemId: item.id,
    imageUrl: item.imageUrl,
    intent: 'buy',
    customerName: profile?.fullName,
    businessName: profile?.businessName || undefined,
  });

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      // Redirect unauthenticated customer to login, returning to current category after login
      const nextUrl = encodeURIComponent(pathname || '/categories');
      router.push(`/login?next=${nextUrl}`);
      return;
    }

    // Authenticated customer: route safely to WhatsApp order booking for this item
    window.open(buyUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="group bg-surface rounded-xl border border-border hover:border-accent shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Image Container with Natural/Portrait Aspect Ratio */}
      <div
        onClick={() => onImageClick?.(item)}
        className="relative aspect-[3/4] bg-surface-subtle overflow-hidden cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`View full photo for ${categoryName} item`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onImageClick?.(item);
          }
        }}
      >
        {!imageError ? (
          <Image
            src={item.imageUrl}
            alt={`${categoryName} Wholesale Handloom Item`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-cream/50 text-muted">
            <AlertCircle className="w-6 h-6 mb-1 text-muted/60" />
            <span className="text-[11px] font-medium">{categoryName}</span>
            <span className="text-[10px] text-muted/70">Photo loading unavailable</span>
          </div>
        )}

        {/* Zoom Overlay Icon on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="p-2 rounded-full bg-surface/90 text-primary shadow-xs">
            <Maximize2 className="w-4 h-4" />
          </span>
        </div>

        {/* Category Label Pill */}
        <div className="absolute top-2 left-2 pointer-events-none">
          <span className="px-2 py-0.5 bg-surface/90 backdrop-blur-xs text-primary font-semibold text-[10px] rounded border border-border shadow-2xs">
            {categoryName}
          </span>
        </div>
      </div>

      {/* Action Buttons: BUY + ENQUIRY */}
      <div className="p-2.5 sm:p-3 bg-surface border-t border-border/80 flex flex-col gap-1.5">
        {/* BUY Button */}
        <button
          type="button"
          onClick={handleBuyClick}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-bold bg-primary text-white hover:bg-primary-hover active:scale-98 transition-all shadow-2xs cursor-pointer"
          title={isAuthenticated ? 'Book wholesale order on WhatsApp' : 'Sign in to buy this item'}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Buy</span>
        </button>

        {/* ENQUIRY Button */}
        <a
          href={enquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold bg-[#128C7E]/10 text-[#075E54] hover:bg-[#128C7E] hover:text-white transition-all border border-[#128C7E]/30"
          title="Inquire wholesale price on WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current" />
          <span>Get Price / Enquire</span>
        </a>
      </div>
    </div>
  );
}
