import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'bordered' | 'accent' | 'primary';
  hoverEffect?: boolean;
}

export function Card({
  children,
  variant = 'default',
  hoverEffect = false,
  className = '',
  ...props
}: CardProps) {
  const baseStyles = 'rounded-lg overflow-hidden transition-all duration-200';

  const variantStyles = {
    default: 'bg-surface border border-border shadow-xs',
    subtle: 'bg-surface-subtle border border-border/70',
    bordered: 'bg-surface border-2 border-border',
    accent: 'bg-surface border border-accent/40 shadow-xs relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-accent',
    primary: 'bg-primary text-white border border-primary/90 shadow-sm',
  };

  const hoverStyles = hoverEffect ? 'card-hover-subtle hover:border-accent/60' : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-5 sm:p-6 border-b border-border/60 ${className}`}>{children}</div>;
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-5 sm:p-6 bg-surface-subtle/50 border-t border-border/60 ${className}`}>
      {children}
    </div>
  );
}
