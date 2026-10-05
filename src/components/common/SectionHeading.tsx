import React from 'react';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <div
      className={`mb-10 sm:mb-14 ${
        isCenter ? 'text-center mx-auto max-w-3xl' : 'max-w-2xl'
      } ${className}`}
    >
      {eyebrow && (
        <div
          className={`inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-accent uppercase mb-2.5 ${
            isCenter ? 'justify-center' : ''
          }`}
        >
          <span className="w-4 h-0.5 bg-accent/60" />
          <span>{eyebrow}</span>
          <span className="w-4 h-0.5 bg-accent/60" />
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-primary tracking-tight">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-3.5 text-sm sm:text-base text-muted leading-relaxed">
          {subtitle}
        </p>
      )}

      <div
        className={`mt-4 flex items-center gap-2 ${
          isCenter ? 'justify-center' : 'justify-start'
        }`}
      >
        <span className="h-0.5 w-12 bg-accent" />
        <span className="w-1.5 h-1.5 rotate-45 bg-primary" />
        <span className="h-0.5 w-6 bg-border" />
      </div>
    </div>
  );
}
