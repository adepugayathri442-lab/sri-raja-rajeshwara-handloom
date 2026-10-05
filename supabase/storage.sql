-- ========================================================================
-- SRI RAJA RAJESHWARA HANDLOOM — SUPABASE STORAGE SETUP
-- Bucket: product-images
-- Wholesale B2B Storefront & Product Catalogue
-- ========================================================================

-- 1. Ensure product-images bucket exists with public read access
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB per image
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- 2. Storage RLS Policies
-- Enable RLS on storage.objects (default in Supabase)

-- Policy 1: Public Read (Storefront visitors and buyers can view product images)
drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images" on storage.objects
  for select using (bucket_id = 'product-images');

-- Policy 2: Admin Upload (Only authenticated users with role = 'admin' can upload)
drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
  for insert with check (
    bucket_id = 'product-images' and public.is_admin()
  );

-- Policy 3: Admin Update (Only authenticated users with role = 'admin' can update)
drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects
  for update using (
    bucket_id = 'product-images' and public.is_admin()
  );

-- Policy 4: Admin Delete (Only authenticated users with role = 'admin' can delete)
drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects
  for delete using (
    bucket_id = 'product-images' and public.is_admin()
  );
