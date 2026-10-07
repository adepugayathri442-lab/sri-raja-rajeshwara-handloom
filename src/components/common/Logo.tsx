import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface LogoProps {
  variant?: 'header' | 'footer' | 'auth' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
  className?: string;
}

/**
 * Authentic Shiva–Parvathi Emblem
 * Cropped and extracted directly from the uploaded Sri Raja Rajeshwara Handloom merchant bill logo.
 * Asset: /sri_raja_rajeshwara_shiva_parvathi_logo.png
 */
export function ShivaParvathiEmblem({
  size = 38,
  className = '',
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/sri_raja_rajeshwara_shiva_parvathi_logo.png"
        alt="Sri Raja Rajeshwara Handloom Logo - Shiva Parvathi"
        width={size * 2}
        height={size * 2}
        className="w-full h-full object-contain rounded-full select-none"
        priority={priority}
      />
    </div>
  );
}

// Backward-compatible alias for any legacy imports
export const LoomEmblem = ({
  emblemSize = 38,
}: {
  emblemSize?: number;
  isLight?: boolean;
}) => <ShivaParvathiEmblem size={emblemSize} />;

/**
 * Reusable Sri Raja Rajeshwara Handloom Logo
 * Brand Palette:
 * - Deep Loom Emerald (#0D3B2E)
 * - Antique Muted Gold (#C5A059)
 * - Warm Cream (#FAF8F5)
 * - Charcoal (#1C2421)
 */
export function Logo({
  variant = 'header',
  size = 'md',
  asLink = true,
  className = '',
}: LogoProps) {
  // Icon only
  if (variant === 'icon-only') {
    const iconDim = size === 'sm' ? 28 : size === 'lg' ? 48 : 38;
    const content = (
      <div className="p-0.5 rounded-full bg-surface border border-accent/40 shadow-xs">
        <ShivaParvathiEmblem size={iconDim} />
      </div>
    );
    return asLink ? (
      <Link href="/" className={`inline-flex items-center group ${className}`} aria-label="Sri Raja Rajeshwara Handloom Home">
        {content}
      </Link>
    ) : (
      <div className={`inline-flex items-center ${className}`}>{content}</div>
    );
  }

  // Auth Variant (Centered stacked for Login / Register)
  if (variant === 'auth') {
    const emblemDim = size === 'sm' ? 44 : size === 'lg' ? 64 : 52;
    const content = (
      <div className={`flex flex-col items-center text-center group ${className}`}>
        <div className="p-1 rounded-full bg-surface border border-accent/40 shadow-xs mb-3 ring-2 ring-primary/10 transition-transform group-hover:scale-105">
          <ShivaParvathiEmblem size={emblemDim} priority />
        </div>
        <span className="text-[11px] font-semibold tracking-widest text-accent uppercase">
          Wholesale Cloth Merchant
        </span>
        <span className="text-xl sm:text-2xl font-serif font-bold text-primary tracking-tight mt-0.5">
          SRI RAJA RAJESHWARA
        </span>
        <span className="text-xs font-semibold tracking-widest text-charcoal/70 uppercase mt-0.5">
          HANDLOOM
        </span>
      </div>
    );

    return asLink ? (
      <Link href="/" className="inline-block" aria-label="Sri Raja Rajeshwara Handloom Home">
        {content}
      </Link>
    ) : (
      content
    );
  }

  // Footer Variant (Light text against dark emerald)
  if (variant === 'footer') {
    const emblemDim = size === 'sm' ? 32 : size === 'lg' ? 46 : 40;
    const content = (
      <div className={`flex items-center gap-3.5 group ${className}`}>
        <div className="p-0.5 rounded-full bg-surface border border-accent/50 shadow-xs shrink-0 transition-transform group-hover:scale-105">
          <ShivaParvathiEmblem size={emblemDim} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-widest text-accent uppercase leading-none">
            Wholesale Cloth Merchant
          </span>
          <span className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight leading-tight mt-0.5">
            SRI RAJA RAJESHWARA
          </span>
          <span className="text-[11px] font-semibold tracking-widest text-white/70 uppercase leading-none mt-0.5">
            HANDLOOM
          </span>
        </div>
      </div>
    );

    return asLink ? (
      <Link href="/" className="inline-block" aria-label="Sri Raja Rajeshwara Handloom Home">
        {content}
      </Link>
    ) : (
      content
    );
  }

  // Header Variant (Responsive desktop & mobile)
  const emblemDim = size === 'sm' ? 32 : size === 'lg' ? 46 : 38;
  const content = (
    <div className={`flex items-center gap-2.5 sm:gap-3 group py-1 ${className}`}>
      <div className="p-0.5 rounded-full bg-surface border border-accent/30 shadow-2xs group-hover:border-accent transition-colors shrink-0">
        <ShivaParvathiEmblem size={emblemDim} priority />
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-accent uppercase group-hover:text-accent-hover transition-colors leading-none">
          Wholesale Cloth Merchant
        </span>
        <span className="text-base sm:text-lg md:text-xl font-serif font-bold text-primary tracking-tight leading-tight group-hover:opacity-90 mt-0.5">
          SRI RAJA RAJESHWARA
        </span>
        <span className="text-[10px] sm:text-[11px] font-semibold tracking-widest text-charcoal/70 uppercase leading-none mt-0.5">
          HANDLOOM
        </span>
      </div>
    </div>
  );

  return asLink ? (
    <Link href="/" className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm" aria-label="Sri Raja Rajeshwara Handloom">
      {content}
    </Link>
  ) : (
    content
  );
}
