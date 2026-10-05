import React from 'react';
import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminGuard } from '@/components/auth/AdminGuard';

export const metadata: Metadata = {
  title: 'Merchant Admin Portal | Sri Raja Rajeshwara Handloom',
  description: 'Wholesale B2B management dashboard for products, stock, orders, and delivery charges.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-cream print:bg-white print:block">
        {/* Admin Sidebar Navigation */}
        <div className="print:hidden">
          <AdminSidebar />
        </div>

        {/* Main Admin Content Canvas */}
        <div className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0 print:pt-0 print:block">
          <div className="print:hidden">
            <AdminHeader />
          </div>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto print:p-0 print:m-0 print:overflow-visible">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
