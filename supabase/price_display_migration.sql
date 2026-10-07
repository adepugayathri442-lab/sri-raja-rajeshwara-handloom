-- ========================================================================
-- SRI RAJA RAJESHWARA HANDLOOM - WHOLESALE CLOTH MERCHANT
-- Supabase PostgreSQL Migration: Product Price Display Setting (Show / Hide Price)
--
-- Purpose:
-- Adds `price_visible` boolean column to `public.products` to support:
-- OPTION 1: Show Price (displays fixed wholesale rate per piece publicly)
-- OPTION 2: Hide Price (hides price publicly; shows "Get Price" / WhatsApp enquiry)
--
-- Rules:
-- - Defaults to true for all existing and newly created products
-- - Backward compatible: does not alter existing wholesale pricing or order calculations
-- - RLS policies remain intact (public can view active products, admins can manage)
-- ========================================================================

alter table public.products
  add column if not exists price_visible boolean not null default true;

-- Index for price visibility filtering
create index if not exists idx_products_price_visible on public.products(price_visible);

-- Notify PostgREST to reload schema cache
notify pgrst, 'reload schema';
