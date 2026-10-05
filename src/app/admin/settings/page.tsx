import React from 'react';
import type { Metadata } from 'next';
import { AdminSettingsForm } from '@/components/admin/AdminSettingsForm';

export const metadata: Metadata = {
  title: 'Merchant Settings & Configuration | Admin Portal',
  description: 'Manage Sri Raja Rajeshwara Handloom commercial parameters, trade hotlines, and operational switches.',
};

export default function AdminSettingsPage() {
  return <AdminSettingsForm />;
}

