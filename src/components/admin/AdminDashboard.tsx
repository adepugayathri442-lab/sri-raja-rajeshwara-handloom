'use client';

/**
 * Admin Dashboard - Wholesale Merchant Owner Command Center
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Real-time Supabase operational KPIs: Customers, Products, Stock, Order Volume
 * - Financial Sales Overview: Today's sales, this week, this month, and total sales
 * - Order Pipeline by Status (Pending, Confirmed, Processing, Packed, Shipped, Delivered, Cancelled)
 * - Recent Orders table with direct links to /admin/orders/[id]
 * - 100% Wholesale B2B focus with zero fake statistics
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Boxes,
  AlertTriangle,
  PlusCircle,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  Users,
  CreditCard,
  Clock,
  MessageSquareQuote,
  Eye,
  FolderTree,
  Truck,
  BarChart3,
  Settings,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  getAdminOperationsStats,
  type AdminOperationsStats,
} from '@/lib/supabase/admin-operations';

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminOperationsStats>({
    totalCustomers: 0,
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    packedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    todayOrdersCount: 0,
    todaySales: 0,
    thisWeekSales: 0,
    thisMonthSales: 0,
    totalSales: 0,
    recentOrders: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshStats = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminOperationsStats();
      setStats(res);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getAdminOperationsStats().then((res) => {
      if (isMounted) {
        setStats(res);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <Badge variant="primary" size="sm">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Owner Control Center
            </Badge>
            <span className="text-xs text-muted">Real-Time Wholesale Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            Storefront Command Center
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Sri Raja Rajeshwara Handloom • Wholesale Cloth Merchant • Pusala Galli, Nizamabad
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={refreshStats}
            title="Refresh Statistics"
            className="p-2.5 text-muted hover:text-charcoal bg-surface border border-border rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Button
            href="/admin/orders"
            variant="primary"
            size="md"
            leftIcon={<ShoppingBag className="w-4 h-4" />}
          >
            Manage Orders
          </Button>

          <Button
            href="/admin/products/new"
            variant="outline"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add Product
          </Button>

          <Button
            href="/"
            isExternal
            variant="ghost"
            size="md"
            rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Storefront
          </Button>
        </div>
      </div>

      {/* Financial Sales Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-serif font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <CreditCard className="w-4 h-4 text-accent" />
            <span>Wholesale Sales & Revenue (Verified Orders)</span>
          </h2>
          <span className="text-[11px] text-muted">Excludes cancelled orders</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today's Sales */}
          <Card variant="default" className="p-4 sm:p-5 bg-surface border-border">
            <span className="text-xs text-muted font-medium block">Today&rsquo;s Sales</span>
            <div className="text-2xl font-serif font-bold text-primary mt-1">
              ₹{stats.todaySales.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-muted mt-1 flex items-center justify-between">
              <span>{stats.todayOrdersCount} order{stats.todayOrdersCount === 1 ? '' : 's'} today</span>
              <span className="text-emerald-700 font-semibold">Today</span>
            </div>
          </Card>

          {/* This Week's Sales */}
          <Card variant="default" className="p-4 sm:p-5 bg-surface border-border">
            <span className="text-xs text-muted font-medium block">This Week&rsquo;s Sales</span>
            <div className="text-2xl font-serif font-bold text-primary mt-1">
              ₹{stats.thisWeekSales.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-muted mt-1 flex items-center justify-between">
              <span>Past 7 days volume</span>
              <span className="text-primary font-medium">This Week</span>
            </div>
          </Card>

          {/* This Month's Sales */}
          <Card variant="default" className="p-4 sm:p-5 bg-surface border-border">
            <span className="text-xs text-muted font-medium block">This Month&rsquo;s Sales</span>
            <div className="text-2xl font-serif font-bold text-primary mt-1">
              ₹{stats.thisMonthSales.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-muted mt-1 flex items-center justify-between">
              <span>Current billing cycle</span>
              <span className="text-primary font-medium">This Month</span>
            </div>
          </Card>

          {/* Total Sales */}
          <Card variant="default" className="p-4 sm:p-5 bg-cream/70 border-accent/40">
            <span className="text-xs text-accent font-bold uppercase tracking-wider block">
              Total All-Time Sales
            </span>
            <div className="text-2xl font-serif font-bold text-primary mt-1">
              ₹{stats.totalSales.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-muted mt-1 flex items-center justify-between">
              <span>{stats.totalOrders} total order{stats.totalOrders === 1 ? '' : 's'}</span>
              <span className="text-accent font-bold">All-Time</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Core Operational KPIs: Customers, Products, Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <Link href="/admin/customers" className="block group">
          <Card variant="default" className="p-4 sm:p-5 bg-surface border-border group-hover:border-accent/60 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted font-medium">Total Customers</span>
              <div className="w-8 h-8 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-bold text-primary">
              {stats.totalCustomers}
            </div>
            <div className="text-[11px] text-muted mt-1">Registered cloth merchants & buyers</div>
          </Card>
        </Link>

        {/* Total Products */}
        <Link href="/admin/products" className="block group">
          <Card variant="default" className="p-4 sm:p-5 bg-surface border-border group-hover:border-accent/60 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted font-medium">Catalog Products</span>
              <div className="w-8 h-8 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-bold text-primary">
              {stats.totalProducts}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              {stats.activeProducts} active on public catalogue
            </div>
          </Card>
        </Link>

        {/* Low Stock Products */}
        <Link href="/admin/stock" className="block group">
          <Card variant="default" className="p-4 sm:p-5 bg-surface border-border group-hover:border-accent/60 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted font-medium">Low Stock Products</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-2xl font-serif font-bold ${stats.lowStockProducts > 0 ? 'text-amber-700' : 'text-primary'}`}>
              {stats.lowStockProducts}
            </div>
            <div className="text-[11px] text-muted mt-1">
              {stats.lowStockProducts > 0 ? '≤ 10 pieces remaining' : 'Sufficient stock across lines'}
            </div>
          </Card>
        </Link>

        {/* Out of Stock Products */}
        <Link href="/admin/stock" className="block group">
          <Card variant="default" className="p-4 sm:p-5 bg-surface border-border group-hover:border-accent/60 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted font-medium">Out of Stock</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-2xl font-serif font-bold ${stats.outOfStockProducts > 0 ? 'text-rose-700' : 'text-primary'}`}>
              {stats.outOfStockProducts}
            </div>
            <div className="text-[11px] text-muted mt-1">
              {stats.outOfStockProducts > 0 ? 'Loom replenishment needed' : 'Zero depleted items'}
            </div>
          </Card>
        </Link>
      </div>

      {/* Order Status Pipeline Breakdown */}
      <div className="bg-surface border border-border rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-serif font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Clock className="w-4 h-4 text-accent" />
            <span>Order Fulfillment Pipeline ({stats.totalOrders} Total Orders)</span>
          </h2>
          <Link href="/admin/orders" className="text-xs text-primary hover:text-accent font-semibold flex items-center gap-1">
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
          {/* Order Placed */}
          <Link href="/admin/orders?status=Order+Placed" className="p-3 bg-surface-subtle hover:bg-amber-50/60 rounded-lg border border-border text-center transition-colors">
            <span className="text-[10px] text-muted font-semibold block uppercase">Order Placed</span>
            <span className="text-lg font-bold text-amber-800">{stats.pendingOrders}</span>
          </Link>

          {/* Confirmed */}
          <Link href="/admin/orders?status=Confirmed" className="p-3 bg-surface-subtle hover:bg-blue-50/60 rounded-lg border border-border text-center transition-colors">
            <span className="text-[10px] text-muted font-semibold block uppercase">Confirmed</span>
            <span className="text-lg font-bold text-blue-800">{stats.confirmedOrders}</span>
          </Link>

          {/* Processing */}
          <Link href="/admin/orders?status=Processing" className="p-3 bg-surface-subtle hover:bg-indigo-50/60 rounded-lg border border-border text-center transition-colors">
            <span className="text-[10px] text-muted font-semibold block uppercase">Processing</span>
            <span className="text-lg font-bold text-indigo-800">{stats.processingOrders}</span>
          </Link>

          {/* Packed */}
          <Link href="/admin/orders?status=Packed" className="p-3 bg-surface-subtle hover:bg-purple-50/60 rounded-lg border border-border text-center transition-colors">
            <span className="text-[10px] text-muted font-semibold block uppercase">Packed</span>
            <span className="text-lg font-bold text-purple-800">{stats.packedOrders}</span>
          </Link>

          {/* Shipped */}
          <Link href="/admin/orders?status=Shipped" className="p-3 bg-surface-subtle hover:bg-emerald-50/60 rounded-lg border border-border text-center transition-colors">
            <span className="text-[10px] text-muted font-semibold block uppercase">Shipped</span>
            <span className="text-lg font-bold text-emerald-800">{stats.shippedOrders}</span>
          </Link>

          {/* Delivered */}
          <Link href="/admin/orders?status=Delivered" className="p-3 bg-surface-subtle hover:bg-teal-50/60 rounded-lg border border-border text-center transition-colors">
            <span className="text-[10px] text-muted font-semibold block uppercase">Delivered</span>
            <span className="text-lg font-bold text-teal-800">{stats.deliveredOrders}</span>
          </Link>

          {/* Cancelled */}
          <Link href="/admin/orders?status=Cancelled" className="p-3 bg-surface-subtle hover:bg-rose-50/60 rounded-lg border border-border text-center transition-colors">
            <span className="text-[10px] text-muted font-semibold block uppercase">Cancelled</span>
            <span className="text-lg font-bold text-rose-800">{stats.cancelledOrders}</span>
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-primary flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-accent" />
              <span>Recent Wholesale Orders</span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Live customer transactions and dispatch consignments from Supabase.
            </p>
          </div>

          <Button href="/admin/orders" variant="outline" size="sm">
            View All Orders ({stats.totalOrders})
          </Button>
        </div>

        {isLoading ? (
          <div className="bg-surface border border-border rounded-xl p-8 space-y-3 animate-pulse">
            <div className="h-5 bg-surface-subtle rounded w-1/4" />
            <div className="h-12 bg-surface-subtle rounded" />
            <div className="h-12 bg-surface-subtle rounded" />
          </div>
        ) : stats.recentOrders.length === 0 ? (
          <Card variant="default" className="p-10 text-center border-border bg-surface">
            <div className="w-12 h-12 rounded-full bg-surface-subtle text-muted flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-primary">No Orders Yet</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              When bulk buyers place wholesale orders through the storefront or WhatsApp confirmation, they will appear here with live dispatch tracking.
            </p>
          </Card>
        ) : (
          <div className="bg-surface border border-border rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border text-muted font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Business / Shop</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Grand Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Order Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {stats.recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        <Link href={`/admin/orders/${o.id}`} className="hover:text-accent">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-medium text-charcoal">
                        {o.customerName}
                      </td>
                      <td className="py-3 px-4 text-muted">
                        {o.businessName || '—'}
                      </td>
                      <td className="py-3 px-4 text-muted whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-charcoal">{o.totalPieces} pcs</span>
                        <span className="text-[10px] text-muted block">({o.itemCount} items)</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-serif font-bold text-primary">
                        ₹{o.grandTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            o.paymentStatus === 'Payment Received'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.paymentStatus === 'Failed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            o.orderStatus === 'Delivered'
                              ? 'bg-teal-100 text-teal-800'
                              : o.orderStatus === 'Shipped'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.orderStatus === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-primary-subtle text-primary'
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="px-2.5 py-1 bg-surface-subtle hover:bg-surface-border border border-border rounded text-[11px] font-semibold text-primary inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Wholesale Management Modules Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              <span>Wholesale Management Modules</span>
            </h2>
            <p className="text-xs text-muted">
              Direct access to all 10 core administrative sections of Sri Raja Rajeshwara Handloom.
            </p>
          </div>
          <span className="text-[11px] text-muted font-mono self-start sm:self-auto">
            10 Operations Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* 1. Products */}
          <Link
            href="/admin/products"
            className="group relative p-4 bg-surface hover:bg-surface-subtle border border-border hover:border-accent/40 rounded-xl shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors">
                  <Package className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-serif font-bold text-sm text-primary group-hover:text-accent transition-colors">
                Products
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Wholesale catalogue, specifications, piece pricing, and catalogue listings ({stats.totalProducts} items).
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted">Manage items</span>
              <span className="text-accent font-semibold flex items-center gap-0.5">
                + Add New
              </span>
            </div>
          </Link>

          {/* 2. Categories */}
          <Link
            href="/admin/categories"
            className="group relative p-4 bg-surface hover:bg-surface-subtle border border-border hover:border-accent/40 rounded-xl shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-800 group-hover:bg-teal-700 group-hover:text-white flex items-center justify-center transition-colors">
                  <FolderTree className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-serif font-bold text-sm text-primary group-hover:text-accent transition-colors">
                Categories
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Towels, lungies, bedsheets, dhoties, shawls, and textile grouping classification.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted">Sort & hierarchy</span>
              <span className="text-accent font-semibold">View &rarr;</span>
            </div>
          </Link>

          {/* 3. Orders */}
          <Link
            href="/admin/orders"
            className="group relative p-4 bg-surface hover:bg-surface-subtle border border-border hover:border-accent/40 rounded-xl shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-800 group-hover:bg-amber-700 group-hover:text-white flex items-center justify-center transition-colors">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-serif font-bold text-sm text-primary group-hover:text-accent transition-colors">
                Orders
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Track wholesale dispatches, order statuses, parcels, invoices, and LR details ({stats.totalOrders} orders).
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted">{stats.pendingOrders} pending</span>
              <span className="text-accent font-semibold">Dispatch &rarr;</span>
            </div>
          </Link>

          {/* 4. Customers */}
          <Link
            href="/admin/customers"
            className="group relative p-4 bg-surface hover:bg-surface-subtle border border-border hover:border-accent/40 rounded-xl shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-navy/10 text-navy group-hover:bg-navy group-hover:text-white flex items-center justify-center transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-serif font-bold text-sm text-primary group-hover:text-accent transition-colors">
                Customers
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Directory of {stats.totalCustomers} registered cloth store buyers, resellers, and wholesale accounts.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted">Directory & history</span>
              <span className="text-accent font-semibold">View &rarr;</span>
            </div>
          </Link>

          {/* 5. Stock */}
          <Link
            href="/admin/stock"
            className="group relative p-4 bg-surface hover:bg-surface-subtle border border-border hover:border-accent/40 rounded-xl shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-800 group-hover:bg-orange-700 group-hover:text-white flex items-center justify-center transition-colors">
                  <Boxes className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-serif font-bold text-sm text-primary group-hover:text-accent transition-colors">
                Stock
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Warehouse inventory control, piece balances, and restock alerts ({stats.lowStockProducts + stats.outOfStockProducts} low/out).
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted">Thresholds & audit</span>
              <span className="text-accent font-semibold">Inventory &rarr;</span>
            </div>
          </Link>

          {/* 6. Wholesale Enquiries */}
          <Link
            href="/admin/wholesale-enquiries"
            className="group relative p-4 bg-surface hover:bg-surface-subtle border border-border hover:border-accent/40 rounded-xl shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-accent/20 text-charcoal group-hover:bg-accent group-hover:text-charcoal flex items-center justify-center transition-colors">
                  <MessageSquareQuote className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-serif font-bold text-sm text-primary group-hover:text-accent transition-colors">
                Wholesale Enquiries
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Bulk quote requests, custom specifications, and trade leads from businesses across India.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted">Direct WhatsApp</span>
              <span className="text-accent font-semibold">Quotes &rarr;</span>
            </div>
          </Link>

          {/* 7. Delivery Charges */}
          <Link
            href="/admin/delivery-charges"
            className="group relative p-4 bg-surface hover:bg-surface-subtle border border-border hover:border-accent/40 rounded-xl shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-800 group-hover:bg-sky-700 group-hover:text-white flex items-center justify-center transition-colors">
                  <Truck className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-serif font-bold text-sm text-primary group-hover:text-accent transition-colors">
                Delivery Charges
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Pan-India parcel freight tariffs, base rates, and state-wise wholesale transport calculations.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted">Transport tariffs</span>
              <span className="text-accent font-semibold">Rules &rarr;</span>
            </div>
          </Link>

          {/* 8. Payments */}
          <Link
            href="/admin/payments"
            className="group relative p-4 bg-surface hover:bg-surface-subtle border border-border hover:border-accent/40 rounded-xl shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white flex items-center justify-center transition-colors">
                  <CreditCard className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-serif font-bold text-sm text-primary group-hover:text-accent transition-colors">
                Payments
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Wholesale billing ledger, NEFT/UPI settlement confirmations, and payment status updates.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted">Ledger verification</span>
              <span className="text-accent font-semibold">Verify &rarr;</span>
            </div>
          </Link>

          {/* 9. Reports */}
          <Link
            href="/admin/reports"
            className="group relative p-4 bg-surface hover:bg-surface-subtle border border-border hover:border-accent/40 rounded-xl shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-800 group-hover:bg-purple-700 group-hover:text-white flex items-center justify-center transition-colors">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-serif font-bold text-sm text-primary group-hover:text-accent transition-colors">
                Reports
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Sales analytics, wholesale turnover volumes, top-moving fabrics, and CSV/print data exports.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted">Revenue & trends</span>
              <span className="text-accent font-semibold">Analytics &rarr;</span>
            </div>
          </Link>

          {/* 10. Settings */}
          <Link
            href="/admin/settings"
            className="group relative p-4 bg-surface hover:bg-surface-subtle border border-border hover:border-accent/40 rounded-xl shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-700 group-hover:bg-stone-700 group-hover:text-white flex items-center justify-center transition-colors">
                  <Settings className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-serif font-bold text-sm text-primary group-hover:text-accent transition-colors">
                Settings
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Store parameters, GSTIN, business hotlines, operational switches, and trading policies.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted">Merchant config</span>
              <span className="text-accent font-semibold">Configure &rarr;</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
