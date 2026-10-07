/**
 * Supabase Wholesale Catalog Data Access Service
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Provides typed, safe, read-only queries for:
 * - Categories (12 finalized wholesale categories grouped into 5 families)
 * - Products (Fixed piece rate wholesale catalogue)
 * - Product Details (Images, category relations, stock levels)
 */

import { createClient } from './client';
import type { CategoryRow, ProductRow, ProductImageRow, Product, StockStatus } from '@/types';
import { WHOLESALE_CATEGORIES } from '@/config/categories';

export interface CategoryWithCount extends CategoryRow {
  product_count?: number;
}

export interface ProductWithRelations extends ProductRow {
  category?: CategoryRow | null;
  product_images?: ProductImageRow[];
}

export interface GetProductsOptions {
  categorySlug?: string;
  categoryGroup?: string;
  search?: string;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'default';
  limit?: number;
  offset?: number;
  inStockOnly?: boolean;
}

/**
 * Fetch all active wholesale categories ordered by sort_order
 */
export async function getCategories(): Promise<CategoryRow[]> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return getFallbackCategories();
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return getFallbackCategories();
    }

    return data;
  } catch (err) {
    console.error('Error fetching categories from Supabase:', err);
    return getFallbackCategories();
  }
}

/**
 * Fetch a single category by its URL slug
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  const cleanSlug = decodeURIComponent(slug || '').trim();
  if (!cleanSlug) return null;

  try {
    const supabase = createClient();
    if (!supabase) {
      return getStaticCategoryFallback(cleanSlug);
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);

    let query = supabase
      .from('categories')
      .select('*')
      .eq('is_active', true);

    if (isUuid) {
      query = query.or(`id.eq.${cleanSlug},slug.ilike.${cleanSlug}`);
    } else {
      query = query.or(`slug.ilike.${cleanSlug},name.ilike.${cleanSlug}`);
    }

    const { data, error } = await query.limit(1).maybeSingle();

    if (data && !error) {
      return data;
    }

    // Try finding by matching static category name in database
    const staticMatch = WHOLESALE_CATEGORIES.find(
      (c) => c.slug.toLowerCase() === cleanSlug.toLowerCase() || c.name.toLowerCase() === cleanSlug.toLowerCase()
    );
    if (staticMatch) {
      const { data: dbByName } = await supabase
        .from('categories')
        .select('*')
        .ilike('name', staticMatch.name)
        .limit(1)
        .maybeSingle();

      if (dbByName) return dbByName;
    }

    return getStaticCategoryFallback(cleanSlug);
  } catch (err) {
    console.error(`Error fetching category with slug ${slug}:`, err);
    return getStaticCategoryFallback(cleanSlug);
  }
}

/**
 * Fetch wholesale products with filtering, searching, and sorting
 */
export async function getProducts(options: GetProductsOptions = {}): Promise<{
  products: Product[];
  totalCount: number;
}> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return { products: [], totalCount: 0 };
    }

    let query = supabase
      .from('products')
      .select('*, category:categories(*), product_images(*)', { count: 'exact' })
      .eq('is_active', true);

    // Filter by Category Slug: strictly resolve to a valid UUID foreign key
    if (options.categorySlug && options.categorySlug !== 'all') {
      const cleanCatSlug = decodeURIComponent(options.categorySlug).trim();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanCatSlug);

      let targetCategoryId: string | null = null;
      if (isUuid) {
        targetCategoryId = cleanCatSlug;
      } else {
        const { data: dbCat } = await supabase
          .from('categories')
          .select('id')
          .or(`slug.ilike.${cleanCatSlug},name.ilike.${cleanCatSlug}`)
          .limit(1)
          .maybeSingle();

        if (dbCat?.id) {
          targetCategoryId = dbCat.id;
        } else {
          const staticMatch = WHOLESALE_CATEGORIES.find(
            (c) => c.slug.toLowerCase() === cleanCatSlug.toLowerCase() || c.name.toLowerCase() === cleanCatSlug.toLowerCase()
          );
          if (staticMatch) {
            const { data: dbByName } = await supabase
              .from('categories')
              .select('id')
              .ilike('name', staticMatch.name)
              .limit(1)
              .maybeSingle();
            if (dbByName?.id) {
              targetCategoryId = dbByName.id;
            }
          }
        }
      }

      if (targetCategoryId) {
        query = query.eq('category_id', targetCategoryId);
      } else {
        // Category does not exist in database, return 0 products safely without crashing Postgres
        return { products: [], totalCount: 0 };
      }
    }

    // Filter by Stock Availability
    if (options.inStockOnly) {
      query = query.gt('stock_quantity', 0);
    }

    // Search by product name, product code, or description
    if (options.search && options.search.trim()) {
      const term = options.search.trim();
      query = query.or(`name.ilike.%${term}%,product_code.ilike.%${term}%,description.ilike.%${term}%`);
    }

    // Sorting
    switch (options.sortBy) {
      case 'price-asc':
        query = query.order('price_per_piece', { ascending: true });
        break;
      case 'price-desc':
        query = query.order('price_per_piece', { ascending: false });
        break;
      case 'name-asc':
        query = query.order('name', { ascending: true });
        break;
      case 'newest':
      case 'default':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Pagination
    if (options.limit) {
      const offset = options.offset || 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching products from Supabase:', error.message);
      return { products: [], totalCount: 0 };
    }

    const products: Product[] = ((data as unknown as ProductWithRelations[]) || []).map((row) =>
      mapProductRow(row)
    );

    return {
      products,
      totalCount: count ?? products.length,
    };
  } catch (err) {
    console.error('Failed to getProducts:', err);
    return { products: [], totalCount: 0 };
  }
}

