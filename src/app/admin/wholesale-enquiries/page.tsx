import React from 'react';
import type { Metadata } from 'next';
import { AdminEnquiriesView } from '@/components/admin/AdminEnquiriesView';

export const metadata: Metadata = {
  title: 'Wholesale Enquiries & Leads | Admin Portal',
  description: 'Manage bulk buyer inquiries, track quote requests, and coordinate cloth trade dispatches.',
};

export default function AdminWholesaleEnquiriesPage() {
  return <AdminEnquiriesView />;
}
