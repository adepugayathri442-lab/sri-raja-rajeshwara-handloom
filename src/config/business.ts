/**
 * Sri Raja Rajeshwara Handloom - Business Configuration
 * Wholesale Cloth Merchant
 * 
 * Official business details for Sri Raja Rajeshwara Handloom.
 * 100% Wholesale • Fixed Piece Rate • Pan-India Supply
 */

export interface BusinessConfig {
  readonly name: string;
  readonly legalName: string;
  readonly businessType: string;
  readonly tagline: string;
  readonly shortDescription: string;
  
  // Model
  readonly model: {
    readonly isWholesaleOnly: boolean;
    readonly pricingType: 'fixed_piece_rate';
    readonly allowsAnyQuantity: boolean;
    readonly targetAudience: readonly string[];
    readonly deliveryCoverage: string;
    readonly paymentMethods: readonly string[];
  };

  // Official Contact Information
  readonly contact: {
    readonly phone: string;
    readonly formattedPhone: string;
    readonly whatsappNumber: string;
    readonly email: string;
    readonly addressLine1: string;
    readonly addressLine2: string;
    readonly city: string;
    readonly state: string;
    readonly pincode: string;
    readonly country: string;
    readonly fullAddress: string;
    readonly googleMapsPlusCode: string;
    readonly googleMapsAddress: string;
    readonly googleMapsUrl: string;
    readonly workingHours: string;
  };

  // GST Registration (Prepared for future activation; NOT displayed publicly)
  readonly tax: {
    readonly isGstConfigured: boolean;
    readonly gstNumber: string | null;
  };

  // Operational Flags
  readonly status: {
    readonly isSupabaseConnected: boolean;
    readonly isWhatsAppConfigured: boolean;
    readonly isPaymentGatewayConfigured: boolean;
  };
}

export const businessConfig: BusinessConfig = {
  name: "SRI RAJA RAJESHWARA HANDLOOM",
  legalName: "Sri Raja Rajeshwara Handloom Wholesale Cloth Merchant",
  businessType: "Wholesale Cloth Merchant",
  tagline: "Traditional Textiles. Wholesale Prices. Trusted Supply.",
  shortDescription: "Authentic wholesale textiles supplied to retail shops, resellers, businesses, and bulk buyers across India at fixed piece rates.",
  
  model: {
    isWholesaleOnly: true,
    pricingType: "fixed_piece_rate",
    allowsAnyQuantity: true,
    targetAudience: [
      "Retail Cloth Shops",
      "Textile Resellers",
      "Garment & Apparel Businesses",
      "Religious & Cultural Institutions",
      "Bulk Buyers & Corporate Gifting",
    ],
    deliveryCoverage: "Pan-India delivery across all states and union territories",
    paymentMethods: [
      "Online Payment",
      "WhatsApp / Manual Payment & Order Confirmation",
    ],
  },

  contact: {
    phone: "9440472939",
    formattedPhone: "+91 94404 72939",
    whatsappNumber: "9440472939",
    email: "Rameshkurapati2939.rk@gmail.com",
    addressLine1: "H.NO: 2-7-107, Near G.S Tailor, Pusala Galli",
    addressLine2: "Jawahar Road",
    city: "Nizamabad",
    state: "Telangana",
    pincode: "503001",
    country: "India",
    fullAddress: "H.NO: 2-7-107, Near G.S Tailor, Pusala Galli, Jawahar Road, Nizamabad – 503001, Telangana, India",
    googleMapsPlusCode: "M3CW+VXC",
    googleMapsAddress: "M3CW+VXC, Near G.S Tailor, Pusala Galli, Jawahar Rd, Nizamabad, Telangana 503001",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=M3CW%2BVXC%2C+Near+G.S+Tailor%2C+Pusala+Galli%2C+Jawahar+Rd%2C+Nizamabad%2C+Telangana+503001",
    workingHours: "Monday - Saturday: 9:00 AM - 8:30 PM IST",
  },

  tax: {
    isGstConfigured: false,
    gstNumber: null, // Kept nullable; never displayed publicly until officially activated
  },

  status: {
    isSupabaseConnected: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    ),
    isWhatsAppConfigured: true,
    isPaymentGatewayConfigured: false, // Provider "Other" to be selected later
  },
};
