import React from 'react';
import type { Metadata } from 'next';
import { AdminReportsView } from '@/components/admin/AdminReportsView';

export const metadata: Metadata = {
  title: 'Reports & Sales Analytics | Admin Portal',
  description: 'Analyze wholesale piece volume turnover, category demand, regional sales distribution, and customer metrics.',
};

export default function AdminReportsPage() {
  return <AdminReportsView />;
}

