import React from 'react';
import type { Metadata } from 'next';
import { AdminPaymentsView } from '@/components/admin/AdminPaymentsView';

export const metadata: Metadata = {
  title: 'Payments Ledger & Settlements | Admin Portal',
  description: 'Track wholesale invoice settlements, verify bank NEFT/UPI transfers, and update billing statuses.',
};

export default function AdminPaymentsPage() {
  return <AdminPaymentsView />;
}

