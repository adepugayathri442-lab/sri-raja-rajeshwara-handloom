'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <main className="min-h-screen bg-cream">{children}</main>;
  }

  return (
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
  );
}
