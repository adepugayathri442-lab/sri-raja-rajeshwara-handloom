'use client';

/**
 * Admin Customer Management Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Live registered merchant customers from Supabase profiles
 * - Search by customer name, store name, phone, email
 * - Filter by customer type (Retail Shop, Reseller, Business, Institution, Bulk Buyer)
 * - Order count and historical purchase sum metrics
 * - Desktop table & responsive mobile cards
 * - Strict security: No password hashes or auth credentials ever exposed
 * - Empty state: "No customers yet"
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  X,
  RefreshCw,
  Eye,
  Store,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  getAdminCustomers,
  type AdminCustomerListItem,
} from '@/lib/supabase/admin-operations';
import type { CustomerType } from '@/types';
import { AdminExportButton } from './AdminExportButton';
import { exportCustomersDataset, type CustomerExportItem } from '@/lib/export/export-utils';

const CUSTOMER_TYPES: CustomerType[] = [
  'Retail Shop',
  'Reseller',
  'Business',
  'Institution',
  'Bulk Buyer',
  'Other',
];

export function AdminCustomerList() {
  const [customers, setCustomers] = useState<AdminCustomerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [customerType, setCustomerType] = useState<string>('all');

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminCustomers({
        search,
        customerType,
      });
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError('Unable to load customer directory from database.');
    } finally {
      setIsLoading(false);
    }
  }, [search, customerType]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadCustomers();
    }, 300);
    return () => clearTimeout(handler);
  }, [loadCustomers]);

  const clearFilters = () => {
    setSearch('');
    setCustomerType('all');
  };

  const handleExport = (format: 'csv' | 'excel') => {
    if (customers.length === 0) return;
    const exportData: CustomerExportItem[] = customers.map((c) => ({
      fullName: c.fullName,
      businessName: c.businessName,
      customerType: c.customerType,
      phone: c.phone,
      email: c.email,
      gstNumber: c.gstNumber,
      city: c.city,
      state: c.state,
      totalOrders: c.totalOrders,
      totalPurchaseAmount: c.totalPurchaseAmount,
      createdAt: c.createdAt,
    }));
    exportCustomersDataset(exportData, format);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted mb-1">
            <Link href="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <span className="text-primary font-medium">Customers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            Merchant Buyers Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Registered retail cloth shops, regional resellers, and wholesale accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AdminExportButton
            onExport={handleExport}
            disabled={customers.length === 0 || isLoading}
            label="Export"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={loadCustomers}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Customer Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" className="p-4 sm:p-5 border-border bg-surface shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted font-medium">Total Customers</span>
            <div className="w-8 h-8 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-primary">
            {customers.length}
          </div>
          <p className="text-[11px] text-muted mt-0.5">
            Registered wholesale merchants & buyers
          </p>
        </Card>

        <Card variant="default" className="p-4 sm:p-5 border-border bg-surface shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted font-medium">Active Ordering Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-800">
            {customers.filter((c) => c.totalOrders > 0).length}
          </div>
          <p className="text-[11px] text-muted mt-0.5">
            Merchants with confirmed wholesale orders
          </p>
        </Card>

        <Card variant="default" className="p-4 sm:p-5 border-border bg-surface shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted font-medium">Cumulative Purchases</span>
            <div className="w-8 h-8 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
              <span className="text-xs font-bold font-serif">₹</span>
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-primary">
            ₹{customers.reduce((sum, c) => sum + c.totalPurchaseAmount, 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-muted mt-0.5">
            Total lifetime B2B transactions
          </p>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card variant="default" className="p-4 sm:p-5 border-border bg-surface shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, store / business name, phone, email..."
              className="w-full pl-9 pr-9 py-2 bg-surface-subtle border border-border rounded-lg text-xs text-charcoal focus:border-accent focus:bg-surface outline-none transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Customer Type Filter */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <select
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
              aria-label="Filter by Customer Type"
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-xs text-charcoal font-medium focus:border-accent outline-none"
            >
              <option value="all">All Merchant Types</option>
              {CUSTOMER_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Active Filter Clear */}
          {(search || customerType !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
              Clear
            </Button>
          )}
        </div>

        {/* Count summary */}
        <div className="flex items-center justify-between text-[11px] text-muted pt-1">
          <span>
            Showing <strong className="text-primary">{customers.length}</strong> registered {customers.length === 1 ? 'merchant' : 'merchants'}
          </span>
        </div>
      </Card>

      {/* Content Area */}
      {isLoading ? (
        <Card variant="default" className="p-12 text-center border-border">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-muted">Retrieving customer directory from database...</p>
        </Card>
      ) : error ? (
        <Card variant="default" className="p-8 text-center border-rose-200 bg-rose-50/40">
          <p className="text-xs text-rose-700">{error}</p>
          <Button variant="outline" size="sm" onClick={loadCustomers} className="mt-3">
            Retry
          </Button>
        </Card>
      ) : customers.length === 0 ? (
        <Card variant="default" className="p-12 sm:p-16 text-center border-border">
          <div className="w-14 h-14 rounded-full bg-cream-100 text-muted flex items-center justify-center mx-auto mb-4 border border-border">
            <Users className="w-7 h-7 text-muted" />
          </div>
          <h2 className="text-xl font-serif font-bold text-primary">
            No customers yet
          </h2>
          <p className="text-xs text-muted max-w-md mx-auto mt-1 leading-relaxed">
            Registered B2B cloth merchants, garment shops, and retail buyers will appear here automatically upon creating an account.
          </p>
          {(search || customerType !== 'all') && (
            <div className="pt-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filter Parameters
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block bg-surface border border-border rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border text-muted font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Merchant Name</th>
                    <th className="py-3 px-4">Business / Shop</th>
                    <th className="py-3 px-4">Customer Type</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-center">Total Orders</th>
                    <th className="py-3 px-4 text-right">Total Purchases</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-charcoal">
                        <Link href={`/admin/customers/${c.id}`} className="hover:text-primary">
                          {c.fullName}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        {c.businessName ? (
                          <div className="font-medium text-primary flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span>{c.businessName}</span>
                          </div>
                        ) : (
                          <span className="text-muted italic">Individual / Not Specified</span>
                        )}
                        {c.gstNumber && (
                          <span className="text-[10px] text-muted block font-mono">
                            GST: {c.gstNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                          {c.customerType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-charcoal font-medium">{c.phone}</div>
                        <div className="text-[11px] text-muted truncate max-w-[160px]">{c.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-muted whitespace-nowrap">
                        {c.city ? `${c.city}, ${c.state || ''}` : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-charcoal">
                        {c.totalOrders}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-serif font-bold text-primary">
                        ₹{c.totalPurchaseAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-muted whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="px-3 py-1.5 bg-surface-subtle hover:bg-surface border border-border rounded text-xs font-semibold text-primary inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards Stack */}
          <div className="md:hidden space-y-3">
            {customers.map((c) => (
              <div
                key={c.id}
                className="bg-surface border border-border rounded-xl p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-charcoal">{c.fullName}</h3>
                    {c.businessName && (
                      <p className="text-xs font-medium text-primary flex items-center gap-1 mt-0.5">
                        <Store className="w-3 h-3 text-accent" />
                        <span>{c.businessName}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {c.customerType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/60">
                  <div className="flex items-center gap-1 text-muted">
                    <Phone className="w-3 h-3 text-muted shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted truncate">
                    <Mail className="w-3 h-3 text-muted shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  {c.city && (
                    <div className="flex items-center gap-1 text-muted col-span-2">
                      <MapPin className="w-3 h-3 text-muted shrink-0" />
                      <span>{c.city}, {c.state}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted block text-[10px]">Purchase History:</span>
                    <span className="font-semibold text-charcoal">{c.totalOrders} orders</span>
                    <span className="font-serif font-bold text-primary ml-1.5">
                      (₹{c.totalPurchaseAmount.toLocaleString('en-IN')})
                    </span>
                  </div>
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="px-3 py-1.5 bg-primary text-white hover:bg-primary-hover rounded text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
