import React from 'react';
import type { Metadata } from 'next';
import { AdminCategoryList } from '@/components/admin/AdminCategoryList';

export const metadata: Metadata = {
  title: 'Categories Management | Admin Portal',
  description: 'Manage wholesale textile categories, sort sequences, and catalogue availability.',
};

export default function AdminCategoriesPage() {
  return <AdminCategoryList />;
}

