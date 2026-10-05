/**
 * Site navigation and metadata configuration
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 */

import { businessConfig } from './business';

export interface NavItem {
  readonly title: string;
  readonly href: string;
  readonly description?: string;
}

export const siteConfig = {
  name: businessConfig.name,
  shortName: "SRR Handloom",
  businessType: businessConfig.businessType,
  tagline: businessConfig.tagline,
  description: businessConfig.shortDescription,
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://sri-raja-rajeshwara-handloom-8gqw.vercel.app",
  ogImage: "/images/og-wholesale.jpg",

  mainNav: [
    { title: "Home", href: "/" },
    { title: "Wholesale Categories", href: "/categories" },
    { title: "Products", href: "/products" },
    { title: "Wholesale Enquiry", href: "/wholesale-enquiry" },
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" },
  ] as const satisfies readonly NavItem[],

  quickActions: [
    { title: "Wholesale Enquiry", href: "/wholesale-enquiry" },
    { title: "Merchant Login", href: "/login" },
    { title: "Cart", href: "/cart" },
  ] as const,

  policyLinks: [
    { title: "Shipping Policy", href: "/shipping-policy" },
    { title: "Return Policy", href: "/return-policy" },
    { title: "Cancellation Policy", href: "/cancellation-policy" },
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Terms of Trade", href: "/terms" },
  ] as const satisfies readonly NavItem[],

  adminNav: [
    { title: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
    { title: "Products", href: "/admin/products", icon: "Package" },
    { title: "Categories", href: "/admin/categories", icon: "FolderTree" },
    { title: "Orders", href: "/admin/orders", icon: "ShoppingBag" },
    { title: "Customers", href: "/admin/customers", icon: "Users" },
    { title: "Stock", href: "/admin/stock", icon: "Boxes" },
    { title: "Wholesale Enquiries", href: "/admin/wholesale-enquiries", icon: "MessageSquareQuote" },
    { title: "Delivery Charges", href: "/admin/delivery-charges", icon: "Truck" },
    { title: "Payments", href: "/admin/payments", icon: "CreditCard" },
    { title: "Reports", href: "/admin/reports", icon: "BarChart3" },
    { title: "Settings", href: "/admin/settings", icon: "Settings" },
  ] as const,
};
