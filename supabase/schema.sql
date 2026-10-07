-- ========================================================================
-- SRI RAJA RAJESHWARA HANDLOOM - WHOLESALE CLOTH MERCHANT
-- Supabase PostgreSQL Schema Definition (Phase 2)
-- 
-- Official Wholesale Database Schema:
-- • 100% Wholesale • Fixed Piece Rate • Pan-India Supply
-- • Clean, normalized architecture with strict constraints & RLS
-- • Zero fake data (only the 12 finalized wholesale categories seeded)
-- • Correct dependency ordering: tables exist before functions/policies
-- ========================================================================

-- ========================================================================
-- 1. EXTENSIONS
-- ========================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ========================================================================
-- 2. ENUMS
-- ========================================================================
do $$ begin
  create type user_role as enum ('customer', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type order_status as enum (
    'Order Placed',
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Delivered',
    'Cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum (
    'Pending',
    'Payment Received',
    'Failed',
    'Refunded'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type payment_method as enum (
    'online_payment',
    'whatsapp_manual'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type customer_type as enum (
    'Retail Shop',
    'Reseller',
    'Business',
    'Institution',
    'Bulk Buyer',
    'Other'
  );
exception
  when duplicate_object then null;
end $$;

-- ========================================================================
-- 3. UPDATED_AT TRIGGER FUNCTION
-- ========================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ========================================================================
-- 4. PUBLIC.PROFILES TABLE (Created BEFORE is_admin())
-- ========================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text not null unique,
  customer_type customer_type not null default 'Retail Shop',
  business_name text,
  gst_number text, -- Kept nullable, not public
  role user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========================================================================
-- 5. REMAINING TABLES
-- ========================================================================

-- 5a. Addresses
create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  pincode text not null,
  landmark text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5b. Categories (Dynamic wholesale categories grouped by textile family)
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  group_name text not null, -- Towels, Lungies, Traditional Cloth, Dhoties, Shawls
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5c. Products (Wholesale model: fixed rate per piece, any quantity, no tiers)
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  product_code text not null unique, -- e.g. SRR-TWL-001
  name text not null,
  slug text not null unique,
  category_id uuid not null references public.categories(id) on delete restrict,
  price_per_piece numeric(10, 2) not null check (price_per_piece >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  description text not null,
  image_url text,
  is_active boolean not null default true,
  price_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5d. Product Images (Multiple images per product)
create table if not exists public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 5e. Orders (Delivery is manual initially; payment supports online + WhatsApp/manual)
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  address_id uuid references public.addresses(id) on delete set null,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  delivery_charge numeric(10, 2) not null default 0, -- Manual confirmation initially
  grand_total numeric(10, 2) not null check (grand_total >= 0),
  payment_method payment_method not null default 'whatsapp_manual',
  payment_status payment_status not null default 'Pending',
  order_status order_status not null default 'Order Placed',
  customer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5f. Order Items (With historical snapshot)
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name_snapshot text not null,
  product_code_snapshot text not null,
  price_per_piece numeric(10, 2) not null check (price_per_piece >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

-- 5g. Wholesale Enquiries (Public inbox for shopkeepers and institutions)
create table if not exists public.wholesale_enquiries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  business_name text not null,
  phone text not null,
  email text,
  city text not null,
  state text not null,
  products_interested text not null default '',
  approximate_quantity text,
  message text not null,
  status text not null default 'New',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5h. Wishlist (B2B saved wholesale items)
create table if not exists public.wishlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- 5i. Delivery Charge Rules (Configurable delivery rates)
create table if not exists public.delivery_charge_rules (
  id uuid primary key default uuid_generate_v4(),
  state_name text not null unique,
  zone text not null,
  base_charge numeric(10, 2) not null default 0,
  per_piece_rate numeric(10, 2) not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ========================================================================
-- 6. IS_ADMIN() FUNCTION (Defined AFTER public.profiles exists)
-- ========================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ========================================================================
-- 7. HANDLE_NEW_USER() FUNCTION AND AUTH TRIGGER
-- ========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, email, customer_type, business_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.email, ''),
    coalesce((new.raw_user_meta_data->>'customer_type')::customer_type, 'Retail Shop'::customer_type),
    new.raw_user_meta_data->>'business_name',
    'customer'::user_role
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ========================================================================
-- 8. INDEXES
-- ========================================================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_addresses_user_id on public.addresses(user_id);
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_categories_is_active on public.categories(is_active);
create index if not exists idx_categories_group on public.categories(group_name);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_products_price_visible on public.products(price_visible);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_code on public.products(product_code);
create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(order_status);
create index if not exists idx_orders_order_number on public.orders(order_number);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_wishlist_user_id on public.wishlist(user_id);
create index if not exists idx_wholesale_enquiries_status on public.wholesale_enquiries(status);

-- ========================================================================
-- 9. RLS ENABLEMENT
-- ========================================================================
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wholesale_enquiries enable row level security;
alter table public.wishlist enable row level security;
alter table public.delivery_charge_rules enable row level security;

-- ========================================================================
-- 10. RLS POLICIES
-- ========================================================================

-- Profiles: user read/update own profile; admins can view & manage all
drop policy if exists "Users can view own profile or admin" on public.profiles;
create policy "Users can view own profile or admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Addresses: user can manage own addresses
drop policy if exists "Users can view own addresses" on public.addresses;
create policy "Users can view own addresses" on public.addresses
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can manage own addresses" on public.addresses;
create policy "Users can manage own addresses" on public.addresses
  for all using (auth.uid() = user_id);

-- Categories: public can view active; admins can view all and manage
drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories" on public.categories
  for select using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories" on public.categories
  for all using (public.is_admin());

-- Products: public can view active; admins can view all and manage
drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products" on public.products
  for select using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products" on public.products
  for all using (public.is_admin());

-- Product Images: public can view; admins can manage
drop policy if exists "Public can view product images" on public.product_images;
create policy "Public can view product images" on public.product_images
  for select using (true);

drop policy if exists "Admins can manage product images" on public.product_images;
create policy "Admins can manage product images" on public.product_images
  for all using (public.is_admin());

-- Orders: users view own orders, admins view and manage all
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own orders" on public.orders;
create policy "Users can insert own orders" on public.orders
  for insert with check (auth.uid() = user_id or auth.uid() is null);

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders" on public.orders
  for update using (public.is_admin());

-- Order Items: users view own items; users insert items with their orders
drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders 
      where orders.id = order_items.order_id 
      and (orders.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "Users can insert own order items" on public.order_items;
create policy "Users can insert own order items" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders 
      where orders.id = order_items.order_id 
      and (orders.user_id = auth.uid() or orders.user_id is null)
    )
  );

-- Wholesale enquiries: public insert; admin view & manage
drop policy if exists "Anyone can insert wholesale enquiry" on public.wholesale_enquiries;
create policy "Anyone can insert wholesale enquiry" on public.wholesale_enquiries
  for insert with check (true);

drop policy if exists "Admins can manage wholesale enquiries" on public.wholesale_enquiries;
create policy "Admins can manage wholesale enquiries" on public.wholesale_enquiries
  for all using (public.is_admin());

-- Wishlist: users manage own wishlist
drop policy if exists "Users can manage own wishlist" on public.wishlist;
create policy "Users can manage own wishlist" on public.wishlist
  for all using (auth.uid() = user_id);

-- Delivery charge rules: public view active; admin manage
drop policy if exists "Public can view active delivery rules" on public.delivery_charge_rules;
create policy "Public can view active delivery rules" on public.delivery_charge_rules
  for select using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage delivery rules" on public.delivery_charge_rules;
create policy "Admins can manage delivery rules" on public.delivery_charge_rules
  for all using (public.is_admin());

-- ========================================================================
-- 11. LEAST-PRIVILEGE POSTGRESQL GRANTS
-- ========================================================================

-- Schema usage for both roles
grant usage on schema public to anon, authenticated;

-- Grant execution of helper function
grant execute on function public.is_admin() to anon, authenticated;

-- Anon role: read-only access for public catalog and RLS evaluation, plus insert for enquiries
grant select on public.categories to anon;
grant select on public.products to anon;
grant select on public.product_images to anon;
grant select on public.delivery_charge_rules to anon;
grant select on public.profiles to anon;
grant select on public.addresses to anon;
grant select on public.orders to anon;
grant select on public.order_items to anon;
grant select on public.wishlist to anon;
grant select on public.wholesale_enquiries to anon;

grant insert on public.wholesale_enquiries to anon;

-- Authenticated role: standard DML governed strictly by RLS policies
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.addresses to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.product_images to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant select, insert, update, delete on public.wholesale_enquiries to authenticated;
grant select, insert, update, delete on public.wishlist to authenticated;
grant select, insert, update, delete on public.delivery_charge_rules to authenticated;

grant usage on all sequences in schema public to authenticated;

-- Notify PostgREST to reload schema cache immediately
notify pgrst, 'reload schema';

-- ========================================================================
-- 12. SEED THE 12 FINALIZED WHOLESALE CATEGORIES
-- ========================================================================
insert into public.categories (name, slug, group_name, description, sort_order, is_active) values
  -- Towels (3)
  ('Towels', 'towels', 'Towels', 'High-absorbency cotton bath towels and gamcha towels for retail shops and institutions.', 1, true),
  ('Richcott Towels', 'richcott-towels', 'Towels', 'Premium combed rich-cotton towels offering superior softness, dense loop pile, and durability.', 2, true),
  ('Turkey Towels', 'turkey-towels', 'Towels', 'Traditional Turkey-style high-GSM woven bath towels with plush jacquard borders.', 3, true),
  
  -- Lungies (2)
  ('Check Lungies', 'check-lungies', 'Lungies', 'Classic multi-color checked cotton lungies woven for daily comfort and air circulation.', 4, true),
  ('Richcott Lungies', 'richcott-lungies', 'Lungies', 'Mercerized rich-cotton lungies with smooth lustrous finish, deep color tones, and strength.', 5, true),
  
  -- Traditional Cloth (4)
  ('Maharashtra Dastie', 'maharashtra-dastie', 'Traditional Cloth', 'Authentic Maharashtra Dastie traditional headwear and cultural wrap cloth.', 6, true),
  ('Condva', 'condva', 'Traditional Cloth', 'Traditional Condva cultural cloth woven for ritual ceremonies, festivals, and regional wear.', 7, true),
  ('Khadhi Long Cloth', 'khadhi-long-cloth', 'Traditional Cloth', 'Breathable, pure unstitched Khadhi long cloth yardage for kurtas, shirts, and tailoring.', 8, true),
  ('Deeksha Cloth', 'deeksha-cloth', 'Traditional Cloth', 'Sacred black, orange, and saffron Deeksha religious cloths for pilgrimage vows.', 9, true),
  
  -- Dhoties (2)
  ('Panchagajam Dhoties', 'panchagajam-dhoties', 'Dhoties', 'Traditional 9x5 and 10x6 Panchagajam double dhotis with auspicious zari borders.', 10, true),
  ('Pooja Dhoties', 'pooja-dhoties', 'Dhoties', 'Sacred bordered dhoties specifically tailored for temple worship and daily puja rituals.', 11, true),
  
  -- Shawls (1)
  ('Sanmaan Shawls', 'sanmaan-shawls', 'Shawls', 'Felicitation shawls and ceremonial angavastrams for dignitaries, temples, and institutions.', 12, true)
on conflict (slug) do update set
  name = excluded.name,
  group_name = excluded.group_name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
