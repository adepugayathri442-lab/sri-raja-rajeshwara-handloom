import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Card } from '@/components/common/Card';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { Logo } from '@/components/common/Logo';

export const metadata: Metadata = {
  title: 'Merchant Registration | Sri Raja Rajeshwara Handloom',
  description: 'Register your retail store, resale business, or institution for wholesale pricing and direct loom dispatch across India.',
};

export default function RegisterPage() {
  return (
    <div className="py-12 sm:py-20 bg-cream/50 min-h-[80vh] flex items-center">
      <Container size="md">
        <Card variant="default" className="p-8 sm:p-10 border-accent/20 bg-surface shadow-xs max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <Logo variant="auth" className="mb-2" />
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-primary mt-2">
              Create Your Wholesale Account
            </h1>
            <p className="text-xs text-muted mt-1 max-w-md mx-auto">
              Exclusively for retail cloth stores, apparel resellers, institutional buyers, and bulk purchasers.
            </p>
          </div>

          <Suspense fallback={
            <div className="py-8 flex flex-col items-center justify-center text-xs text-muted">
              <Loader2 className="w-5 h-5 animate-spin text-primary mb-2" />
              <span>Loading registration form...</span>
            </div>
          }>
            <RegisterForm />
          </Suspense>

          <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-xs text-muted">
            <Link href="/login" className="text-primary hover:text-accent font-semibold transition-colors">
              Already have an account? Sign In →
            </Link>
            <Link href="/wholesale-enquiry" className="text-accent hover:underline font-medium">
              Or submit quick bulk enquiry
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  );
}
