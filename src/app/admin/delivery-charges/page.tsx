import React from 'react';
import type { Metadata } from 'next';
import { AdminDeliveryChargesView } from '@/components/admin/AdminDeliveryChargesView';

export const metadata: Metadata = {
  title: 'Delivery Charges & Freight Tariffs | Admin Portal',
  description: 'Manage pan-India freight tariffs, regional transport rates, and wholesale parcel rules.',
};

export default function AdminDeliveryChargesPage() {
  return <AdminDeliveryChargesView />;
}

