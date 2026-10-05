/**
 * Supabase Database Verification Script
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Verifies:
 * 1. 10 expected tables
 * 2. 12 finalized wholesale categories
 * 3. Absence of fake products, orders, or customers
 * 4. RLS protection
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or Publishable Key missing from environment.');
  process.exit(1);
}

const supabase = createClient(url, key);

const EXPECTED_TABLES = [
  'profiles',
  'addresses',
  'categories',
  'products',
  'product_images',
  'orders',
  'order_items',
  'wholesale_enquiries',
  'wishlist',
  'delivery_charge_rules'
];

const EXPECTED_CATEGORIES = [
  { slug: 'towels', name: 'Towels', group: 'Towels' },
  { slug: 'richcott-towels', name: 'Richcott Towels', group: 'Towels' },
  { slug: 'turkey-towels', name: 'Turkey Towels', group: 'Towels' },
  { slug: 'check-lungies', name: 'Check Lungies', group: 'Lungies' },
  { slug: 'richcott-lungies', name: 'Richcott Lungies', group: 'Lungies' },
  { slug: 'maharashtra-dastie', name: 'Maharashtra Dastie', group: 'Traditional Cloth' },
  { slug: 'condva', name: 'Condva', group: 'Traditional Cloth' },
  { slug: 'khadhi-long-cloth', name: 'Khadhi Long Cloth', group: 'Traditional Cloth' },
  { slug: 'deeksha-cloth', name: 'Deeksha Cloth', group: 'Traditional Cloth' },
  { slug: 'panchagajam-dhoties', name: 'Panchagajam Dhoties', group: 'Dhoties' },
  { slug: 'pooja-dhoties', name: 'Pooja Dhoties', group: 'Dhoties' },
  { slug: 'sanmaan-shawls', name: 'Sanmaan Shawls', group: 'Shawls' },
];

async function runVerification() {
  console.log('----------------------------------------------------');
  console.log(' SRI RAJA RAJESHWARA HANDLOOM — DATABASE VERIFIER');
  console.log(' Target Project:', url);
  console.log('----------------------------------------------------\n');

  let allPassed = true;

  // 1. Verify Tables
  console.log('1. Verifying 10 Expected Tables:');
  const missingTables = [];
  for (const table of EXPECTED_TABLES) {
    const { error } = await supabase.from(table).select('*').limit(0);
    if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache'))) {
      console.log(`   ❌ Table '${table}' NOT FOUND in Supabase database`);
      missingTables.push(table);
      allPassed = false;
    } else if (error) {
      // If error is permission-denied (42501) or RLS, the table exists!
      console.log(`   ✅ Table '${table}' exists in database (Protected by RLS: ${error.message})`);
    } else {
      console.log(`   ✅ Table '${table}' exists in database and is accessible`);
    }
  }

  if (missingTables.length > 0) {
    console.log(`\n⚠️  ${missingTables.length} tables are missing. Please execute supabase/schema.sql in the Supabase SQL Editor.`);
    console.log('   URL: https://supabase.com/dashboard/project/wrnfsrqzgnitwpimtqyp/sql/new\n');
    return;
  }

  // 2. Verify Categories
  console.log('\n2. Verifying 12 Wholesale Categories:');
  const { data: categories, count: catCount, error: catError } = await supabase
    .from('categories')
    .select('name, slug, group_name, sort_order, is_active', { count: 'exact' })
    .order('sort_order', { ascending: true });

  if (catError) {
    console.log('   ❌ Error querying categories:', catError.message);
    allPassed = false;
  } else {
    console.log(`   Total categories found: ${catCount} / 12`);
    for (const expected of EXPECTED_CATEGORIES) {
      const match = categories.find(c => c.slug === expected.slug);
      if (match) {
        console.log(`   ✅ [${match.group_name}] ${match.name} (${match.slug})`);
      } else {
        console.log(`   ❌ Missing expected category: ${expected.name} (${expected.slug})`);
        allPassed = false;
      }
    }
  }

  // 3. Verify Empty Data Tables (Products, Orders, Profiles, etc. must contain 0 rows)
  console.log('\n3. Verifying Zero Fake Data across all 9 data tables:');
  const dataTables = [
    'products',
    'orders',
    'order_items',
    'profiles',
    'addresses',
    'product_images',
    'wholesale_enquiries',
    'wishlist',
    'delivery_charge_rules'
  ];

  for (const tableName of dataTables) {
    const { data, count, error } = await supabase.from(tableName).select('*', { count: 'exact' });
    if (error) {
      console.log(`   ❌ Table '${tableName}' returned error: ${error.message}`);
      allPassed = false;
    } else {
      const rowCount = count !== null ? count : (data ? data.length : 0);
      if (rowCount === 0) {
        console.log(`   ✅ Table '${tableName}' has 0 rows (Remains empty as expected)`);
      } else {
        console.log(`   ❌ Table '${tableName}' contains unexpected rows: ${rowCount}`);
        allPassed = false;
      }
    }
  }

  // 4. Verify is_admin() Function
  console.log('\n4. Verifying is_admin() function:');
  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_admin');
  if (adminErr) {
    console.log('   ❌ is_admin() error:', adminErr.message);
    allPassed = false;
  } else if (isAdmin === false) {
    console.log('   ✅ is_admin() correctly returns false for anonymous access');
  } else {
    console.log('   ❌ is_admin() returned true for anonymous access!');
    allPassed = false;
  }

  // 5. Verify Mutation Restrictions (Anonymous cannot INSERT, UPDATE, DELETE on catalog, orders, profiles)
  console.log('\n5. Verifying Least-Privilege Mutation Restrictions for Anonymous Users:');
  
  // 5a. Blocked Catalog Insert
  const { error: catInsertErr } = await supabase.from('categories').insert({
    name: 'Unauthorized Category',
    slug: 'unauthorized-category',
    group_name: 'Test'
  });
  if (catInsertErr) {
    console.log(`   ✅ Catalog INSERT blocked: ${catInsertErr.message}`);
  } else {
    console.log('   ❌ Security failure: Catalog INSERT was permitted!');
    allPassed = false;
  }

  // 5b. Blocked Catalog Update
  const { error: catUpdateErr } = await supabase.from('categories').update({ name: 'Hacked' }).eq('slug', 'towels');
  if (catUpdateErr) {
    console.log(`   ✅ Catalog UPDATE blocked: ${catUpdateErr.message}`);
  } else {
    console.log('   ❌ Security failure: Catalog UPDATE was permitted!');
    allPassed = false;
  }

  // 5c. Blocked Catalog Delete
  const { error: catDeleteErr } = await supabase.from('categories').delete().eq('slug', 'towels');
  if (catDeleteErr) {
    console.log(`   ✅ Catalog DELETE blocked: ${catDeleteErr.message}`);
  } else {
    console.log('   ❌ Security failure: Catalog DELETE was permitted!');
    allPassed = false;
  }

  // 5d. Blocked Profile Insert
  const { error: profileInsertErr } = await supabase.from('profiles').insert({
    id: '00000000-0000-0000-0000-000000000000',
    full_name: 'Fake User',
    phone: '9999999999',
    email: 'fake@example.com'
  });
  if (profileInsertErr) {
    console.log(`   ✅ Profile INSERT blocked: ${profileInsertErr.message}`);
  } else {
    console.log('   ❌ Security failure: Profile INSERT was permitted!');
    allPassed = false;
  }

  // 5e. Blocked Order Insert without auth
  const { error: orderInsertErr } = await supabase.from('orders').insert({
    order_number: 'FAKE-ORDER-999',
    subtotal: 1000,
    grand_total: 1000
  });
  if (orderInsertErr) {
    console.log(`   ✅ Order INSERT blocked/restricted: ${orderInsertErr.message}`);
  } else {
    console.log('   ❌ Security failure: Order INSERT was permitted!');
    allPassed = false;
  }

  console.log('\n----------------------------------------------------');
  console.log(allPassed ? '🎉 ALL 14 DATABASE & SECURITY VERIFICATIONS PASSED!' : '⚠️ DATABASE VERIFICATION FAILED');
  console.log('----------------------------------------------------');
}

runVerification().catch(console.error);
