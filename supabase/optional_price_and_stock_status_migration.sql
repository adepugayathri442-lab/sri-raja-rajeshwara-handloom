-- ========================================================================
-- SRI RAJA RAJESHWARA HANDLOOM - WHOLESALE CLOTH MERCHANT
-- Supabase Migration: Make Wholesale Price Optional & Add Stock Status
--
-- Changes:
-- 1. Allow `price_per_piece` to be NULL on `public.products` (Wholesale price optional)
-- 2. Add `stock_status` column ('full' | 'limited' | 'out_of_stock') defaulting to 'full'
-- 3. Add constraint and index for stock_status
-- 4. Preserve all existing products, orders, images, and pricing
-- ========================================================================

-- 1. Make wholesale price nullable
alter table public.products
  alter column price_per_piece drop not null;

-- Update check constraint on price_per_piece so it accepts NULL or positive amounts
alter table public.products
  drop constraint if exists products_price_per_piece_check;

alter table public.products
  add constraint products_price_per_piece_check
  check (price_per_piece is null or price_per_piece >= 0);

-- 2. Add stock_status column
alter table public.products
  add column if not exists stock_status text not null default 'full';

-- Add check constraint for valid stock_status values
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_stock_status_check'
  ) then
    alter table public.products
      add constraint products_stock_status_check
      check (stock_status in ('full', 'limited', 'out_of_stock'));
  end if;
end $$;

-- 3. Backfill stock_status for existing products based on existing stock_quantity
update public.products
  set stock_status = case
    when stock_quantity <= 0 then 'out_of_stock'
    when stock_quantity <= 10 then 'limited'
    else 'full'
  end
  where stock_status is null or stock_status = 'full';

-- 4. Index for stock_status
create index if not exists idx_products_stock_status on public.products(stock_status);

-- 5. Notify PostgREST to reload schema
notify pgrst, 'reload schema';
