'use client';

/**
 * Image-Only Wholesale Catalogue Grid & Lightbox
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Mobile: 2-column image grid
 * - Desktop: 3 or 4-column image grid
 * - Full-screen photo zoom modal / lightbox
 * - Buy button (authenticated) & WhatsApp enquiry button
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ShoppingBag, MessageCircle, Sparkles } from 'lucide-react';
import type { CatalogueItem } from '@/types';
import { CatalogueItemCard } from './CatalogueItemCard';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { getCatalogueItemEnquiryUrl } from '@/lib/whatsapp';

export interface ImageCatalogueGridProps {
  items: CatalogueItem[];
  categoryName: string;
}

export function ImageCatalogueGrid({ items, categoryName }: ImageCatalogueGridProps) {
  const [selectedItem, setSelectedItem] = useState<CatalogueItem | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, profile } = useAuth();

  if (!items || items.length === 0) {
    return null;
  }

  const handleModalBuy = () => {
    if (!selectedItem) return;
    if (!isAuthenticated) {
      const nextUrl = encodeURIComponent(pathname || '/categories');
      router.push(`/login?next=${nextUrl}`);
      return;
    }

    const buyUrl = getCatalogueItemEnquiryUrl({
      categoryName,
      itemId: selectedItem.id,
      imageUrl: selectedItem.imageUrl,
      intent: 'buy',
      customerName: profile?.fullName,
      businessName: profile?.businessName || undefined,
    });
    window.open(buyUrl, '_blank', 'noopener,noreferrer');
  };

  const modalEnquiryUrl = selectedItem
    ? getCatalogueItemEnquiryUrl({
        categoryName,
        itemId: selectedItem.id,
        imageUrl: selectedItem.imageUrl,
        intent: 'enquire',
        customerName: profile?.fullName,
        businessName: profile?.businessName || undefined,
      })
    : '';

  return (
    <div className="space-y-4">
      {/* Grid of items: 2 columns on mobile, 3 on sm, 4 on lg */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {items.map((item) => (
          <CatalogueItemCard
            key={item.id}
            item={item}
            categoryName={categoryName}
            onImageClick={(it) => setSelectedItem(it)}
          />
        ))}
      </div>

      {/* Lightbox / Full-screen Photo Zoom Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${categoryName} photo preview`}
        >
          <div
            className="relative bg-surface rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-border flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between bg-surface-subtle">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                  {categoryName}
                </span>
                <span className="text-xs text-muted font-mono hidden sm:inline">
                  Ref: {selectedItem.id.slice(0, 8)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-full text-charcoal hover:bg-surface hover:text-primary transition-colors cursor-pointer"
                aria-label="Close photo preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="relative aspect-[3/4] sm:aspect-square bg-cream/30 overflow-hidden flex-1 max-h-[65vh]">
              <Image
                src={selectedItem.imageUrl}
                alt={`${categoryName} Wholesale Item`}
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
                  Order any quantity volume with direct transport dispatch.
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleModalBuy}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold bg-primary text-white hover:bg-primary-hover transition-colors shadow-2xs cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Buy</span>
                </button>

                <a
                  href={modalEnquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-[#128C7E] text-white hover:bg-[#075E54] transition-colors shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>Get Price</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
