/**
 * Supabase Admin Catalog Data Access Service
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Provides authenticated admin operations for:
 * - Product dashboard KPI statistics (Total, Active, Out of Stock, Low Stock)
 * - Dynamic product list querying, filtering, and sorting
 * - Product creation, updates, and safe deletion
 * - Image uploads to 'product-images' Supabase Storage bucket
 * - Cart price & stock live validation
 */

import { createClient } from './client';
import type { CategoryRow, ProductRow, ProductImageRow } from '@/types';

export interface AdminProductStats {
  total: number;
  active: number;
  outOfStock: number;
  lowStock: number;
}

export interface AdminProductListItem {
  id: string;
  productCode: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  groupName?: string;
  pricePerPiece: number;
  stockQuantity: number;
  description: string;
  imageUrl: string | null;
  images: string[];
  isActive: boolean;
  priceVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductInput {
  name: string;
  productCode: string;
  categoryId: string;
  pricePerPiece: number;
  stockQuantity: number;
  description: string;
  isActive: boolean;
  priceVisible: boolean;
  images: Array<{
    url: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
}

export interface GetAdminProductsOptions {
  search?: string;
  categoryId?: string;
  availability?: 'all' | 'active' | 'inactive' | 'in-stock' | 'low-stock' | 'out-of-stock';
  sortBy?: 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';
}

export interface CartValidationResult {
  isValid: boolean;
  hasPriceChanges: boolean;
  hasStockIssues: boolean;
  hasInactiveItems: boolean;
  items: Array<{
    productId: string;
    productName: string;
    productCode: string;
    oldPrice: number;
    newPrice: number;
    priceChanged: boolean;
    availableStock: number;
    requestedQuantity: number;
    stockIssue: boolean;
    isActive: boolean;
    statusMessage?: string;
  }>;
}

const LOW_STOCK_THRESHOLD = 10;

/**
 * Fetch Admin Dashboard KPI statistics from live Supabase products table
 */
export async function getAdminProductStats(): Promise<AdminProductStats> {
  const defaultStats: AdminProductStats = {
    total: 0,
    active: 0,
    outOfStock: 0,
    lowStock: 0,
  };

  try {
    const supabase = createClient();
    if (!supabase) return defaultStats;

    const { data, error } = await supabase
      .from('products')
      .select('id, is_active, stock_quantity');

    if (error || !data) {
      return defaultStats;
    }

    let active = 0;
    let outOfStock = 0;
    let lowStock = 0;

    data.forEach((p) => {
      const stock = Number(p.stock_quantity ?? 0);
      if (p.is_active) active++;
      if (stock <= 0) outOfStock++;
      else if (stock <= LOW_STOCK_THRESHOLD) lowStock++;
    });

    return {
      total: data.length,
      active,
      outOfStock,
      lowStock,
    };
  } catch (err) {
    console.error('Failed to load admin product stats:', err);
    return defaultStats;
  }
}

/**
 * Fetch products list for admin table with filters and search
 */
export async function getAdminProducts(
  options: GetAdminProductsOptions = {}
): Promise<{ products: AdminProductListItem[]; total: number }> {
  try {
    const supabase = createClient();
    if (!supabase) return { products: [], total: 0 };

    let query = supabase
      .from('products')
      .select('*, category:categories(*), product_images(*)', { count: 'exact' });

    // Category filter
    if (options.categoryId && options.categoryId !== 'all') {
      query = query.eq('category_id', options.categoryId);
    }

    // Availability filter
    if (options.availability) {
      if (options.availability === 'active') {
        query = query.eq('is_active', true);
      } else if (options.availability === 'inactive') {
        query = query.eq('is_active', false);
      } else if (options.availability === 'out-of-stock') {
        query = query.lte('stock_quantity', 0);
      } else if (options.availability === 'low-stock') {
        query = query.gt('stock_quantity', 0).lte('stock_quantity', LOW_STOCK_THRESHOLD);
      } else if (options.availability === 'in-stock') {
        query = query.gt('stock_quantity', LOW_STOCK_THRESHOLD);
      }
    }

    // Search filter (name, product code, description)
    if (options.search?.trim()) {
      const q = `%${options.search.trim()}%`;
      query = query.or(`name.ilike.${q},product_code.ilike.${q},description.ilike.${q}`);
    }

    // Sorting
    switch (options.sortBy) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'name-asc':
        query = query.order('name', { ascending: true });
        break;
      case 'name-desc':
        query = query.order('name', { ascending: false });
        break;
      case 'price-asc':
        query = query.order('price_per_piece', { ascending: true });
        break;
      case 'price-desc':
        query = query.order('price_per_piece', { ascending: false });
        break;
      case 'stock-asc':
        query = query.order('stock_quantity', { ascending: true });
        break;
      case 'stock-desc':
        query = query.order('stock_quantity', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, count, error } = await query;

    if (error || !data) {
      console.error('Error fetching admin products:', error?.message);
      return { products: [], total: 0 };
    }

    type RawAdminRow = ProductRow & {
      category?: CategoryRow | null;
      product_images?: ProductImageRow[];
    };

    const products: AdminProductListItem[] = (data as unknown as RawAdminRow[]).map((row) => {
      const images = (row.product_images || [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((img) => img.image_url)
        .filter((url): url is string => Boolean(url && typeof url === 'string' && url.trim() !== '' && url !== 'null'));

      if (row.image_url && typeof row.image_url === 'string' && row.image_url.trim() !== '' && row.image_url !== 'null') {
        if (!images.includes(row.image_url)) {
          images.unshift(row.image_url);
        }
      }

      const primaryImage = (row.image_url && typeof row.image_url === 'string' && row.image_url.trim() !== '' && row.image_url !== 'null')
        ? row.image_url
        : images[0] || null;

      return {
        id: row.id,
        productCode: row.product_code,
        name: row.name,
        slug: row.slug,
        categoryId: row.category_id,
        categoryName: row.category?.name,
        groupName: row.category?.group_name,
        pricePerPiece: Number(row.price_per_piece),
        stockQuantity: Number(row.stock_quantity),
        description: row.description,
        imageUrl: primaryImage,
        images,
        isActive: Boolean(row.is_active),
        priceVisible: row.price_visible !== false,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    return {
      products,
      total: count ?? products.length,
    };
  } catch (err) {
    console.error('Failed to getAdminProducts:', err);
    return { products: [], total: 0 };
  }
}

/**
 * Fetch a single product for editing by ID
 */
export async function getAdminProductById(id: string): Promise<AdminProductListItem | null> {
  try {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), product_images(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    type RawAdminRow = ProductRow & {
      category?: CategoryRow | null;
      product_images?: ProductImageRow[];
    };

    const row = data as unknown as RawAdminRow;
    const images = (row.product_images || [])
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((img) => img.image_url)
      .filter((url): url is string => Boolean(url && typeof url === 'string' && url.trim() !== '' && url !== 'null'));

    if (row.image_url && typeof row.image_url === 'string' && row.image_url.trim() !== '' && row.image_url !== 'null') {
      if (!images.includes(row.image_url)) {
        images.unshift(row.image_url);
      }
    }

    const primaryImage = (row.image_url && typeof row.image_url === 'string' && row.image_url.trim() !== '' && row.image_url !== 'null')
      ? row.image_url
      : images[0] || null;

    return {
      id: row.id,
      productCode: row.product_code,
      name: row.name,
      slug: row.slug,
      categoryId: row.category_id,
      categoryName: row.category?.name,
      groupName: row.category?.group_name,
      pricePerPiece: Number(row.price_per_piece),
      stockQuantity: Number(row.stock_quantity),
      description: row.description,
      imageUrl: primaryImage,
      images,
      isActive: Boolean(row.is_active),
      priceVisible: row.price_visible !== false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (err) {
    console.error(`Failed to get product ${id}:`, err);
    return null;
  }
}

/**
 * Helper to generate URL-safe slug from name and product code
 */
function generateSlug(name: string, productCode: string): string {
  const base = `${name} ${productCode}`
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `product-${Date.now()}`;
}

/**
 * Create a new wholesale product in Supabase
 */
export async function createProduct(
  input: AdminProductInput
): Promise<{ success: boolean; product?: AdminProductListItem; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database connection unavailable' };

    // Validation
    const cleanCode = input.productCode.trim().toUpperCase();
    const cleanName = input.name.trim();

    if (!cleanName) return { success: false, error: 'Product name is required' };
    if (!cleanCode) return { success: false, error: 'Product code (SKU) is required' };
    if (!input.categoryId) return { success: false, error: 'Category is required' };
    if (input.pricePerPiece <= 0 || isNaN(input.pricePerPiece)) {
      return { success: false, error: 'Wholesale price per piece must be a valid positive amount' };
    }
    if (input.stockQuantity < 0 || !Number.isInteger(input.stockQuantity)) {
      return { success: false, error: 'Stock quantity must be a non-negative integer' };
    }

    // Check unique product_code
    const { data: existingCode } = await supabase
      .from('products')
      .select('id')
      .eq('product_code', cleanCode)
      .maybeSingle();

    if (existingCode) {
      return { success: false, error: `Product code "${cleanCode}" already exists. Please use a unique SKU.` };
    }

    const slug = generateSlug(cleanName, cleanCode);

    // Primary image
    const primaryImg = input.images.find((i) => i.isPrimary)?.url || input.images[0]?.url || null;

    // Insert Product
    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert({
        name: cleanName,
        product_code: cleanCode,
        slug,
        category_id: input.categoryId,
        price_per_piece: input.pricePerPiece,
        stock_quantity: input.stockQuantity,
        description: input.description.trim() || cleanName,
        image_url: primaryImg,
        is_active: input.isActive,
        price_visible: input.priceVisible !== false,
      })
      .select()
      .single();

    if (insertError || !insertedProduct) {
      return { success: false, error: insertError?.message || 'Failed to create product' };
    }

    // Insert image records into product_images
    if (input.images.length > 0) {
      const imageRecords = input.images.map((img, index) => ({
        product_id: insertedProduct.id,
        image_url: img.url,
        sort_order: img.sortOrder ?? index,
      }));

      await supabase.from('product_images').insert(imageRecords);
    }

    const fresh = await getAdminProductById(insertedProduct.id);
    return { success: true, product: fresh || undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during product creation';
    return { success: false, error: message };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string,
  input: AdminProductInput
): Promise<{ success: boolean; product?: AdminProductListItem; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database connection unavailable' };

    const cleanCode = input.productCode.trim().toUpperCase();
    const cleanName = input.name.trim();

    if (!cleanName) return { success: false, error: 'Product name is required' };
    if (!cleanCode) return { success: false, error: 'Product code is required' };
    if (!input.categoryId) return { success: false, error: 'Category is required' };
    if (input.pricePerPiece <= 0 || isNaN(input.pricePerPiece)) {
      return { success: false, error: 'Wholesale price per piece must be a valid positive amount' };
    }
    if (input.stockQuantity < 0 || !Number.isInteger(input.stockQuantity)) {
      return { success: false, error: 'Stock quantity must be a non-negative integer' };
    }

    // Check code uniqueness excluding current product
    const { data: existingCode } = await supabase
      .from('products')
      .select('id')
      .eq('product_code', cleanCode)
      .neq('id', id)
      .maybeSingle();

    if (existingCode) {
      return { success: false, error: `Product code "${cleanCode}" is already in use by another product.` };
    }

    const primaryImg = input.images.find((i) => i.isPrimary)?.url || input.images[0]?.url || null;

    // Update Product record
    const { error: updateError } = await supabase
      .from('products')
      .update({
        name: cleanName,
        product_code: cleanCode,
        category_id: input.categoryId,
        price_per_piece: input.pricePerPiece,
        stock_quantity: input.stockQuantity,
        description: input.description.trim() || cleanName,
        image_url: primaryImg,
        is_active: input.isActive,
        price_visible: input.priceVisible !== false,
      })
      .eq('id', id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Sync product images: Delete existing and reinsert with updated order
    await supabase.from('product_images').delete().eq('product_id', id);

    if (input.images.length > 0) {
      const imageRecords = input.images.map((img, index) => ({
        product_id: id,
        image_url: img.url,
        sort_order: img.sortOrder ?? index,
      }));

      await supabase.from('product_images').insert(imageRecords);
    }

    const fresh = await getAdminProductById(id);
    return { success: true, product: fresh || undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during product update';
    return { success: false, error: message };
  }
}

/**
 * Toggle product active status
 */
export async function toggleProductActive(
  id: string,
  newActiveState: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    const { error } = await supabase
      .from('products')
      .update({ is_active: newActiveState })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Toggle failed' };
  }
}

/**
 * Safe delete a product with order history safety check
 */
export async function deleteProduct(
  id: string
): Promise<{ success: boolean; error?: string; archivedInstead?: boolean }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    // Check if product is referenced in historical order items
    const { count, error: countError } = await supabase
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', id);

    if (countError) {
      console.warn('Could not check order_items count:', countError.message);
    }

    if (count && count > 0) {
      // Safely deactivate instead of permanent deletion to protect historical accounting
      await supabase.from('products').update({ is_active: false }).eq('id', id);
      return {
        success: false,
        archivedInstead: true,
        error: `Product has been ordered in ${count} past transaction(s). To protect historical order accounting, the product has been deactivated instead of deleted.`,
      };
    }

    // If safe, delete product (cascades to product_images and wishlist)
    const { error: deleteError } = await supabase.from('products').delete().eq('id', id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete product' };
  }
}

/**
 * Upload an image file to Supabase Storage 'product-images' bucket
 */
export async function uploadProductImage(
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database connection unavailable' };

    // Validate MIME type
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Please upload JPG, PNG, or WebP images.' };
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { success: false, error: 'Image exceeds 5MB limit. Please compress the image before uploading.' };
    }

    // Collision-resistant sanitized filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `products/${Date.now()}-${sanitizedName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      // Check if bucket doesn't exist
      if (uploadError.message.includes('Bucket not found')) {
        return {
          success: false,
          error: "Storage bucket 'product-images' is not configured yet in Supabase. Please run the SQL in supabase/storage.sql.",
        };
      }
      return { success: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Image upload failed. Check connection.',
    };
  }
}

/**
 * Validate Cart Items against live Supabase data before order confirmation
 * Ensures:
 * - Product still exists
 * - Product is active
 * - Price has not changed
 * - Quantity is within current stock
 */
export async function validateCartWithLiveCatalog(
  cartItems: Array<{ productId: string; pricePerPiece: number; quantity: number }>
): Promise<CartValidationResult> {
  const result: CartValidationResult = {
    isValid: true,
    hasPriceChanges: false,
    hasStockIssues: false,
    hasInactiveItems: false,
    items: [],
  };

  if (!cartItems || cartItems.length === 0) {
    return result;
  }

  try {
    const supabase = createClient();
    if (!supabase) return result;

    const ids = cartItems.map((c) => c.productId);
    const { data: liveProducts, error } = await supabase
      .from('products')
      .select('id, name, product_code, price_per_piece, stock_quantity, is_active')
      .in('id', ids);

    if (error || !liveProducts) {
      console.warn('Could not re-fetch live products for cart validation:', error?.message);
      return result;
    }

    const liveMap = new Map<string, (typeof liveProducts)[0]>();
    liveProducts.forEach((p) => liveMap.set(p.id, p));

    cartItems.forEach((cartItem) => {
      const live = liveMap.get(cartItem.productId);

      if (!live) {
        result.isValid = false;
        result.hasInactiveItems = true;
        result.items.push({
          productId: cartItem.productId,
          productName: 'Unknown Product',
          productCode: 'N/A',
          oldPrice: cartItem.pricePerPiece,
          newPrice: 0,
          priceChanged: false,
          availableStock: 0,
          requestedQuantity: cartItem.quantity,
          stockIssue: true,
          isActive: false,
          statusMessage: 'Product is no longer available in the catalogue.',
        });
        return;
      }

      const livePrice = Number(live.price_per_piece);
      const liveStock = Number(live.stock_quantity ?? 0);
      const isPriceChanged = livePrice !== cartItem.pricePerPiece;
      const isStockIssue = liveStock <= 0 || cartItem.quantity > liveStock;
      const isInactive = !live.is_active;

      if (isPriceChanged) result.hasPriceChanges = true;
      if (isStockIssue) result.hasStockIssues = true;
      if (isInactive) result.hasInactiveItems = true;
      if (isPriceChanged || isStockIssue || isInactive) result.isValid = false;

      let message = '';
      if (isInactive) {
        message = 'Product has been deactivated by merchant.';
      } else if (isStockIssue) {
        message = liveStock <= 0 ? 'Out of stock' : `Only ${liveStock} pcs available`;
      } else if (isPriceChanged) {
        message = `Price updated from ₹${cartItem.pricePerPiece} to ₹${livePrice}/pc`;
      }

      result.items.push({
        productId: cartItem.productId,
        productName: live.name,
        productCode: live.product_code,
        oldPrice: cartItem.pricePerPiece,
        newPrice: livePrice,
        priceChanged: isPriceChanged,
        availableStock: liveStock,
        requestedQuantity: cartItem.quantity,
        stockIssue: isStockIssue,
        isActive: live.is_active,
        statusMessage: message,
      });
    });

    return result;
  } catch (err) {
    console.error('Cart live validation failed:', err);
    return result;
  }
}

/**
 * Safely update stock quantity for a product directly from warehouse stock view
 */
export async function updateProductStock(
  productId: string,
  newStockQuantity: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database connection unavailable' };

    if (newStockQuantity < 0 || !Number.isInteger(newStockQuantity)) {
      return { success: false, error: 'Stock quantity must be a non-negative integer' };
    }

    const { error } = await supabase
      .from('products')
      .update({
        stock_quantity: newStockQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update stock quantity';
    return { success: false, error: message };
  }
}
