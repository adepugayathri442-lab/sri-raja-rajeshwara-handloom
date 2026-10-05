import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'accent' | 'outline' | 'subtle' | 'success' | 'warning';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'subtle',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide transition-colors';
  
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  const variantStyles = {
    primary: 'bg-primary text-white border border-primary',
    accent: 'bg-accent/15 text-accent-hover border border-accent/40 font-semibold',
    outline: 'border border-border text-charcoal/80 bg-surface',
    subtle: 'bg-surface-subtle text-muted border border-border/60',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
