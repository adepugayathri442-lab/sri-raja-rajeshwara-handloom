import { supabase } from './supabase';
import { WHOLESALE_CATEGORIES, MobileCategory } from '../config/categories';

export interface MobileProduct {
  id: string;
  name: string;
  slug: string;
  product_code: string;
  price_per_piece: number | null;
  stock_quantity: number;
  stock_status?: 'full' | 'limited' | 'out_of_stock';
  description: string;
  image_url: string | null;
  category_id: string;
  is_active: boolean;
  price_visible?: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
    group_name: string;
  } | null;
  product_images?: Array<{
    id: string;
    image_url: string;
    sort_order: number;
  }>;
}

export interface FetchProductsFilter {
  categorySlug?: string;
  search?: string;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'name-asc';
}

/**
 * Fetch all active categories from Supabase, with offline fallback
 */
export async function getCategories(): Promise<MobileCategory[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return WHOLESALE_CATEGORIES;
    }

    return data.map((cat) => {
      const match = WHOLESALE_CATEGORIES.find((c) => c.slug === cat.slug);
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        groupName: (cat.group_name as MobileCategory['groupName']) || match?.groupName || 'Traditional Cloth',
        description: cat.description || match?.description || '',
        wholesaleHighlight: match?.wholesaleHighlight || '100% Wholesale piece rate',
        iconName: match?.iconName || 'layers-outline',
        sortOrder: cat.sort_order || match?.sortOrder || 1,
      };
    });
  } catch (err) {
    console.warn('Error fetching Supabase categories:', err);
    return WHOLESALE_CATEGORIES;
  }
}

/**
 * Fetch active products from Supabase
 */
export async function getProducts(filters?: FetchProductsFilter): Promise<MobileProduct[]> {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug, group_name),
        product_images(id, image_url, sort_order)
      `)
      .eq('is_active', true);

    if (filters?.categorySlug) {
      // Find category id for this slug
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', filters.categorySlug)
        .maybeSingle();

      if (catData) {
        query = query.eq('category_id', catData.id);
      }
    }

    if (filters?.search) {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`name.ilike.${term},product_code.ilike.${term},description.ilike.${term}`);
    }

    if (filters?.sortBy === 'price-asc') {
      query = query.order('price_per_piece', { ascending: true });
    } else if (filters?.sortBy === 'price-desc') {
      query = query.order('price_per_piece', { ascending: false });
    } else if (filters?.sortBy === 'name-asc') {
      query = query.order('name', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error querying products from Supabase:', error.message);
      return [];
    }

    return (data as MobileProduct[]) || [];
  } catch (err) {
    console.warn('Error in getProducts:', err);
    return [];
  }
}

/**
 * Fetch single product by id with image gallery
 */
export async function getProductById(id: string): Promise<MobileProduct | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug, group_name),
        product_images(id, image_url, sort_order)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return data as MobileProduct;
  } catch (err) {
    console.warn('Error fetching product by ID:', err);
    return null;
  }
}
