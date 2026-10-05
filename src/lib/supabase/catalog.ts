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
import type { CategoryRow, ProductRow, ProductImageRow, Product } from '@/types';
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
  try {
    const supabase = createClient();
    if (!supabase) {
      const fallback = WHOLESALE_CATEGORIES.find((c) => c.slug === slug);
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

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      const fallback = WHOLESALE_CATEGORIES.find((c) => c.slug === slug);
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

    return data;
  } catch (err) {
    console.error(`Error fetching category with slug ${slug}:`, err);
    return null;
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

    // Filter by Category Slug
    if (options.categorySlug && options.categorySlug !== 'all') {
      const category = await getCategoryBySlug(options.categorySlug);
      if (category) {
        query = query.eq('category_id', category.id);
      } else {
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
 * Fetch a single product by slug, including category and all image gallery items
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), product_images(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

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
 */
function mapProductRow(row: ProductWithRelations): Product {
  const images = (row.product_images || [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((img) => img.image_url);

  // If primary image_url is defined on product and not in images array, prepend it
  if (row.image_url && !images.includes(row.image_url)) {
    images.unshift(row.image_url);
  }

  return {
    id: row.id,
    productCode: row.product_code,
    name: row.name,
    slug: row.slug,
    categoryId: row.category_id,
    categoryName: row.category?.name || undefined,
    groupName: row.category?.group_name || undefined,
    pricePerPiece: Number(row.price_per_piece),
    stockQuantity: Number(row.stock_quantity),
    description: row.description,
    imageUrl: row.image_url || images[0] || null,
    images,
    isActive: Boolean(row.is_active),
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
