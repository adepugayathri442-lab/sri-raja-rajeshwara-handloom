import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { getCategories } from '@/lib/supabase/catalog';
import type { CategoryRow } from '@/types';

// The 5 official wholesale product groups
const GROUP_ORDER = [
  'Towels',
  'Lungies',
  'Traditional Cloth',
  'Dhoties',
  'Shawls',
] as const;

export async function CategoryGrid() {
  const categories = await getCategories();

  // Group categories by group_name
  const groupedCategories: Record<string, CategoryRow[]> = {};
  for (const group of GROUP_ORDER) {
    groupedCategories[group] = [];
  }

  for (const cat of categories) {
    const group = cat.group_name || 'Traditional Cloth';
    if (!groupedCategories[group]) {
      groupedCategories[group] = [];
    }
    groupedCategories[group].push(cat);
  }

  return (
    <section className="py-16 sm:py-24 bg-surface border-b border-border" id="categories-showcase">
      <Container size="xl">
        <SectionHeading
          eyebrow="Commercial Textile Families"
          title="Wholesale Category Showcase"
          subtitle="All 12 authentic handloom and textile categories grouped across 5 traditional families. Every category operates on single fixed piece rates for retail shops, resellers, and institutions across India."
        />

        <div className="space-y-12 sm:space-y-16">
          {GROUP_ORDER.map((groupName) => {
            const groupCats = groupedCategories[groupName] || [];
            if (groupCats.length === 0) return null;

            return (
              <div key={groupName} className="space-y-5">
                {/* Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-primary/10 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rotate-45 bg-accent" />
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-primary">
                      {groupName}
                    </h3>
                    <Badge variant="subtle" size="sm">
                      {groupCats.length} {groupCats.length === 1 ? 'Category' : 'Categories'}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    Uniform Wholesale Piece Rate
                  </span>
                </div>

                {/* Categories in this Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {groupCats.map((cat) => (
                    <Card
                      key={cat.id}
                      variant="default"
                      hoverEffect
                      className="p-6 flex flex-col justify-between bg-cream/40 border-border hover:border-accent transition-all duration-300 group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <Badge variant="primary" size="sm">
                            {cat.group_name}
                          </Badge>
                          <span className="text-[11px] font-semibold text-accent flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Fixed Piece Rate
                          </span>
                        </div>

                        <h4 className="text-lg font-serif font-bold text-primary group-hover:text-accent transition-colors">
                          {cat.name}
                        </h4>

                        <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed line-clamp-3">
                          {cat.description ||
                            `Authentic wholesale ${cat.name.toLowerCase()} supplied directly for shops and institutions at fixed piece rates.`}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between">
                        <span className="text-[11px] text-muted flex items-center gap-1">
                          <Layers className="w-3 h-3 text-primary/60" />
                          Any Quantity Order
                        </span>
                        <Link
                          href={`/categories/${cat.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:text-accent transition-colors"
                        >
                          <span>View Products</span>
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

        {/* Custom B2B Volume Notice */}
        <div className="mt-14 p-6 sm:p-8 bg-primary rounded-xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1 text-xs text-accent font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Direct Mill & Loom Dispatch</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Looking for Bulk Bales or Custom Handloom Weaves?
            </h4>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl">
              We supply retail cloth merchants, temple trusts, cultural institutions, and garment businesses with direct transport delivery across India.
            </p>
          </div>

          <Link
            href="/wholesale-enquiry"
            className="shrink-0 px-5 py-3 bg-accent text-charcoal font-bold text-xs rounded-md hover:bg-accent-hover transition-colors shadow-xs"
          >
            Submit Wholesale Enquiry
          </Link>
        </div>
      </Container>
    </section>
  );
}
