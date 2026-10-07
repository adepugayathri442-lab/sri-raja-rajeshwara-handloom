import React from 'react';
import type { Metadata } from 'next';
import { Package, MessageCircle, ArrowLeft } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { getProductBySlug } from '@/lib/supabase/catalog';
import { ProductDetailView } from '@/components/products/ProductDetailView';
import { getGeneralEnquiryUrl } from '@/lib/whatsapp';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Wholesale Product | Sri Raja Rajeshwara Handloom',
      description: 'Authentic Indian handloom wholesale textiles at transparent fixed piece rates.',
    };
  }

  const hasValidPrice = product.pricePerPiece !== null && product.pricePerPiece !== undefined && product.pricePerPiece > 0 && product.priceVisible !== false;
  const title = hasValidPrice
    ? `${product.name} (₹${product.pricePerPiece}/pc) | Sri Raja Rajeshwara Handloom`
    : `${product.name} | Sri Raja Rajeshwara Handloom`;
  const description =
    product.description ||
    (hasValidPrice
      ? `Authentic wholesale ${product.name} available at fixed piece rate of ₹${product.pricePerPiece}. Pan-India transport dispatch.`
      : `Authentic wholesale ${product.name}. Wholesale pricing available on enquiry. Pan-India transport dispatch.`);

  return {
    title,
    description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  // If product does not exist (e.g. database has 0 products or invalid slug)
  if (!product) {
    const whatsappHref = getGeneralEnquiryUrl(
      `Inquiring about product availability for item reference: ${slug}.`
    );

    return (
      <div className="py-16 sm:py-24 bg-cream/40 min-h-screen">
        <Container size="md">
          <Card variant="default" className="p-8 sm:p-14 text-center border-border shadow-xs">
            <div className="w-16 h-16 rounded-full bg-primary-subtle text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Package className="w-8 h-8 text-primary" />
            </div>

            <div className="inline-flex items-center gap-1.5 mb-3">
              <Badge variant="accent" size="sm">
                Wholesale Catalogue
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
              Product Item Under Preparation
            </h1>

            <p className="mt-2 text-sm text-charcoal font-medium">
              This product entry is not currently listed in our live database.
            </p>

            <p className="mt-2 text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
              We are actively cataloging inventory across all 12 wholesale categories with verified piece rates. For immediate stock availability or custom bale inquiries, connect with our sales team.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Button
                href="/products"
                variant="primary"
                size="md"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Return to Catalogue
              </Button>

              <Button
                href={whatsappHref}
                isExternal
                variant="whatsapp"
                size="md"
                leftIcon={<MessageCircle className="w-4 h-4 fill-current" />}
              >
                Inquire on WhatsApp
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16 bg-cream/30 min-h-screen">
      <Container size="xl">
        <ProductDetailView product={product} />
      </Container>
    </div>
  );
}
