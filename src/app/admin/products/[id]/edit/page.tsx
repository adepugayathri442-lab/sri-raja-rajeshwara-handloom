import React from 'react';
import type { Metadata } from 'next';
import { Package, ArrowLeft } from 'lucide-react';
import { getCategories } from '@/lib/supabase/catalog';
import { getAdminProductById } from '@/lib/supabase/admin-catalog';
import { ProductForm } from '@/components/admin/ProductForm';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getAdminProductById(id);

  return {
    title: product
      ? `Edit: ${product.name} | Admin Portal`
      : 'Edit Product | Admin Portal',
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getCategories(),
  ]);

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card variant="default" className="p-8 text-center border-border bg-surface space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-primary">
            Product Not Found
          </h2>
          <p className="text-xs text-muted">
            The requested wholesale product could not be located in the database. It may have been deleted or archived.
          </p>
          <div className="pt-2">
            <Button
              href="/admin/products"
              variant="primary"
              size="md"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to Products List
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <ProductForm categories={categories} initialData={product} isEdit={true} />;
}
