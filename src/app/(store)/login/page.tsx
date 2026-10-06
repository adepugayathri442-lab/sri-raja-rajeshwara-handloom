import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Card } from '@/components/common/Card';
import { LoginForm } from '@/components/forms/LoginForm';
import { Logo } from '@/components/common/Logo';
import { getGeneralEnquiryUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Merchant Login | Sri Raja Rajeshwara Handloom',
  description: 'Access your verified wholesale buyer account, order history, and transport bilti receipts.',
};

export default function LoginPage() {
  const whatsappHref = getGeneralEnquiryUrl('I need assistance logging into my wholesale merchant account.');

  return (
    <div className="py-12 sm:py-20 bg-cream/50 min-h-[80vh] flex items-center">
      <Container size="sm">
        <Card variant="default" className="p-8 sm:p-10 border-accent/20 bg-surface shadow-xs">
          <div className="text-center mb-6">
            <Logo variant="auth" className="mb-2" />
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-primary mt-2">
              Wholesale Merchant Sign In
            </h1>
            <p className="text-xs text-muted mt-1">
              Access your business profile, order records, and consignment tracking.
            </p>
          </div>

          <Suspense fallback={
            <div className="py-8 flex flex-col items-center justify-center text-xs text-muted">
              <Loader2 className="w-5 h-5 animate-spin text-primary mb-2" />
              <span>Loading merchant sign in...</span>
            </div>
          }>
            <LoginForm />
          </Suspense>

          <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
            <Link href="/register" className="text-primary hover:text-accent font-semibold transition-colors">
              Create Wholesale Account →
            </Link>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#075E54] hover:underline flex items-center gap-1 font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>Need help? WhatsApp Desk</span>
            </a>
          </div>
        </Card>
      </Container>
    </div>
  );
}
