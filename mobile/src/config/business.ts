/**
 * Sri Raja Rajeshwara Handloom - Business Configuration
 * 100% Wholesale Cloth Merchant
 */

export const businessConfig = {
  name: "SRI RAJA RAJESHWARA HANDLOOM",
  legalName: "Sri Raja Rajeshwara Handloom Wholesale Cloth Merchant",
  tagline: "Traditional Textiles. Wholesale Prices. Trusted Supply.",
  shortDescription: "Authentic wholesale textiles supplied to retail shops, resellers, businesses, and bulk buyers across India at fixed piece rates.",
  businessType: "100% Wholesale Cloth Merchant (B2B)",

  // Single fixed wholesale rate rule
  pricingModel: "Single Fixed Wholesale Piece Rate (No Quantity Tiers)",
  allowsAnyQuantity: true,

  targetAudience: [
    "Retail Cloth Shops",
    "Textile Resellers",
    "Garment & Apparel Businesses",
    "Religious & Cultural Institutions",
    "Bulk Buyers & Corporate Gifting",
  ],

  contact: {
    phone: "9440472939",
    formattedPhone: "+91 94404 72939",
    whatsappNumber: "9440472939",
    whatsappLink: "https://wa.me/919440472939",
    email: "Rameshkurapati2939.rk@gmail.com",
    addressLine1: "H.NO: 2-7-107, Near G.S Tailor, Pusala Galli",
    addressLine2: "Jawahar Road",
    city: "Nizamabad",
    state: "Telangana",
    pincode: "503001",
    country: "India",
    fullAddress: "H.NO: 2-7-107, Near G.S Tailor, Pusala Galli, Jawahar Road, Nizamabad – 503001, Telangana, India",
    workingHours: "Monday - Saturday: 9:00 AM - 8:30 PM IST",
  },

  // Live Supabase connection
  supabase: {
    url: "https://wrnfsrqzgnitwpimtqyp.supabase.co",
    publishableKey: "sb_publishable_yVuV82MTqzAtiMXyz_VTrg_uTCXT1QF",
  },
};
