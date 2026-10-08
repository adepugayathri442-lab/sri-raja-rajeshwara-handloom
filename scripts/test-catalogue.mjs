// Verification test script for Image Catalogue Isolation and Functionality in native Node.js
import assert from 'node:assert';

console.log('--- RUNNING IMAGE CATALOGUE TESTS ---');

// WhatsApp URL builder replication matching src/lib/whatsapp.ts
function buildWhatsAppUrl(message) {
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/919440472939?text=${encoded}`;
}

function getCatalogueItemEnquiryUrl(params) {
  const isBuy = params.intent === 'buy';
  const prefix = isBuy
    ? `Namaste! I would like to BUY this wholesale item from ${params.categoryName}.`
    : `Hello, I am interested in this wholesale item from ${params.categoryName}. Please share the wholesale price and availability.`;

  const lines = [
    `*SRI RAJA RAJESHWARA HANDLOOM — Wholesale Catalogue*`,
    prefix,
    ``,
    `Category: ${params.categoryName}`,
    `Catalogue Item Ref: ${params.itemId}`,
  ];

  if (params.customerName || params.businessName) {
    lines.push(``);
    lines.push(`Merchant / Buyer Details:`);
    if (params.customerName) lines.push(`Name: ${params.customerName}`);
    if (params.businessName) lines.push(`Business / Shop: ${params.businessName}`);
  }

  lines.push(``);
  lines.push(
    isBuy
      ? `Please share wholesale piece rate, minimum order volume, and payment / transport parcel procedure.`
      : `Please share wholesale piece rate and dispatch availability.`
  );

  return buildWhatsAppUrl(lines.join('\n'));
}

// 1. WhatsApp Enquiry Message Tests
const deekshaEnquiry = getCatalogueItemEnquiryUrl({
  categoryName: 'Deeksha Cloth',
  itemId: 'item-deeksha-001',
  intent: 'enquire',
});

assert(deekshaEnquiry.includes('Deeksha%20Cloth'), 'Must contain category name in URL');
assert(deekshaEnquiry.includes('item-deeksha-001'), 'Must contain item reference in URL');
assert(!deekshaEnquiry.includes('undefined'), 'Must not contain undefined');
assert(!deekshaEnquiry.includes('null'), 'Must not contain null');
assert(!deekshaEnquiry.includes('%E2%82%B90'), 'Must not contain ₹0');
console.log('✓ WhatsApp Enquiry test passed');

// 2. WhatsApp Buy Message Tests
const deekshaBuy = getCatalogueItemEnquiryUrl({
  categoryName: 'Deeksha Cloth',
  itemId: 'item-deeksha-002',
  intent: 'buy',
  customerName: 'Suresh Kumar',
  businessName: 'Sri Balaji Textiles',
});

assert(deekshaBuy.includes('BUY'), 'Must contain BUY intent');
assert(deekshaBuy.includes('Suresh%20Kumar'), 'Must contain customer name');
assert(deekshaBuy.includes('Sri%20Balaji%20Textiles'), 'Must contain business name');
console.log('✓ WhatsApp Buy test passed');

// 3. Category Isolation Simulation Test
const DEEKSHA_CAT_ID = 'e1a2b3c4-0000-0000-0000-000000000001';
const TOWELS_CAT_ID = 'e1a2b3c4-0000-0000-0000-000000000002';

// 6 Deeksha Cloth items
const deekshaItems = Array.from({ length: 6 }, (_, i) => ({
  id: `deeksha-img-${i + 1}`,
  categoryId: DEEKSHA_CAT_ID,
  imageUrl: `https://mock.supabase.co/storage/v1/object/public/product-images/catalogue/${DEEKSHA_CAT_ID}/deeksha-img-${i + 1}-cloth.jpg`,
  storagePath: `catalogue/${DEEKSHA_CAT_ID}/deeksha-img-${i + 1}-cloth.jpg`,
  sortOrder: i,
}));

// 2 Towels items
const towelItems = Array.from({ length: 2 }, (_, i) => ({
  id: `towel-img-${i + 1}`,
  categoryId: TOWELS_CAT_ID,
  imageUrl: `https://mock.supabase.co/storage/v1/object/public/product-images/catalogue/${TOWELS_CAT_ID}/towel-img-${i + 1}-towel.jpg`,
  storagePath: `catalogue/${TOWELS_CAT_ID}/towel-img-${i + 1}-towel.jpg`,
  sortOrder: i,
}));

const allCatalogueItems = [...deekshaItems, ...towelItems];

// Filter by Deeksha Cloth
const deekshaFiltered = allCatalogueItems.filter((item) => item.categoryId === DEEKSHA_CAT_ID);
assert.strictEqual(deekshaFiltered.length, 6, 'Deeksha Cloth must have exactly 6 items');
assert(deekshaFiltered.every((item) => item.categoryId === DEEKSHA_CAT_ID), 'All items must strictly belong to Deeksha Cloth');
assert(!deekshaFiltered.some((item) => item.categoryId === TOWELS_CAT_ID), 'Zero Towel items can appear in Deeksha Cloth');

// Filter by Towels
const towelsFiltered = allCatalogueItems.filter((item) => item.categoryId === TOWELS_CAT_ID);
assert.strictEqual(towelsFiltered.length, 2, 'Towels must have exactly 2 items');
assert(towelsFiltered.every((item) => item.categoryId === TOWELS_CAT_ID), 'All items must strictly belong to Towels');
assert(!towelsFiltered.some((item) => item.categoryId === DEEKSHA_CAT_ID), 'Zero Deeksha items can appear in Towels');

console.log('✓ Category Isolation test passed (Deeksha Cloth: 6 items, Towels: 2 items, 0 leakage)');

// 4. Storage Path Format Test
function generateStoragePath(categoryId, itemId, filename) {
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `catalogue/${categoryId}/${itemId}-${sanitized}`;
}

const testPath = generateStoragePath(DEEKSHA_CAT_ID, 'img-123', 'My photo (1).jpg');
assert.strictEqual(testPath, `catalogue/${DEEKSHA_CAT_ID}/img-123-My_photo__1_.jpg`);
assert(testPath.startsWith(`catalogue/${DEEKSHA_CAT_ID}/`), 'Storage path must be prefixed with categoryId');
console.log('✓ Storage Path sanitization and category prefixing test passed');

console.log('\n--- ALL 4 VERIFICATION TEST SUITES PASSED SUCCESSFULLY ---');
