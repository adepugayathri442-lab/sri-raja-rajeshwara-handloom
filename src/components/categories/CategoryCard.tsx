import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import type { ProductCategoryStructure } from '@/config/categories';

export interface CategoryCardProps {
  category: ProductCategoryStructure;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Card
      variant="default"
      hoverEffect
      className="p-6 flex flex-col justify-between border-border hover:border-accent bg-surface transition-all duration-300 group"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge variant="subtle" size="sm">
            Wholesale Category
          </Badge>
          <span className="text-[11px] font-semibold text-accent flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Fixed Piece Rate
          </span>
        </div>

        <h3 className="text-xl font-serif font-bold text-primary group-hover:text-accent transition-colors">
          {category.name}
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
          {category.description}
        </p>

        <div className="mt-4 p-3 bg-cream/70 rounded-md border border-border/70 text-xs">
          <div className="font-semibold text-primary text-[10px] uppercase tracking-wider mb-1">
            Supply Terms
          </div>
          <div className="text-charcoal/90">{category.wholesaleHighlight}</div>
        </div>

        <ul className="mt-4 space-y-1.5 text-xs text-muted">
          {category.sampleSpecs.map((spec) => (
            <li key={spec} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>{spec}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted">Single fixed rate / piece</span>
        <Link
          href={`/categories/${category.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:text-accent transition-colors"
        >
          <span>View {category.name}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </Card>
  );
}
