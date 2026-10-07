/**
 * Centralized WhatsApp Utilities for Sri Raja Rajeshwara Handloom
 * Merchant WhatsApp: 9440472939 (+91 94404 72939)
 * 
 * Supports:
 * 1. General WhatsApp Enquiry
 * 2. Product WhatsApp Enquiry (Product name, code, quantity, price per piece)
 * 3. Order WhatsApp Enquiry (Order #, products, quantities, subtotal, delivery charge, grand total, customer name, phone, address)
 * 4. Wholesale Enquiry (Business name, location, quantities, message)
 */

import { businessConfig } from '@/config/business';

const WHATSAPP_COUNTRY_CODE = '91';
const WHATSAPP_PHONE_RAW = businessConfig.contact.whatsappNumber.replace(/\D/g, '');
const FULL_PHONE_NUMBER = WHATSAPP_PHONE_RAW.startsWith('91')
  ? WHATSAPP_PHONE_RAW
  : `${WHATSAPP_COUNTRY_CODE}${WHATSAPP_PHONE_RAW}`;

/**
 * Builds standard wa.me link with encoded message
 */
export function buildWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${FULL_PHONE_NUMBER}?text=${encoded}`;
}

/**
 * 1. General Wholesale Enquiry Message
 */
export function getGeneralEnquiryUrl(customNote?: string): string {
  const text = [
    `*SRI RAJA RAJESHWARA HANDLOOM — Wholesale Cloth Merchant*`,
    `Namaste! I would like to enquire about wholesale textile supply.`,
    customNote ? `\nNote: ${customNote}` : '',
    `\nPlease share your wholesale catalog and piece rate availability.`,
  ]
    .filter(Boolean)
    .join('\n');

  return buildWhatsAppUrl(text);
}

/**
 * 2. Product Wholesale Enquiry Message
 * Required:
 * - Product name
 * - Product code / SKU
 * - Quantity
 * - Price per piece
 */
export interface ProductEnquiryParams {
  name?: string;
  productName?: string;
  productCode: string;
  quantity: number;
  pricePerPiece: number;
  priceVisible?: boolean;
  customerName?: string;
  businessName?: string;
  city?: string;
}

export function getProductEnquiryUrl(params: ProductEnquiryParams): string {
  const productName = params.name || params.productName || 'Handloom Textile Item';
  const isPriceVisible = params.priceVisible !== false;
  const lineTotal = params.quantity * params.pricePerPiece;

  const lines = isPriceVisible
    ? [
        `Business: SRI RAJA RAJESHWARA HANDLOOM`,
        `Product: ${productName}`,
        `Product Code: ${params.productCode}`,
        `Price: ₹${params.pricePerPiece.toLocaleString('en-IN')} / piece`,
        `Quantity: ${params.quantity}`,
        `Estimated Product Total: ₹${lineTotal.toLocaleString('en-IN')}`,
        ``,
        `Please confirm availability and order details.`,
      ]
    : [
        `Business: SRI RAJA RAJESHWARA HANDLOOM`,
        `Product: ${productName}`,
        `Product Code: ${params.productCode}`,
        `Quantity Interested: ${params.quantity} piece(s)`,
        ``,
        `Namaste! I would like to get the wholesale piece rate and dispatch availability for this product.`,
      ];

  if (params.customerName || params.businessName || params.city) {
    lines.push(``);
    lines.push(`Merchant / Buyer Details:`);
    if (params.customerName) lines.push(`Name: ${params.customerName}`);
    if (params.businessName) lines.push(`Business / Shop: ${params.businessName}`);
    if (params.city) lines.push(`City: ${params.city}`);
  }

  return buildWhatsAppUrl(lines.join('\n'));
}

/**
 * 3. Order WhatsApp Message
 * Required:
 * - Order number
 * - Products
 * - Quantities
 * - Subtotal
 * - Delivery charge
 * - Grand total
 * - Customer name
 * - Phone
 * - Delivery address
 */
export interface OrderItemSummary {
  productName: string;
  productCode: string;
  quantity: number;
  pricePerPiece: number;
  lineTotal: number;
}

export interface OrderEnquiryParams {
  orderNumber: string;
  items: readonly OrderItemSummary[];
  subtotal: number;
  deliveryCharge: number | null; // null if pending manual calculation
  grandTotal: number;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  notes?: string;
}

export function getOrderEnquiryUrl(params: OrderEnquiryParams): string {
  const deliveryText =
    params.deliveryCharge !== null && params.deliveryCharge !== undefined
      ? `₹${params.deliveryCharge.toLocaleString('en-IN')}`
      : 'To be confirmed by merchant based on parcel weight / transport';

  const lines = [
    `*SRI RAJA RAJESHWARA HANDLOOM — Order Confirmation*`,
    `Order Number: *#${params.orderNumber}*`,
    ``,
    `*Order Items:*`,
    ...params.items.map(
      (item, idx) =>
        `${idx + 1}. ${item.productName} (${item.productCode}) — ${item.quantity} pcs @ ₹${item.pricePerPiece.toLocaleString('en-IN')} = ₹${item.lineTotal.toLocaleString('en-IN')}`
    ),
    ``,
    `*Billing Summary:*`,
    `• Subtotal: ₹${params.subtotal.toLocaleString('en-IN')}`,
    `• Delivery Charge: ${deliveryText}`,
    `• Grand Total: ₹${params.grandTotal.toLocaleString('en-IN')}`,
    ``,
    `*Customer & Dispatch Details:*`,
    `• Name: ${params.customerName}`,
    `• Contact Phone: ${params.phone}`,
    `• Delivery Address: ${params.deliveryAddress}`,
  ];

  if (params.notes) {
    lines.push(`• Notes / Transport Pref: ${params.notes}`);
  }

  lines.push(``);
  lines.push(`Please confirm order receipt and payment instructions.`);

  return buildWhatsAppUrl(lines.join('\n'));
}

/**
 * 4. Wholesale Quote / Enquiry Form Message
 */
export interface WholesaleEnquiryParams {
  name: string;
  businessName: string;
  phone: string;
  city: string;
  state: string;
  customerType?: string;
  productsInterested: string;
  approximateQuantity?: string;
  message?: string;
}

export function getWholesaleFormWhatsAppUrl(params: WholesaleEnquiryParams): string {
  const lines = [
    `*SRI RAJA RAJESHWARA HANDLOOM — Wholesale B2B Enquiry*`,
    `Namaste! I have submitted a wholesale enquiry:`,
    ``,
    `*Buyer Details:*`,
    `• Name: ${params.name}`,
    `• Business / Shop: ${params.businessName}`,
    `• Phone: ${params.phone}`,
    `• Location: ${params.city}, ${params.state}`,
    params.customerType ? `• Category: ${params.customerType}` : '',
    ``,
    `*Requirements:*`,
    `• Textiles Interested: ${params.productsInterested}`,
    params.approximateQuantity ? `• Approx Quantity: ${params.approximateQuantity}` : '',
    params.message ? `• Requirements Note: ${params.message}` : '',
    ``,
    `Please provide wholesale piece rates and parcel booking details.`,
  ]
    .filter(Boolean)
    .join('\n');

  return buildWhatsAppUrl(lines);
}
