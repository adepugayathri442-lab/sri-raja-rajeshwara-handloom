'use client';

/**
 * Admin Wholesale Enquiries Management Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Live enquiries from `public.wholesale_enquiries` table
 * - Search by customer name, store name, phone, email, city
 * - Filter by status (New, Contacted, Quoted, Converted, Closed)
 * - Real-time status update dropdown
 * - Direct WhatsApp reply button for owner
 * - Desktop table & responsive mobile cards
 * - Data safety: No deletion capability (enquiries are strictly preserved)
 * - Empty state: "No wholesale enquiries yet"
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  X,
  RefreshCw,
  Phone,
  MapPin,
  MessageCircle,
  Building,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  getAdminEnquiries,
  updateEnquiryStatus,
} from '@/lib/supabase/admin-operations';
import type { WholesaleEnquiryRow } from '@/types';

const ENQUIRY_STATUSES = ['New', 'Contacted', 'Quoted', 'Converted', 'Closed'];

export function AdminEnquiriesView() {
  const [enquiries, setEnquiries] = useState<WholesaleEnquiryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadEnquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminEnquiries({
        search,
        status: statusFilter,
      });
      setEnquiries(data);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
      setError('Unable to load wholesale leads from database.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadEnquiries();
    }, 300);
    return () => clearTimeout(handler);
  }, [loadEnquiries]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await updateEnquiryStatus(id, newStatus);
      if (res.success) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
        );
      } else {
        alert(res.error || 'Failed to update enquiry status');
      }
    } catch (err) {
      console.error('Failed to update enquiry status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
  };

  const getWhatsAppReplyLink = (e: WholesaleEnquiryRow) => {
    const cleanPhone = e.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(
      `Namaskaram ${e.name} garu,\nThank you for reaching out to Sri Raja Rajeshwara Handloom regarding wholesale supply for ${e.business_name}.\nIn reference to your enquiry for ${e.products_interested} (${e.approximate_quantity || 'bulk quantity'}):\nHow can we assist you with our latest wholesale rates and transport arrangements today?`
    );
    return `https://wa.me/${phoneWithCountry}?text=${text}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted mb-1">
            <Link href="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <span className="text-primary font-medium">Wholesale Enquiries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            Wholesale Leads & Enquiries
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Manage bulk buyer inquiries, quote requests, and store lead conversions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadEnquiries}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card variant="default" className="p-4 sm:p-5 border-border bg-surface shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, store name, phone, city, products..."
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

          {/* Status Filter */}
          <div className="flex items-center gap-2 min-w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Lead Status"
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-xs text-charcoal font-medium focus:border-accent outline-none"
            >
              <option value="all">All Lead Statuses</option>
              {ENQUIRY_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {(search || statusFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
              Clear
            </Button>
          )}
        </div>

        <div className="text-[11px] text-muted pt-1">
          Showing <strong className="text-primary">{enquiries.length}</strong> {enquiries.length === 1 ? 'enquiry' : 'enquiries'}
        </div>
      </Card>

      {/* Enquiries Content */}
      {isLoading ? (
        <Card variant="default" className="p-12 text-center border-border">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-muted">Loading wholesale inquiries from database...</p>
        </Card>
      ) : error ? (
        <Card variant="default" className="p-8 text-center border-rose-200 bg-rose-50/40">
          <p className="text-xs text-rose-700">{error}</p>
          <Button variant="outline" size="sm" onClick={loadEnquiries} className="mt-3">
            Retry
          </Button>
        </Card>
      ) : enquiries.length === 0 ? (
        <Card variant="default" className="p-12 sm:p-16 text-center border-border">
          <div className="w-14 h-14 rounded-full bg-cream-100 text-muted flex items-center justify-center mx-auto mb-4 border border-border">
            <MessageSquare className="w-7 h-7 text-muted" />
          </div>
          <h2 className="text-xl font-serif font-bold text-primary">
            No wholesale enquiries yet
          </h2>
          <p className="text-xs text-muted max-w-md mx-auto mt-1 leading-relaxed">
            When prospective retail shops and bulk buyers submit requests through the storefront wholesale enquiry form, their details and messages will be catalogued here.
          </p>
          {(search || statusFilter !== 'all') && (
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
                    <th className="py-3 px-4">Customer & Business</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Products Requested</th>
                    <th className="py-3 px-4">Est. Quantity</th>
                    <th className="py-3 px-4">Message / Notes</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Reply</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {enquiries.map((e) => (
                    <tr key={e.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-charcoal">{e.name}</div>
                        <div className="text-[11px] font-medium text-primary flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-accent shrink-0" />
                          <span>{e.business_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-charcoal">{e.phone}</div>
                        {e.email && (
                          <div className="text-[10px] text-muted truncate max-w-[130px]">{e.email}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-muted">
                        {e.city}, {e.state}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-primary block">
                          {e.products_interested}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-charcoal font-semibold">
                        {e.approximate_quantity || '—'}
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="text-[11px] text-charcoal/80 line-clamp-2 leading-relaxed">
                          {e.message}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-muted">
                        {new Date(e.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={e.status}
                          disabled={updatingId === e.id}
                          onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                          aria-label={`Update status for ${e.business_name}`}
                          className={`px-2 py-1 rounded text-[11px] font-semibold border outline-none ${
                            e.status === 'Converted'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : e.status === 'Quoted'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : e.status === 'Contacted'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : e.status === 'Closed'
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : 'bg-primary/10 text-primary border-primary/20'
                          }`}
                        >
                          {ENQUIRY_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <a
                          href={getWhatsAppReplyLink(e)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards Stack */}
          <div className="md:hidden space-y-3">
            {enquiries.map((e) => (
              <div
                key={e.id}
                className="bg-surface border border-border rounded-xl p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-charcoal">{e.name}</h3>
                    <p className="text-xs font-medium text-primary flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3 text-accent" />
                      <span>{e.business_name}</span>
                    </p>
                  </div>
                  <select
                    value={e.status}
                    disabled={updatingId === e.id}
                    onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                    aria-label={`Update status for ${e.business_name}`}
                    className="px-2 py-1 bg-surface-subtle border border-border rounded text-[11px] font-semibold"
                  >
                    {ENQUIRY_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="text-xs space-y-1 text-muted border-t border-border/60 pt-2">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-muted shrink-0" />
                    <span>{e.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-muted shrink-0" />
                    <span>{e.city}, {e.state}</span>
                  </div>
                  <div className="pt-1">
                    <strong className="text-primary block text-[11px]">Requested: {e.products_interested}</strong>
                    {e.approximate_quantity && (
                      <span className="text-[10px] text-muted">Est. Volume: {e.approximate_quantity}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-charcoal bg-surface-subtle p-2 rounded mt-1.5 leading-relaxed">
                    &ldquo;{e.message}&rdquo;
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-muted">
                    {new Date(e.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <a
                    href={getWhatsAppReplyLink(e)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Reply via WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
