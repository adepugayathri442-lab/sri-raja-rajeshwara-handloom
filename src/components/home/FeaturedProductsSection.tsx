import React from 'react';
import Link from 'next/link';
import { Package, ShieldCheck, ArrowRight, Layers, MessageCircle } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { getProducts, getCategories } from '@/lib/supabase/catalog';
import { ProductCard } from '@/components/products/ProductCard';
import { getGeneralEnquiryUrl } from '@/lib/whatsapp';

export async function FeaturedProductsSection() {
  const [categories, { products }] = await Promise.all([
    getCategories(),
    getProducts({ limit: 6 }),
  ]);

  const whatsappHref = getGeneralEnquiryUrl('Inquiring about immediate wholesale stock availability and dispatch.');

  return (
    <section className="py-16 sm:py-24 bg-cream/60 border-b border-border">
      <Container size="xl">
        <SectionHeading
          eyebrow="Commercial Textile Inventory"
          title="Direct Piece-Rate Products"
          subtitle="Fixed wholesale rates per piece across all 12 commercial textile categories. Every item features one transparent wholesale rate with no volume tier penalties."
        />

        {/* Category Filter Pills (All 12 Real Categories) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-4xl mx-auto">
          <Link
            href="/products"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary text-white shadow-2xs"
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface text-charcoal hover:bg-surface-border border border-border transition-colors hover:border-accent"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* If real products exist, display them */}
        {products.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button
                href="/products"
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View Complete Wholesale Catalogue
              </Button>
            </div>
          </div>
        ) : (
          /* Polished B2B Empty Product State when DB has 0 Products */
          <div className="bg-surface rounded-2xl border border-border p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-primary-subtle text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Package className="w-8 h-8 text-primary" />
            </div>

            <div className="inline-flex items-center gap-2 mb-3">
              <Badge variant="accent" size="sm">
                Wholesale Catalogue
              </Badge>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
              Wholesale Catalogue Coming Soon
            </h3>

            <p className="mt-2 text-sm sm:text-base text-charcoal font-medium">
              We are currently updating our wholesale catalogue.
            </p>

            <p className="mt-2 text-xs sm:text-sm text-muted max-w-xl mx-auto leading-relaxed">
              In accordance with our strict data integrity policy, we do not display artificial demo items. For product availability, rates, or bulk requirements, contact us directly on WhatsApp.
            </p>

            {/* Wholesale Business Model Guarantees */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-cream/70 rounded-lg border border-border/80">
                <div className="font-semibold text-xs text-primary flex items-center gap-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-[10px]">
                    ₹
                  </span>
                  <span>Single Fixed Rate</span>
                </div>
                <p className="text-xs text-muted">
                  Each product has one uniform wholesale rate per piece. No hidden markups or sliding bulk tiers.
                </p>
              </div>

              <div className="p-4 bg-cream/70 rounded-lg border border-border/80">
                <div className="font-semibold text-xs text-primary flex items-center gap-1.5 mb-1">
                  <Layers className="w-4 h-4 text-accent" />
                  <span>Any Order Quantity</span>
                </div>
                <p className="text-xs text-muted">
                  Order any quantity required for your retail cloth store or institution with zero minimum volume penalties.
                </p>
              </div>

              <div className="p-4 bg-cream/70 rounded-lg border border-border/80">
                <div className="font-semibold text-xs text-primary flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Verified Supply</span>
                </div>
                <p className="text-xs text-muted">
                  Direct mill & handloom merchant supply from Pusala Galli, Nizamabad with reliable parcel delivery across India.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Button
                href={whatsappHref}
                isExternal
                variant="whatsapp"
                size="md"
                leftIcon={<MessageCircle className="w-4 h-4 fill-current" />}
              >
                WhatsApp Wholesale Enquiry
              </Button>

              <Button
                href="/categories"
                variant="outline"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Browse 12 Wholesale Categories
              </Button>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
