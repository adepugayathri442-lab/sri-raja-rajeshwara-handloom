import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';

export const metadata: Metadata = {
  title: 'Administrator Sign In | Merchant Portal',
  description: 'Secure sign in for Sri Raja Rajeshwara Handloom wholesale administrators.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center text-xs text-muted">Loading sign in portal...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