/**
 * Fetch a single product by slug or UUID, including category and all image gallery items
 * Strictly loads only that specific product's own details and photos.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = createClient();
    if (!supabase) return null;

    const cleanSlug = decodeURIComponent(slug || '').trim();
    if (!cleanSlug) return null;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);

    let query = supabase
      .from('products')
      .select('*, category:categories(*), product_images(*)')
      .eq('is_active', true);

    if (isUuid) {
      query = query.or(`slug.eq.${cleanSlug},id.eq.${cleanSlug}`);
    } else {
      query = query.eq('slug', cleanSlug);
    }

    const { data, error } = await query.limit(1).maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapProductRow(data as unknown as ProductWithRelations);
  } catch (err) {
    console.error(`Error fetching product by slug ${slug}:`, err);
    return null;
  }
}

/**
 * Helper to map Supabase Product row with joined relations to Frontend Product Model
 * Guarantees photos, pricing, stock, and details belong exclusively to this individual product.
 */
function mapProductRow(row: ProductWithRelations): Product {
  const images = (row.product_images || [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((img) => img.image_url)
    .filter((url): url is string => Boolean(url && typeof url === 'string' && url.trim() !== '' && url !== 'null'));

  // If primary image_url is defined on product and not in images array, prepend it
  if (row.image_url && typeof row.image_url === 'string' && row.image_url.trim() !== '' && row.image_url !== 'null') {
    if (!images.includes(row.image_url)) {
      images.unshift(row.image_url);
    }
  }

  const primaryImage = (row.image_url && typeof row.image_url === 'string' && row.image_url.trim() !== '' && row.image_url !== 'null')
    ? row.image_url
    : images[0] || null;

  const rawPrice = row.price_per_piece !== null && row.price_per_piece !== undefined && !isNaN(Number(row.price_per_piece))
    ? Number(row.price_per_piece)
    : null;
  const hasValidPrice = rawPrice !== null && rawPrice > 0;

  return {
    id: row.id,
    productCode: row.product_code,
    name: row.name,
    slug: row.slug,
    categoryId: row.category_id,
    categoryName: row.category?.name || undefined,
    categorySlug: row.category?.slug || undefined,
    groupName: row.category?.group_name || undefined,
    pricePerPiece: hasValidPrice ? rawPrice : null,
    stockQuantity: Number(row.stock_quantity ?? 0),
    stockStatus: ((row as { stock_status?: string }).stock_status as StockStatus) ||
      (Number(row.stock_quantity ?? 0) <= 0 ? 'out_of_stock' : 'full'),
    description: row.description,
    imageUrl: primaryImage,
    images,
    isActive: Boolean(row.is_active),
    priceVisible: hasValidPrice && row.price_visible !== false,
  };
}

/**
 * Fallback category generator in case of database initialisation or offline dev
 */
function getFallbackCategories(): CategoryRow[] {
  return WHOLESALE_CATEGORIES.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    group_name: cat.groupName,
    description: cat.description,
    image_url: null,
    is_active: true,
    sort_order: cat.sortOrder,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

/**
 * Fallback single category lookup from static WHOLESALE_CATEGORIES
 */
function getStaticCategoryFallback(cleanSlug: string): CategoryRow | null {
  const fallback = WHOLESALE_CATEGORIES.find(
    (c) => c.slug.toLowerCase() === cleanSlug.toLowerCase() || c.name.toLowerCase() === cleanSlug.toLowerCase()
  );
  if (!fallback) return null;
  return {
    id: fallback.id,
    name: fallback.name,
    slug: fallback.slug,
    group_name: fallback.groupName,
    description: fallback.description,
    image_url: null,
    is_active: true,
    sort_order: fallback.sortOrder,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
