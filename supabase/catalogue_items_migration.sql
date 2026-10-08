-- ========================================================================
-- SRI RAJA RAJESHWARA HANDLOOM — WHOLESALE CLOTH MERCHANT
-- Supabase Migration: Image-Only Wholesale Catalogue
--
-- Features:
-- 1. Create `public.catalogue_items` table
--    - id (UUID primary key)
--    - category_id (UUID references categories(id) with strict FK)
--    - image_url (Public URL of uploaded wholesale photo)
--    - storage_path (Supabase storage path e.g. catalogue/{category_id}/{id}-{name})
--    - sort_order (Integer for category item sequencing)
--    - created_at (Timestamp)
-- 2. Indexes on category_id, sort_order, and created_at
-- 3. Row Level Security (RLS)
--    - Public read access for items belonging to active categories
--    - Admin-only insert, update, delete using public.is_admin()
-- 4. Notify PostgREST to reload schema
-- ========================================================================

-- 1. Create table
create table if not exists public.catalogue_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  image_url text not null,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 2. Create indexes
create index if not exists idx_catalogue_items_category_id on public.catalogue_items(category_id);
create index if not exists idx_catalogue_items_sort_order on public.catalogue_items(sort_order);
create index if not exists idx_catalogue_items_created_at on public.catalogue_items(created_at desc);

-- 3. Enable RLS
alter table public.catalogue_items enable row level security;

-- 4. RLS Policies
-- Public read: Anyone can view items belonging to active categories
drop policy if exists "Public can view catalogue items" on public.catalogue_items;
create policy "Public can view catalogue items" on public.catalogue_items
  for select
  using (
    exists (
      select 1 from public.categories
      where categories.id = catalogue_items.category_id
      and categories.is_active = true
    )
  );

-- Admin insert: Only admins can insert catalogue items
drop policy if exists "Admins can insert catalogue items" on public.catalogue_items;
create policy "Admins can insert catalogue items" on public.catalogue_items
  for insert
  with check (public.is_admin());

-- Admin update: Only admins can update catalogue items
drop policy if exists "Admins can update catalogue items" on public.catalogue_items;
create policy "Admins can update catalogue items" on public.catalogue_items
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- Admin delete: Only admins can delete catalogue items
drop policy if exists "Admins can delete catalogue items" on public.catalogue_items;
create policy "Admins can delete catalogue items" on public.catalogue_items
  for delete
  using (public.is_admin());

-- 5. Grant permissions
grant select on public.catalogue_items to anon, authenticated;
grant all on public.catalogue_items to service_role;
grant insert, update, delete on public.catalogue_items to authenticated;

-- 6. Notify PostgREST to refresh schema cache
notify pgrst, 'reload schema';
