import React from 'react';
import type { Metadata } from 'next';
import { AdminImageCatalogueView } from '@/components/admin/AdminImageCatalogueView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Image Catalogue Management | Admin Portal',
  description: 'Upload wholesale item photos directly by category with zero complex fields.',
};

export default function AdminImageCataloguePage() {
  return <AdminImageCatalogueView />;
}
