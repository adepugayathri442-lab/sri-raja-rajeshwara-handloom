-- ========================================================================
-- SRI RAJA RAJESHWARA HANDLOOM - WHOLESALE CLOTH MERCHANT
-- Supabase PostgreSQL Migration: Logistics, Courier & LR/Bilti Tracking
-- 
-- Purpose:
-- Adds logistics, transport agency, and consignment tracking columns to
-- the existing `public.orders` table without modifying historical records.
--
-- Security:
-- - Preserves existing RLS policies on `public.orders`
-- - Customer can view only their own order tracking
-- - Admin can update logistics via public.is_admin()
-- ========================================================================

alter table public.orders
  add column if not exists transporter_name text,
  add column if not exists lr_number text,
  add column if not exists tracking_number text,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists delivery_notes text;

-- Add index on tracking / LR numbers for quick lookups
create index if not exists idx_orders_lr_number on public.orders(lr_number);
create index if not exists idx_orders_tracking_number on public.orders(tracking_number);

-- Notify PostgREST to reload schema cache
notify pgrst, 'reload schema';
