-- SRI RAJA RAJESHWARA HANDLOOM — ADMIN PROFILES FIX
-- Ensures both authorized admin accounts exist and have role = 'admin'

-- 1. Google Admin Account (adepugayathri442@gmail.com)
insert into public.profiles (
  id,
  full_name,
  phone,
  email,
  customer_type,
  business_name,
  role
) values (
  '6eda0e3c-732e-4c1f-839a-01b019a6a49e',
  'Gayathri Adepu',
  '',
  'adepugayathri442@gmail.com',
  'Business',
  'Sri Raja Rajeshwara Handloom',
  'admin'
)
on conflict (id) do update set
  role = 'admin',
  email = 'adepugayathri442@gmail.com',
  updated_at = now();

-- 2. Original Admin Account (adepugayathri28@gmail.com)
insert into public.profiles (
  id,
  full_name,
  phone,
  email,
  customer_type,
  business_name,
  role
) values (
  '2bd6cdb5-e013-411d-92f4-23e787c27c4c',
  'Adepu Gayathri',
  '',
  'adepugayathri28@gmail.com',
  'Business',
  'Sri Raja Rajeshwara Handloom',
  'admin'
)
on conflict (id) do update set
  role = 'admin',
  email = 'adepugayathri28@gmail.com',
  updated_at = now();
