'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Database, LogOut } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/lib/auth/auth-context';

export function AdminHeader() {
  const { user, profile, logout, isConfigured } = useAuth();

  return (
    <header className="hidden lg:flex h-16 bg-surface border-b border-border px-6 items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          Merchant Administration
        </span>
        <span className="text-muted text-xs">•</span>
        <Badge variant={isConfigured ? 'success' : 'warning'} size="sm">
          <Database className="w-3 h-3 mr-1" />
          {isConfigured ? 'Supabase Connected' : 'Supabase Setup Pending'}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-muted hover:text-primary transition-colors"
        >
          <span>View Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
            {profile?.fullName ? profile.fullName[0].toUpperCase() : 'A'}
          </div>
          <span className="font-medium text-charcoal hidden sm:inline">
            {profile?.fullName || user?.email || 'Admin'}
          </span>
          {user && (
            <button
              onClick={() => logout()}
              title="Sign Out of Admin"
              className="p-1 text-muted hover:text-red-700 transition-colors ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
