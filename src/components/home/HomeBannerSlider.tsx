'use client';

/**
 * Amazon-Style Homepage Banner Slider
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Real project assets & traditional handloom vector emblems (no fake images)
 * - Display 1 main banner at a time
 * - Automatic smooth slide transition (4.5s)
 * - Mobile touch/swipe gesture support without horizontal overflow
 * - Desktop previous/next controls with accessible labels
 * - Pagination indicators with active pill transition
 * - Pause on hover/touch/focus, resume automatically
 * - Handles 1 slide gracefully (hides controls) and 2+ slides correctly
 * - Respects prefers-reduced-motion
 * - Compact height matching traditional handloom aesthetics
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, MessageCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { getGeneralEnquiryUrl } from '@/lib/whatsapp';

interface BannerSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  badges: string[];
  ctaText: string;
  ctaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  isWhatsAppSecondary?: boolean;
  bgGradient: string;
  accentColor: string;
  motifVariant: 'loom' | 'towels' | 'lungies' | 'cloth';
}

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'slide-heritage',
    eyebrow: 'Pusala Galli, Nizamabad • Direct Loom Supply',
    title: 'Authentic Wholesale Handloom Textiles',
    subtitle: 'Direct merchant supply for retail cloth shops, resellers, and institutions across India with single fixed piece rates.',
    badges: ['100% Wholesale', 'Fixed Piece Rates', 'Pan-India Transport'],
    ctaText: 'Explore Wholesale Catalogue',
    ctaHref: '/products',
    secondaryCtaText: 'WhatsApp Order Desk',
    secondaryCtaHref: getGeneralEnquiryUrl('I would like to enquire about wholesale handloom orders and delivery.'),
    isWhatsAppSecondary: true,
    bgGradient: 'from-[#0D3B2E] via-[#092B22] to-[#051A14]',
    accentColor: '#C5A059',
    motifVariant: 'loom',
  },
  {
    id: 'slide-towels',
    eyebrow: 'Commercial Towels Family • High Absorbency Cotton',
    title: 'Wholesale Towels at Transparent Piece Rates',
    subtitle: 'Everyday Cotton Towels, Richcott Towels, and Turkey Towels woven for maximum absorbency and long-lasting durability.',
    badges: ['Everyday Cotton', 'Richcott Towels', 'Turkey Towels'],
    ctaText: 'Explore Towels Collection',
    ctaHref: '/categories/towels',
    secondaryCtaText: 'Inquire on WhatsApp',
    secondaryCtaHref: getGeneralEnquiryUrl('Inquiring about wholesale rates for Towels, Richcott, and Turkey towels.'),
    isWhatsAppSecondary: true,
    bgGradient: 'from-[#0F3528] via-[#0C2A20] to-[#1F2E23]',
    accentColor: '#DFD0B2',
    motifVariant: 'towels',
  },
  {
    id: 'slide-lungies-dhoties',
    eyebrow: 'Lungies & Dhoties • 100% Pure Cotton Woven',
    title: 'Check Lungies, Panchagajam & Pooja Dhoties',
    subtitle: 'High-demand traditional attire supplied directly to cloth showrooms, temple trusts, and cultural bulk buyers.',
    badges: ['Check Lungies', 'Panchagajam Dhoties', 'Pooja Dhoties'],
    ctaText: 'View Lungies & Dhoties',
    ctaHref: '/products?category=check-lungies',
    secondaryCtaText: 'WhatsApp Price List',
    secondaryCtaHref: getGeneralEnquiryUrl('Requesting wholesale price list for Lungies and Dhoties.'),
    isWhatsAppSecondary: true,
    bgGradient: 'from-[#082820] via-[#0E342B] to-[#10231D]',
    accentColor: '#C5A059',
    motifVariant: 'lungies',
  },
  {
    id: 'slide-traditional-cloth',
    eyebrow: 'Traditional Cloth & Shawls • Direct Merchant Supply',
    title: 'Maharashtra Dastie, Khadhi & Sanmaan Shawls',
    subtitle: 'Authentic ceremonial textiles, Condva, Deeksha cloth, and shawls with parcel consignment tracking across India.',
    badges: ['Maharashtra Dastie', 'Khadhi Long Cloth', 'Sanmaan Shawls'],
    ctaText: 'Browse Traditional Cloth',
    ctaHref: '/categories/deeksha-cloth',
    secondaryCtaText: 'Submit Wholesale Enquiry',
    secondaryCtaHref: '/wholesale-enquiry',
    isWhatsAppSecondary: false,
    bgGradient: 'from-[#0B2E24] via-[#07241C] to-[#122A22]',
    accentColor: '#DFD0B2',
    motifVariant: 'cloth',
  },
];

// SVG Traditional Textile Emblem for visual banners
function BannerEmblem({ variant }: { variant: 'loom' | 'towels' | 'lungies' | 'cloth' }) {
  if (variant === 'towels') {
    return (
      <svg className="w-full h-full opacity-25" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <pattern id="towel-weave" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 10h20M10 0v20" stroke="#C5A059" strokeWidth="1" opacity="0.6" />
          <circle cx="10" cy="10" r="2" fill="#C5A059" opacity="0.8" />
        </pattern>
        <rect width="200" height="200" fill="url(#towel-weave)" />
        <rect x="25" y="25" width="150" height="150" rx="12" stroke="#C5A059" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
    );
  }

  if (variant === 'lungies') {
    return (
      <svg className="w-full h-full opacity-25" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <pattern id="check-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#C5A059" opacity="0.3" />
          <rect x="12" y="12" width="12" height="12" fill="#C5A059" opacity="0.3" />
          <path d="M0 0h24v24H0z" stroke="#C5A059" strokeWidth="0.75" />
        </pattern>
        <rect width="200" height="200" fill="url(#check-pattern)" />
      </svg>
    );
  }

  if (variant === 'cloth') {
    return (
      <svg className="w-full h-full opacity-25" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <circle cx="100" cy="100" r="75" stroke="#C5A059" strokeWidth="2" strokeDasharray="6 3" />
        <circle cx="100" cy="100" r="50" stroke="#C5A059" strokeWidth="1.5" />
        <path d="M100 15v170M15 100h170" stroke="#C5A059" strokeWidth="1" strokeDasharray="2 4" />
        <rect x="65" y="65" width="70" height="70" rx="4" transform="rotate(45 100 100)" stroke="#C5A059" strokeWidth="1.5" />
      </svg>
    );
  }

  // Default Traditional Loom Shuttle Emblem
  return (
    <svg className="w-full h-full opacity-25" viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <rect x="100" y="20" width="110" height="110" rx="12" transform="rotate(45 100 20)" stroke="#C5A059" strokeWidth="2" />
      <rect x="100" y="38" width="85" height="85" rx="8" transform="rotate(45 100 38)" stroke="#C5A059" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="100" y1="50" x2="100" y2="150" stroke="#C5A059" strokeWidth="2" />
      <line x1="80" y1="65" x2="80" y2="135" stroke="#FAF8F5" strokeWidth="1.5" opacity="0.7" />
      <line x1="120" y1="65" x2="120" y2="135" stroke="#FAF8F5" strokeWidth="1.5" opacity="0.7" />
      <path d="M50 100 C70 85, 130 85, 150 100 C130 115, 70 115, 50 100 Z" fill="#C5A059" opacity="0.5" stroke="#FAF8F5" strokeWidth="1" />
      <circle cx="100" cy="100" r="8" fill="#0D3B2E" stroke="#C5A059" strokeWidth="2" />
    </svg>
  );
}

export function HomeBannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const totalSlides = BANNER_SLIDES.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Automatic slide rotation every 4.5s
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;
    if (isPaused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      goToNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides, goToNext]);

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <section
      aria-label="Featured Wholesale Announcements"
      className="py-6 sm:py-8 bg-cream border-b border-border overflow-hidden select-none"
    >
      <Container size="xl">
        <div
          className="relative rounded-2xl overflow-hidden shadow-sm border border-accent/30"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          {/* Slides Track */}
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {BANNER_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className={`min-w-full w-full shrink-0 bg-gradient-to-r ${slide.bgGradient} text-white relative flex flex-col justify-center px-5 py-8 sm:px-10 sm:py-10 md:px-14 md:py-12 min-h-[260px] sm:min-h-[290px] md:min-h-[320px]`}
                aria-hidden={currentIndex !== idx}
              >
                {/* Traditional Background Motif Illustration */}
                <div className="absolute right-4 sm:right-12 md:right-16 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 pointer-events-none">
                  <BannerEmblem variant={slide.motifVariant} />
                </div>

                {/* Subtle Gold Accent Ambient Glow */}
                <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

                {/* Slide Text Content */}
                <div className="relative z-10 max-w-xl sm:max-w-2xl space-y-3">
                  {/* Eyebrow */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    <span>{slide.eyebrow}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
                    {slide.title}
                  </h2>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-white/85 line-clamp-2 sm:line-clamp-none leading-relaxed max-w-xl font-normal">
                    {slide.subtitle}
                  </p>

                  {/* Trust Highlights Pills */}
                  <div className="pt-1 flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] text-white/90">
                    {slide.badges.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface/10 border border-white/20 backdrop-blur-xs font-medium"
                      >
                        <ShieldCheck className="w-3 h-3 text-accent shrink-0" />
                        <span>{badge}</span>
                      </span>
                    ))}
                  </div>

                  {/* Action CTAs */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link
                      href={slide.ctaHref}
                      className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-md bg-accent text-charcoal font-bold text-xs sm:text-sm hover:bg-accent-hover transition-colors shadow-xs active:scale-[0.99]"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {slide.isWhatsAppSecondary ? (
                      <a
                        href={slide.secondaryCtaHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/25 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
                        <span>{slide.secondaryCtaText}</span>
                      </a>
                    ) : (
                      <Link
                        href={slide.secondaryCtaHref}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/25 transition-colors"
                      >
                        <span>{slide.secondaryCtaText}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Previous / Next Controls (Only if 2+ slides) */}
          {totalSlides > 1 && (
            <>
              <button
                type="button"
                onClick={goToPrev}
                aria-label="Previous banner slide"
                className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface/90 hover:bg-surface text-primary hover:text-accent border border-accent/40 shadow-md items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 z-20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={goToNext}
                aria-label="Next banner slide"
                className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface/90 hover:bg-surface text-primary hover:text-accent border border-accent/40 shadow-md items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 z-20"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Pagination Indicators (Only if 2+ slides) */}
          {totalSlides > 1 && (
            <div
              className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 px-3 py-1 rounded-full bg-charcoal/30 backdrop-blur-xs border border-white/10"
              role="tablist"
              aria-label="Banner slides pagination"
            >
              {BANNER_SLIDES.map((slide, index) => {
                const isActive = currentIndex === index;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    onClick={() => setCurrentIndex(index)}
                    aria-selected={isActive}
                    aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                    className={`transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isActive
                        ? 'w-6 sm:w-7 h-2 bg-accent shadow-2xs'
                        : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
