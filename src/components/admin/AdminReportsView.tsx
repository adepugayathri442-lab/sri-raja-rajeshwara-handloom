'use client';

/**
 * Admin Reports & Sales Analytics Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Real-time calculations from Supabase orders, items, and inventory
 * - Strictly excludes Cancelled orders from revenue
 * - Date range filters: Today, Last 7 Days, This Month, Last Month, Custom
 * - KPI summary cards: Total Sales, Orders, AOV, Paid, Pending, Cancelled, Customers
 * - Responsive daily sales & order volume visualizer
 * - Best-selling wholesale products ranking
 * - Category demand turnover breakdown
 * - Godown inventory valuation & piece counts
 * - Top wholesale trade buyers ranking
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Boxes,
  Users,
  Calendar,
  RefreshCw,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  getAdminReportData,
  type ReportDateRange,
  type AdminReportData,
} from '@/lib/supabase/admin-reports';
import { AdminExportButton } from './AdminExportButton';
import { exportReportsDataset } from '@/lib/export/export-utils';

export function AdminReportsView() {
  const [range, setRange] = useState<ReportDateRange>('this-month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [data, setData] = useState<AdminReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminReportData(range, customStart, customEnd);
      setData(res);
    } catch (err) {
      console.error('Failed to load reports data:', err);
      setError('Could not generate wholesale sales reports.');
    } finally {
      setIsLoading(false);
    }
  }, [range, customStart, customEnd]);

  useEffect(() => {
    let ignore = false;
    getAdminReportData(range, customStart, customEnd)
      .then((res) => {
        if (!ignore) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load reports data:', err);
          setError('Could not generate wholesale sales reports.');
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [range, customStart, customEnd]);

  const maxDailySales = data?.trend && data.trend.length > 0
    ? Math.max(...data.trend.map((t) => t.sales), 1)
    : 1;

  const totalCatRevenue = data?.categoryPerformance
    ? data.categoryPerformance.reduce((acc, c) => acc + c.revenue, 0)
    : 0;

  const handleExport = (format: 'csv' | 'excel') => {
    if (!data) return;
    const periodLabel = range === 'custom'
      ? `${customStart || 'Start'} to ${customEnd || 'End'}`
      : range.replace('-', ' ').toUpperCase();

    exportReportsDataset(
      {
        periodLabel,
        trend: data.trend,
        productPerformance: data.productPerformance,
        categoryPerformance: data.categoryPerformance,
      },
      format
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted mb-1">
            <Link href="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <span className="text-primary font-medium">Reports</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            Wholesale Sales & Dispatch Reports
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Turnover analytics, product demand, category distribution, and warehouse valuation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AdminExportButton
            onExport={handleExport}
            disabled={!data || isLoading}
            label="Export"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Date Filter Toolbar */}
      <Card variant="default" className="p-4 sm:p-5 border-border bg-surface shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-charcoal mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              <span>Reporting Period:</span>
            </span>

            <button
              type="button"
              onClick={() => setRange('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                range === 'today'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-subtle text-muted hover:text-charcoal hover:bg-surface-border'
              }`}
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => setRange('last-7-days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                range === 'last-7-days'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-subtle text-muted hover:text-charcoal hover:bg-surface-border'
              }`}
            >
              Last 7 Days
            </button>

            <button
              type="button"
              onClick={() => setRange('this-month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                range === 'this-month'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-subtle text-muted hover:text-charcoal hover:bg-surface-border'
              }`}
            >
              This Month
            </button>

            <button
              type="button"
              onClick={() => setRange('last-month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                range === 'last-month'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-subtle text-muted hover:text-charcoal hover:bg-surface-border'
              }`}
            >
              Last Month
            </button>

            <button
              type="button"
              onClick={() => setRange('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                range === 'custom'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-subtle text-muted hover:text-charcoal hover:bg-surface-border'
              }`}
            >
              Custom Range
            </button>
          </div>

          <span className="text-[11px] text-muted">
            Strictly excludes cancelled orders
          </span>
        </div>

        {/* Custom Range Picker */}
        {range === 'custom' && (
          <div className="pt-3 border-t border-border flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted">From:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1.5 bg-surface-subtle border border-border rounded text-charcoal outline-none focus:border-accent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted">To:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1.5 bg-surface-subtle border border-border rounded text-charcoal outline-none focus:border-accent"
              />
            </div>
            <Button variant="primary" size="sm" onClick={loadData}>
              Apply Custom Range
            </Button>
          </div>
        )}
      </Card>

      {/* Loading & Error States */}
      {isLoading ? (
        <Card variant="default" className="p-16 text-center border-border">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-charcoal">Aggregating wholesale sales records...</p>
        </Card>
      ) : error || !data ? (
        <Card variant="default" className="p-8 text-center border-rose-200 bg-rose-50/40">
          <p className="text-xs text-rose-700">{error || 'Unable to load report.'}</p>
          <Button variant="outline" size="sm" onClick={loadData} className="mt-3">
            Retry
          </Button>
        </Card>
      ) : (
        <>
          {/* Main Financial KPIs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Total Sales */}
            <Card variant="default" className="p-4 bg-cream/70 border-accent/40 col-span-2 sm:col-span-1">
              <span className="text-xs font-bold text-accent uppercase tracking-wider block">
                Total Revenue
              </span>
              <div className="text-2xl font-serif font-bold text-primary mt-1">
                ₹{data.kpis.totalSales.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-muted">Excludes cancelled</span>
            </Card>

            {/* Orders Count */}
            <Card variant="default" className="p-4 bg-surface border-border">
              <span className="text-xs text-muted font-medium block">Confirmed Orders</span>
              <div className="text-2xl font-serif font-bold text-primary mt-1">
                {data.kpis.orderCount}
              </div>
              <span className="text-[10px] text-muted">Fulfilled & active dispatches</span>
            </Card>

            {/* Average Order Value */}
            <Card variant="default" className="p-4 bg-surface border-border">
              <span className="text-xs text-muted font-medium block">Average Order Value</span>
              <div className="text-2xl font-serif font-bold text-primary mt-1">
                ₹{data.kpis.averageOrderValue.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-muted">Per wholesale parcel</span>
            </Card>

            {/* Paid Amount */}
            <Card variant="default" className="p-4 bg-emerald-50/50 border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block">Settled Amount</span>
              <div className="text-2xl font-serif font-bold text-emerald-800 mt-1">
                ₹{data.kpis.paidAmount.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-700">Payment received</span>
            </Card>

            {/* Pending Amount */}
            <Card variant="default" className="p-4 bg-amber-50/50 border-amber-200">
              <span className="text-xs text-amber-800 font-semibold block">Pending Invoices</span>
              <div className="text-2xl font-serif font-bold text-amber-800 mt-1">
                ₹{data.kpis.pendingAmount.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-amber-700">Awaiting payment</span>
            </Card>

            {/* Cancelled Orders */}
            <Card variant="default" className="p-4 bg-surface border-border">
              <span className="text-xs text-rose-700 font-medium block">Cancelled Orders</span>
              <div className="text-2xl font-serif font-bold text-rose-700 mt-1">
                {data.kpis.cancelledCount}
              </div>
              <span className="text-[10px] text-muted">Stock safely restored</span>
            </Card>
          </div>

          {/* Daily Sales Trend Visualizer */}
          <Card variant="default" className="p-5 sm:p-6 border-border bg-surface shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-serif font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span>Wholesale Turnover Trend</span>
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Daily turnover volume and orders placed across the selected period.
                </p>
              </div>

              {data.trend.length > 0 && (
                <span className="text-xs font-semibold text-primary">
                  {data.trend.length} active day{data.trend.length === 1 ? '' : 's'} recorded
                </span>
              )}
            </div>

            {data.trend.length === 0 ? (
              <div className="p-12 text-center text-muted text-xs border border-dashed border-border rounded-lg">
                No orders recorded in this reporting period.
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <div className="h-44 flex items-end gap-2 pt-6 pb-2 px-2 overflow-x-auto">
                  {data.trend.map((point) => {
                    const heightPercent = Math.max(12, Math.round((point.sales / maxDailySales) * 100));

                    return (
                      <div
                        key={point.date}
                        className="flex-1 min-w-[42px] flex flex-col items-center gap-1.5 group relative"
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                          <div>₹{point.sales.toLocaleString('en-IN')}</div>
                          <div className="text-accent">{point.orders} order(s)</div>
                        </div>

                        {/* Bar */}
                        <div className="w-full flex items-end justify-center h-32">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full max-w-[28px] bg-primary group-hover:bg-accent rounded-t transition-all shadow-xs"
                          />
                        </div>

                        {/* Date label */}
                        <span className="text-[10px] text-muted whitespace-nowrap">
                          {point.displayDate}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* 2-Column: Product Demand & Category Share */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card variant="default" className="p-5 sm:p-6 border-border bg-surface shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent" />
                  <h2 className="text-sm font-serif font-bold text-primary uppercase tracking-wider">
                    Best-Selling Wholesale Lines
                  </h2>
                </div>
                <span className="text-[11px] text-muted">Ranked by pieces sold</span>
              </div>

              {data.productPerformance.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted border border-dashed border-border rounded-lg">
                  No product sales recorded in this period.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted font-medium">
                        <th className="py-2 px-2">#</th>
                        <th className="py-2 px-3">Product Name</th>
                        <th className="py-2 px-3 text-right">Units</th>
                        <th className="py-2 px-3 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {data.productPerformance.map((p, idx) => (
                        <tr key={p.productId} className="hover:bg-cream/40">
                          <td className="py-2.5 px-2 font-bold text-muted text-[11px]">
                            #{idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-charcoal block truncate max-w-[220px]">
                              {p.name}
                            </span>
                            <span className="text-[10px] font-mono text-primary">
                              {p.productCode} • {p.categoryName}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-primary whitespace-nowrap">
                            {p.unitsSold} pcs
                          </td>
                          <td className="py-2.5 px-3 text-right font-serif font-bold text-charcoal whitespace-nowrap">
                            ₹{p.revenue.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Category Demand Breakdown */}
            <Card variant="default" className="p-5 sm:p-6 border-border bg-surface shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent" />
                  <h2 className="text-sm font-serif font-bold text-primary uppercase tracking-wider">
                    Category Turnover Breakdown
                  </h2>
                </div>
                <span className="text-[11px] text-muted">Demand distribution</span>
              </div>

              {data.categoryPerformance.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted border border-dashed border-border rounded-lg">
                  No category turnover recorded in this period.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {data.categoryPerformance.map((cat) => {
                    const sharePercent = totalCatRevenue > 0
                      ? Math.round((cat.revenue / totalCatRevenue) * 100)
                      : 0;

                    return (
                      <div key={cat.categoryName} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-charcoal">{cat.categoryName}</span>
                            <span className="text-[10px] text-muted ml-2">({cat.groupName})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-muted">{cat.unitsSold} pcs</span>
                            <strong className="font-serif text-primary">
                              ₹{cat.revenue.toLocaleString('en-IN')} ({sharePercent}%)
                            </strong>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden border border-border/50">
                          <div
                            style={{ width: `${Math.max(4, sharePercent)}%` }}
                            className="bg-primary h-full rounded-full transition-all"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* 2-Column: Top Trade Buyers & Inventory Valuation Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Buyers */}
            <Card variant="default" className="p-5 sm:p-6 border-border bg-surface shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" />
                  <h2 className="text-sm font-serif font-bold text-primary uppercase tracking-wider">
                    Top Trade Buyers in Period
                  </h2>
                </div>
                <span className="text-[11px] text-muted">By purchase volume</span>
              </div>

              {data.topCustomers.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted border border-dashed border-border rounded-lg">
                  No buyer transactions recorded in this period.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.topCustomers.map((c, idx) => (
                    <div
                      key={c.customerId}
                      className="p-3 bg-surface-subtle rounded-lg border border-border/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <Link
                            href={`/admin/customers/${c.customerId}`}
                            className="font-semibold text-charcoal hover:text-primary"
                          >
                            {c.name}
                          </Link>
                          {c.businessName && (
                            <span className="text-[11px] text-muted block">{c.businessName}</span>
                          )}
                          <span className="text-[10px] text-primary">{c.customerType}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-serif font-bold text-primary text-sm">
                          ₹{c.totalSpent.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-muted">
                          {c.orderCount} order{c.orderCount === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Warehouse Inventory Valuation Insights */}
            <Card variant="default" className="p-5 sm:p-6 border-border bg-surface shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-accent" />
                  <h2 className="text-sm font-serif font-bold text-primary uppercase tracking-wider">
                    Warehouse Inventory Valuation
                  </h2>
                </div>
                <span className="text-[11px] text-muted">Real-time balances</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div className="p-3 bg-cream/70 border border-accent/30 rounded-lg">
                  <span className="text-muted block text-[10px] uppercase font-semibold">
                    Total Inventory Valuation
                  </span>
                  <div className="text-xl font-serif font-bold text-primary mt-1">
                    ₹{data.inventory.totalInventoryValuation.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-muted">Based on fixed piece rates</span>
                </div>

                <div className="p-3 bg-surface-subtle border border-border rounded-lg">
                  <span className="text-muted block text-[10px] uppercase font-semibold">
                    Total Warehouse Pieces
                  </span>
                  <div className="text-xl font-serif font-bold text-primary mt-1">
                    {data.inventory.totalStockUnits.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-muted">Ready for dispatch</span>
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg">
                  <span className="text-emerald-800 block text-[10px] uppercase font-semibold">
                    Active Catalog Lines
                  </span>
                  <div className="text-xl font-serif font-bold text-emerald-800 mt-1">
                    {data.inventory.activeProducts}
                  </div>
                  <span className="text-[10px] text-emerald-700">of {data.inventory.totalProducts} total</span>
                </div>

                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                  <span className="text-amber-800 block text-[10px] uppercase font-semibold">
                    Low / Depleted Stock
                  </span>
                  <div className="text-xl font-serif font-bold text-amber-800 mt-1">
                    {data.inventory.lowStockProducts + data.inventory.outOfStockProducts}
                  </div>
                  <span className="text-[10px] text-amber-700">
                    {data.inventory.lowStockProducts} low, {data.inventory.outOfStockProducts} out of stock
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <Link
                  href="/admin/stock"
                  className="text-xs font-semibold text-primary hover:text-accent flex items-center gap-1"
                >
                  <span>Open Warehouse Stock Control</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
