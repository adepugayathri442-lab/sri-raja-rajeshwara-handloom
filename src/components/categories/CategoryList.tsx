import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { getCategories } from '@/lib/supabase/catalog';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import type { CategoryRow } from '@/types';

const GROUP_ORDER = [
  'Towels',
  'Lungies',
  'Traditional Cloth',
  'Dhoties',
  'Shawls',
] as const;

export async function CategoryList() {
  const categories = await getCategories();

  const grouped: Record<string, CategoryRow[]> = {};
  for (const group of GROUP_ORDER) {
    grouped[group] = [];
  }

  for (const cat of categories) {
    const g = cat.group_name || 'Traditional Cloth';
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(cat);
  }

  return (
    <div className="space-y-12 sm:space-y-16">
      {GROUP_ORDER.map((groupName) => {
        const groupCats = grouped[groupName] || [];
        if (groupCats.length === 0) return null;

        return (
          <div key={groupName} className="space-y-5">
            {/* Group Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-primary/10 gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rotate-45 bg-accent" />
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-primary">
                  {groupName} Family
                </h3>
                <Badge variant="subtle" size="sm">
                  {groupCats.length} {groupCats.length === 1 ? 'Category' : 'Categories'}
                </Badge>
              </div>
              <span className="text-xs text-muted flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                Single Fixed Rate / Piece
              </span>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {groupCats.map((category) => (
                <Card
                  key={category.id}
                  variant="default"
                  hoverEffect
                  className="p-6 flex flex-col justify-between border-border hover:border-accent bg-surface transition-all duration-300 group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant="primary" size="sm">
                        {category.group_name}
                      </Badge>
                      <span className="text-[11px] font-semibold text-accent flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Fixed Rate
                      </span>
                    </div>

                    <h4 className="text-lg font-serif font-bold text-primary group-hover:text-accent transition-colors">
                      {category.name}
                    </h4>

                    <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed line-clamp-3">
                      {category.description ||
                        `Authentic wholesale ${category.name.toLowerCase()} supplied directly for shops and institutions at fixed piece rates.`}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Layers className="w-3 h-3 text-primary/60" />
                      Any Quantity
                    </span>
                    <Link
                      href={`/products?category=${category.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:text-accent transition-colors"
                    >
                      <span>Explore Products</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
