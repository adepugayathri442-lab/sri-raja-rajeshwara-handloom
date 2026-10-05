import React from 'react';
import type { Metadata } from 'next';
import { AccountPlaceholder } from '@/components/account/AccountPlaceholder';

export const metadata: Metadata = {
  title: 'Merchant Account | Sri Raja Rajeshwara Handloom',
  description: 'Manage verified business profile, delivery points, and wholesale trade records.',
};

export default function AccountPage() {
  return <AccountPlaceholder />;
}
