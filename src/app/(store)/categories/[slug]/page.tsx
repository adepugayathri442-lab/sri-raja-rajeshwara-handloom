import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Sparkles, Layers, ShieldCheck, Truck } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Badge } from '@/components/common/Badge';
import { EmptyProductState } from '@/components/products/EmptyProductState';
import { ProductCard } from '@/components/products/ProductCard';
import { CategoryNavigation } from '@/components/categories/CategoryNavigation';
import { ImageCatalogueGrid } from '@/components/categories/ImageCatalogueGrid';
import { getCategoryBySlug, getProducts } from '@/lib/supabase/catalog';
import { getCatalogueItemsByCategoryId } from '@/lib/supabase/image-catalogue';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Wholesale Category | Sri Raja Rajeshwara Handloom',
      description: 'Authentic Indian handloom wholesale textiles at transparent fixed piece rates.',
    };
  }

  return {
    title: `${category.name} | Fixed Piece Rates | Sri Raja Rajeshwara Handloom`,
    description:
      category.description ||
      `Authentic wholesale ${category.name} supplied to retail shops, resellers, and institutions across India at fixed piece rates.`,
  };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Concurrently query normal products and image catalogue items belonging to this category UUID
  const [{ products }, catalogueItems] = await Promise.all([
    getProducts({
      categoryId: category.id,
      categorySlug: slug,
    }),
    getCatalogueItemsByCategoryId(category.id),
  ]);

  const totalItemsCount = products.length + catalogueItems.length;

  return (
    <div className="py-10 sm:py-16 bg-cream/40 min-h-screen">
      <Container size="xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-4 flex items-center gap-2 text-xs text-muted">
          <Link href="/categories" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Wholesale Categories</span>
          </Link>
          <span>/</span>
          <span className="text-charcoal font-semibold">{category.name}</span>
        </div>

        {/* Category Navigation with Active Focus Highlight */}
        <div className="mb-6">
          <CategoryNavigation activeSlug={slug} />
        </div>

        {/* Category Header Card */}
        <div className="p-6 sm:p-10 bg-surface rounded-xl border border-border mb-10 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                {category.group_name} Family
              </Badge>
              <span className="text-xs text-muted">
                {totalItemsCount} item{totalItemsCount === 1 ? '' : 's'} available
              </span>
            </div>

            <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Fixed Wholesale Rate / Piece
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary">
            {category.name}
          </h1>

          <p className="text-sm sm:text-base text-muted max-w-3xl leading-relaxed">
            {category.description ||
              `Authentic wholesale ${category.name.toLowerCase()} supplied directly for shops, bulk buyers, and institutions at single fixed piece rates with pan-India transport dispatch.`}
          </p>

          {/* Core Wholesale Guarantees */}
          <div className="pt-4 border-t border-border/70 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>100% Wholesale • Fixed piece rates</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent shrink-0" />
              <span>Any quantity order volume accepted</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span>Delivery across India via transport</span>
            </div>
          </div>
        </div>

        {/* SECTION 1: Image-Only Wholesale Catalogue Items (if present) */}
        {catalogueItems.length > 0 && (
          <div className="mb-14 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-primary/10 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rotate-45 bg-accent" />
                <h2 className="text-lg sm:text-xl font-serif font-bold text-primary">
                  Image Catalogue
                </h2>
                <Badge variant="subtle" size="sm">
                  {catalogueItems.length} {catalogueItems.length === 1 ? 'item' : 'items'}
                </Badge>
              </div>
              <span className="text-xs text-muted">
                Each photo is a separate wholesale item • Fixed rate on enquiry
              </span>
            </div>

            <ImageCatalogueGrid items={catalogueItems} categoryName={category.name} />
          </div>
        )}

        {/* SECTION 2: Normal Products with Specifications (if present) */}
        {products.length > 0 && (
          <div className="space-y-4">
            {catalogueItems.length > 0 && (
              <div className="flex items-center justify-between pb-3 border-b-2 border-primary/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rotate-45 bg-primary" />
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary">
                    Products with Detailed Specifications
                  </h2>
                  <Badge variant="subtle" size="sm">
                    {products.length} {products.length === 1 ? 'product' : 'products'}
                  </Badge>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State when BOTH Image Items AND Normal Products are 0 */}
        {totalItemsCount === 0 && (
          <EmptyProductState categoryName={category.name} categorySlug={category.slug} />
        )}
      </Container>
    </div>
  );
}
