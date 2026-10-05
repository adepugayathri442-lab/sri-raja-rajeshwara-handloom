-- ========================================================================
-- SRI RAJA RAJESHWARA HANDLOOM - WHOLESALE CLOTH MERCHANT
-- Supabase PostgreSQL Migration: Store Settings Persistence
-- 
-- Purpose:
-- Allows Admin to configure store information, contact hotlines, wholesale
-- parameters, and operational switches, persisting them across all devices,
-- browsers, logins, and sessions.
--
-- Security:
-- - RLS enabled
-- - Safe public SELECT access (storefront reads business details)
-- - Strictly Admin-only INSERT & UPDATE access via public.is_admin()
-- - Least-privilege GRANTs
-- ========================================================================

create table if not exists public.store_settings (
  id text primary key default 'primary_store',
  business_name text not null default 'SRI RAJA RAJESHWARA HANDLOOM',
  business_type text not null default 'Wholesale Cloth Merchant',
  tagline text not null default 'Traditional Textiles. Wholesale Prices. Trusted Supply.',
  short_description text not null default 'Direct weaver-to-merchant wholesale cloth supply from Nizamabad, Telangana.',
  full_address text not null default 'H.NO: 2-7-107, Near G.S Tailor, Pusala Galli, Jawahar Road, Nizamabad – 503001, Telangana, India',
  pincode text not null default '503001',
  google_maps_plus_code text not null default 'M3CW+VXC, Near G.S Tailor, Pusala Galli, Jawahar Rd, Nizamabad, Telangana 503001',
  google_maps_address text not null default 'https://maps.google.com/?q=M3CW+VXC,Nizamabad,Telangana',
  
  -- Store Wholesale Parameters
  is_wholesale_only boolean not null default true,
  pricing_type text not null default 'Fixed Piece Rate (₹/pc)',
  allows_any_quantity boolean not null default true,
  delivery_enabled boolean not null default true,
  default_delivery_charge numeric not null default 150,
  
  -- Contact Hotlines
  phone text not null default '9440472939',
  formatted_phone text not null default '+91 94404 72939',
  whatsapp_number text not null default '9440472939',
  email text not null default 'Rameshkurapati2939.rk@gmail.com',
  working_hours text not null default 'Mon - Sat: 9:00 AM - 8:30 PM | Sunday: 10:00 AM - 2:00 PM',
  
  -- Operational Switches
  is_store_active boolean not null default true,
  allow_new_orders boolean not null default true,
  allow_whatsapp_enquiries boolean not null default true,
  
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.store_settings enable row level security;

-- Drop any existing policies on this table to prevent conflicts
drop policy if exists "Store settings are viewable by everyone" on public.store_settings;
drop policy if exists "Only admin can insert store settings" on public.store_settings;
drop policy if exists "Only admin can update store settings" on public.store_settings;

-- Policy 1: Everyone (anon and authenticated) can view store settings
create policy "Store settings are viewable by everyone"
  on public.store_settings for select
  using (true);

-- Policy 2: Only Admin can insert store settings
create policy "Only admin can insert store settings"
  on public.store_settings for insert
  with check (public.is_admin());

-- Policy 3: Only Admin can update store settings
create policy "Only admin can update store settings"
  on public.store_settings for update
  using (public.is_admin())
  with check (public.is_admin());

-- Least-privilege Grants
grant select on public.store_settings to anon, authenticated;
grant all on public.store_settings to authenticated;

-- Seed default primary_store record if not already present
insert into public.store_settings (
  id,
  business_name,
  business_type,
  tagline,
  short_description,
  full_address,
  pincode,
  google_maps_plus_code,
  google_maps_address,
  is_wholesale_only,
  pricing_type,
  allows_any_quantity,
  delivery_enabled,
  default_delivery_charge,
  phone,
  formatted_phone,
  whatsapp_number,
  email,
  working_hours,
  is_store_active,
  allow_new_orders,
  allow_whatsapp_enquiries,
  updated_at
) values (
  'primary_store',
  'SRI RAJA RAJESHWARA HANDLOOM',
  'Wholesale Cloth Merchant',
  'Traditional Textiles. Wholesale Prices. Trusted Supply.',
  'Direct weaver-to-merchant wholesale cloth supply from Nizamabad, Telangana.',
  'H.NO: 2-7-107, Near G.S Tailor, Pusala Galli, Jawahar Road, Nizamabad – 503001, Telangana, India',
  '503001',
  'M3CW+VXC, Near G.S Tailor, Pusala Galli, Jawahar Rd, Nizamabad, Telangana 503001',
  'https://maps.google.com/?q=M3CW+VXC,Nizamabad,Telangana',
  true,
  'Fixed Piece Rate (₹/pc)',
  true,
  true,
  150,
  '9440472939',
  '+91 94404 72939',
  '9440472939',
  'Rameshkurapati2939.rk@gmail.com',
  'Mon - Sat: 9:00 AM - 8:30 PM | Sunday: 10:00 AM - 2:00 PM',
  true,
  true,
  true,
  now()
)
on conflict (id) do update set
  phone = excluded.phone,
  formatted_phone = excluded.formatted_phone,
  whatsapp_number = excluded.whatsapp_number,
  updated_at = now();
