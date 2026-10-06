# Sri Raja Rajeshwara Handloom — Android Mobile Application

The official cross-platform Android mobile application for **Sri Raja Rajeshwara Handloom** (100% Wholesale Cloth Merchant, Nizamabad, Telangana).

## Technology Stack & Architecture
- **Framework**: Expo SDK 52 & React Native 0.76
- **Language**: TypeScript (strict typing)
- **State & Storage**: React Context + `@react-native-async-storage/async-storage`
- **Navigation**: React Navigation 7 (Native Stack + Bottom Tabs)
- **Icons & Graphics**: `@expo/vector-icons` (Ionicons) + `react-native-svg`
- **Backend & Database**: Shared production Supabase backend (`wrnfsrqzgnitwpimtqyp.supabase.co`)
- **App Name**: Sri Raja Rajeshwara Handloom
- **Package Identifier**: `com.srirajarajeshwara.handloom`

---

## Brand Design Tokens
- **Primary**: Deep Loom Emerald (`#0D3B2E`)
- **Secondary / Accent**: Antique Muted Gold (`#C5A059`)
- **Background**: Warm Cream (`#FAF8F5`)
- **Text**: Dark Charcoal (`#1C2421`)
- **Supporting**: Navy (`#0B2545`)

---

## Mobile Navigation Structure

### 6 Bottom Tabs
1. **Home**: Brand hero, 100% wholesale notice, category quick access, live Supabase featured products, advantages, official godown contact.
2. **Categories**: 12 predefined wholesale categories grouped across 5 families (Towels, Lungies, Traditional Cloth, Dhoties, Shawls).
3. **Products**: Live searchable catalog, category filter pills, price/newest sorting, real warehouse stock, add to cart.
4. **Wholesale Enquiry**: B2B bulk requirement submission to Supabase `wholesale_enquiries` with direct WhatsApp dispatch link.
5. **Cart**: Wholesale piece orders with fixed piece rate calculation, quantity steppers, piece count, and delivery estimation. Protected by merchant login.
6. **Account**: Real customer profile (name, shop name, customer type, phone, email, GSTIN) with direct links to orders, enquiries, and godown support.

### Stack Navigation Screens
- **Product Detail**: High-res image gallery, SKU code, fixed wholesale price, quantity selector, add to cart, and direct WhatsApp enquiry.
- **Checkout**: Consignee delivery address, Indian destination state selection, real-time freight rule calculation, payment settlement choice, transport preference notes.
- **Order Success**: Order number (`SRR-XXXXXX`), volume summary, and one-tap WhatsApp order dispatch.
- **Orders List**: Real Supabase customer order history with status tracking.
- **Order Detail**: 6-step consignment tracking stepper (Placed -> Confirmed -> Processing -> Packed -> Shipped -> Delivered), transporter name, LR number, consignment tracking number, and itemized invoice breakdown.
- **Login & Register**: Supabase authentication with customer type classification (`Retail Shop`, `Reseller`, `Business`, `Institution`, `Bulk Buyer`, `Other`).

---

## Running and Building

### Development / Emulation
```bash
cd mobile
npm start
# or run directly on connected Android device / emulator
npm run android
```

### Type Checking & Validation
```bash
cd mobile
npm run check
# or
npx tsc --noEmit
```

### Validate Metro Android Bundle
```bash
cd mobile
npx expo export --platform android
```

### Building Android APK / AAB
Using EAS Build:
```bash
cd mobile
npm run build:android
# or standard EAS:
eas build --platform android --profile preview
```
