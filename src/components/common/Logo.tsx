import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'header' | 'footer' | 'auth' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
  className?: string;
}

// SVG Emblem of Traditional Weaving Loom Shuttle & Warp
function LoomEmblem({ emblemSize = 36, isLight = false }: { emblemSize?: number; isLight?: boolean }) {
  return (
    <svg
      width={emblemSize}
      height={emblemSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform group-hover:scale-105 duration-200"
      aria-hidden="true"
    >
      {/* Outer Loom Diamond Frame */}
      <rect
        x="24"
        y="4"
        width="28"
        height="28"
        rx="4"
        transform="rotate(45 24 4)"
        fill={isLight ? '#0D3B2E' : '#0D3B2E'}
        stroke="#C5A059"
        strokeWidth="2"
      />
      {/* Inner Accent Inset */}
      <rect
        x="24"
        y="9"
        width="21"
        height="21"
        rx="2"
        transform="rotate(45 24 9)"
        stroke="#C5A059"
        strokeWidth="1"
        strokeDasharray="2 2"
        opacity="0.75"
      />
      {/* Warp / Weft Loom Lines */}
      <line x1="24" y1="12" x2="24" y2="36" stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="16" x2="18" y2="32" stroke="#FAF8F5" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
      <line x1="30" y1="16" x2="30" y2="32" stroke="#FAF8F5" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
      {/* Horizontal Loom Shuttle */}
      <path
        d="M12 24 C16 20, 32 20, 36 24 C32 28, 16 28, 12 24 Z"
        fill="#C5A059"
        stroke="#FAF8F5"
        strokeWidth="0.8"
      />
      {/* Center Shuttle Spool Core */}
      <circle cx="24" cy="24" r="2.5" fill="#0D3B2E" stroke="#FAF8F5" strokeWidth="1" />
    </svg>
  );
}

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
    const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
    const content = <LoomEmblem emblemSize={iconSize} />;
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
    const content = (
      <div className={`flex flex-col items-center text-center group ${className}`}>
        <div className="p-2.5 rounded-full bg-primary/5 border border-accent/30 shadow-xs mb-3">
          <LoomEmblem emblemSize={44} />
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
    const content = (
      <div className={`flex items-center gap-3.5 group ${className}`}>
        <div className="p-1 rounded-md bg-primary-light/40 border border-accent/40 shadow-xs">
          <LoomEmblem emblemSize={size === 'lg' ? 44 : 38} isLight={true} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-widest text-accent uppercase">
            Wholesale Cloth Merchant
          </span>
          <span className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight leading-tight">
            SRI RAJA RAJESHWARA
          </span>
          <span className="text-[11px] font-semibold tracking-widest text-white/70 uppercase">
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
  const emblemDim = size === 'sm' ? 30 : size === 'lg' ? 42 : 36;
  const content = (
    <div className={`flex items-center gap-2.5 sm:gap-3 group py-1 ${className}`}>
      <div className="p-1 rounded bg-surface border border-accent/30 shadow-2xs group-hover:border-accent transition-colors">
        <LoomEmblem emblemSize={emblemDim} />
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-accent uppercase group-hover:text-accent-hover transition-colors leading-none">
          Wholesale Cloth Merchant
        </span>
        <span className="text-base sm:text-lg md:text-xl font-serif font-bold text-primary tracking-tight leading-tight group-hover:opacity-90">
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
