/**
 * Supabase Admin Reports & Sales Analytics Service
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Provides authenticated reporting calculations:
 * - Date-filtered wholesale sales & revenue KPIs
 * - Daily sales & order volume trends
 * - Best-selling wholesale products & category turnover
 * - Top trade buyers by purchase volume
 * - Warehouse inventory valuation and piece balance insights
 * - Strictly excludes Cancelled orders from revenue
 * - Uses historical order_items snapshot prices
 */

import { createClient } from './client';
import type { CustomerType } from '@/types';

export type ReportDateRange = 'today' | 'last-7-days' | 'this-month' | 'last-month' | 'custom';

export interface ReportKPIs {
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
  paidAmount: number;
  pendingAmount: number;
  cancelledCount: number;
  totalCustomers: number;
}

export interface DailyTrendPoint {
  date: string; // YYYY-MM-DD
  displayDate: string; // "14 Oct"
  sales: number;
  orders: number;
}

export interface ProductPerformanceItem {
  productId: string;
  name: string;
  productCode: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
}

export interface CategoryPerformanceItem {
  categoryName: string;
  groupName: string;
  unitsSold: number;
  revenue: number;
}

export interface TopCustomerItem {
  customerId: string;
  name: string;
  businessName: string | null;
  customerType: CustomerType;
  orderCount: number;
  totalSpent: number;
}

export interface InventoryInsight {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalStockUnits: number;
  totalInventoryValuation: number;
}

export interface AdminReportData {
  kpis: ReportKPIs;
  trend: DailyTrendPoint[];
  productPerformance: ProductPerformanceItem[];
  categoryPerformance: CategoryPerformanceItem[];
  topCustomers: TopCustomerItem[];
  inventory: InventoryInsight;
}

export async function getAdminReportData(
  range: ReportDateRange,
  customStart?: string,
  customEnd?: string
): Promise<AdminReportData> {
  const defaultData: AdminReportData = {
    kpis: {
      totalSales: 0,
      orderCount: 0,
      averageOrderValue: 0,
      paidAmount: 0,
      pendingAmount: 0,
      cancelledCount: 0,
      totalCustomers: 0,
    },
    trend: [],
    productPerformance: [],
    categoryPerformance: [],
    topCustomers: [],
    inventory: {
      totalProducts: 0,
      activeProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      totalStockUnits: 0,
      totalInventoryValuation: 0,
    },
  };

  try {
    const supabase = createClient();
    if (!supabase) return defaultData;

    // 1. Calculate Date Range Bounds
    const now = new Date();
    let startTime: number;
    let endTime: number = now.getTime();

    switch (range) {
      case 'today': {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startTime = d.getTime();
        break;
      }
      case 'last-7-days': {
        startTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
        break;
      }
      case 'this-month': {
        const d = new Date(now.getFullYear(), now.getMonth(), 1);
        startTime = d.getTime();
        break;
      }
      case 'last-month': {
        const startLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endLast = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        startTime = startLast.getTime();
        endTime = endLast.getTime();
        break;
      }
      case 'custom': {
        startTime = customStart ? new Date(customStart).getTime() : 0;
        endTime = customEnd
          ? new Date(`${customEnd}T23:59:59.999Z`).getTime()
          : now.getTime();
        break;
      }
      default:
        startTime = 0;
    }

    // 2. Parallel Fetch: Orders with Items, Products with Category, Profiles
    const [ordersRes, productsRes, profilesRes] = await Promise.all([
      supabase
        .from('orders')
        .select(`
          id,
          order_number,
          user_id,
          created_at,
          grand_total,
          payment_status,
          order_status,
          profiles:user_id(id, full_name, business_name, customer_type),
          order_items(id, product_id, product_name_snapshot, product_code_snapshot, price_per_piece, quantity, line_total)
        `)
        .order('created_at', { ascending: true }),

      supabase
        .from('products')
        .select('id, name, product_code, category_id, price_per_piece, stock_quantity, is_active, categories:category_id(id, name, group_name)'),

      supabase
        .from('profiles')
        .select('id, role')
        .eq('role', 'customer'),
    ]);

    // Total registered customers
    const totalCustomers = profilesRes.data ? profilesRes.data.length : 0;

    // 3. Process Inventory Insights
    const inventory: InventoryInsight = {
      totalProducts: 0,
      activeProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      totalStockUnits: 0,
      totalInventoryValuation: 0,
    };

    const categoryMap = new Map<string, { name: string; group: string }>();

    if (productsRes.data) {
      inventory.totalProducts = productsRes.data.length;
      productsRes.data.forEach((p) => {
        const stock = Number(p.stock_quantity ?? 0);
        const price = Number(p.price_per_piece ?? 0);

        if (p.is_active) inventory.activeProducts++;
        if (stock <= 0) inventory.outOfStockProducts++;
        else if (stock <= 10) inventory.lowStockProducts++;

        inventory.totalStockUnits += stock;
        inventory.totalInventoryValuation += stock * price;

        type CatJoin = { id: string; name: string; group_name: string };
        const cat = (Array.isArray(p.categories) ? p.categories[0] : p.categories) as CatJoin | null;
        if (p.id && cat) {
          categoryMap.set(p.id, { name: cat.name, group: cat.group_name });
        }
      });
    }

    // 4. Filter Orders by Selected Date Range & Process KPIs
    const kpis: ReportKPIs = {
      totalSales: 0,
      orderCount: 0,
      averageOrderValue: 0,
      paidAmount: 0,
      pendingAmount: 0,
      cancelledCount: 0,
      totalCustomers,
    };

    const dailyMap = new Map<string, { date: string; displayDate: string; sales: number; orders: number }>();
    const productStatsMap = new Map<string, ProductPerformanceItem>();
    const categoryStatsMap = new Map<string, CategoryPerformanceItem>();
    const customerStatsMap = new Map<string, TopCustomerItem>();

    type ProfileJoin = {
      id: string;
      full_name: string;
      business_name: string | null;
      customer_type: CustomerType;
    };

    type ItemJoin = {
      id: string;
      product_id: string;
      product_name_snapshot: string;
      product_code_snapshot: string;
      price_per_piece: number;
      quantity: number;
      line_total: number;
    };

    if (ordersRes.data) {
      ordersRes.data.forEach((o) => {
        const orderTime = new Date(o.created_at).getTime();

        // Check if order falls in selected range
        if (orderTime < startTime || orderTime > endTime) return;

        const isCancelled = o.order_status === 'Cancelled';
        const amount = Number(o.grand_total ?? 0);

        if (isCancelled) {
          kpis.cancelledCount++;
          return; // Exclude cancelled orders from revenue and analytics
        }

        // Valid non-cancelled order
        kpis.totalSales += amount;
        kpis.orderCount++;

        if (o.payment_status === 'Payment Received') {
          kpis.paidAmount += amount;
        } else if (o.payment_status === 'Pending') {
          kpis.pendingAmount += amount;
        }

        // Daily trend grouping
        const dateObj = new Date(o.created_at);
        const dayKey = dateObj.toISOString().slice(0, 10); // YYYY-MM-DD
        const displayDate = dateObj.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        });

        const currentDay = dailyMap.get(dayKey) || {
          date: dayKey,
          displayDate,
          sales: 0,
          orders: 0,
        };
        currentDay.sales += amount;
        currentDay.orders++;
        dailyMap.set(dayKey, currentDay);

        // Customer Grouping
        const p = (Array.isArray(o.profiles) ? o.profiles[0] : o.profiles) as ProfileJoin | null;
        if (p && p.id) {
          const cust = customerStatsMap.get(p.id) || {
            customerId: p.id,
            name: p.full_name || 'Counter Buyer',
            businessName: p.business_name || null,
            customerType: p.customer_type || 'Retail Shop',
            orderCount: 0,
            totalSpent: 0,
          };
          cust.orderCount++;
          cust.totalSpent += amount;
          customerStatsMap.set(p.id, cust);
        }

        // Product & Category Grouping from order items snapshots
        const items = (Array.isArray(o.order_items) ? o.order_items : []) as ItemJoin[];
        items.forEach((item) => {
          const pId = item.product_id;
          const qty = Number(item.quantity ?? 0);
          const lineTotal = Number(item.line_total ?? (item.price_per_piece * qty));

          const catInfo = categoryMap.get(pId) || {
            name: 'General Wholesale',
            group: 'Traditional Textiles',
          };

          // Product level
          const prodStat = productStatsMap.get(pId) || {
            productId: pId,
            name: item.product_name_snapshot,
            productCode: item.product_code_snapshot,
            categoryName: catInfo.name,
            unitsSold: 0,
            revenue: 0,
          };
          prodStat.unitsSold += qty;
          prodStat.revenue += lineTotal;
          productStatsMap.set(pId, prodStat);

          // Category level
          const catStat = categoryStatsMap.get(catInfo.name) || {
            categoryName: catInfo.name,
            groupName: catInfo.group,
            unitsSold: 0,
            revenue: 0,
          };
          catStat.unitsSold += qty;
          catStat.revenue += lineTotal;
          categoryStatsMap.set(catInfo.name, catStat);
        });
      });
    }

    // Average Order Value
    if (kpis.orderCount > 0) {
      kpis.averageOrderValue = Math.round(kpis.totalSales / kpis.orderCount);
    }

    // Sort Trend chronologically
    const trend = Array.from(dailyMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Sort Product Performance by Units Sold desc
    const productPerformance = Array.from(productStatsMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 10);

    // Sort Category Performance by Revenue desc
    const categoryPerformance = Array.from(categoryStatsMap.values())
      .sort((a, b) => b.revenue - a.revenue);

    // Sort Top Customers by Total Spent desc
    const topCustomers = Array.from(customerStatsMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return {
      kpis,
      trend,
      productPerformance,
      categoryPerformance,
      topCustomers,
      inventory,
    };
  } catch (err) {
    console.error('Error calculating admin reports data:', err);
    return defaultData;
  }
}
