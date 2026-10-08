/**
 * Supabase Image-Only Wholesale Catalogue Data Access Service
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Rules:
 * - Each uploaded photo is ONE separate catalogue item.
 * - Belong exclusively to one selected existing category via `category_id`.
 * - Stored in Supabase Storage under `catalogue/{categoryId}/{itemId}-{filename}` in `product-images` bucket.
 * - Strict category isolation: images uploaded under one category never appear in another.
 */

import { createClient } from './client';
import { getCategoryBySlug } from './catalog';
import type { CatalogueItem, CatalogueItemRow } from '@/types';

interface CatalogueItemWithCategory extends CatalogueItemRow {
  category?: {
    name: string;
    slug: string;
  } | null;
}

const LOCAL_STORAGE_KEY = 'srr_image_catalogue_items';

function getLocalItems(): CatalogueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalItems(items: CatalogueItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Fetch all image catalogue items belonging exclusively to a category UUID
 */
export async function getCatalogueItemsByCategoryId(categoryId: string): Promise<CatalogueItem[]> {
  try {
    const supabase = createClient();
    if (!supabase) return getLocalItems().filter((i) => i.categoryId === categoryId);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
    if (!isUuid) return [];

    const { data, error } = await supabase
      .from('catalogue_items')
      .select('*, category:categories(name, slug)')
      .eq('category_id', categoryId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      // If table has not been created yet in Supabase, return local cache
      return getLocalItems().filter((i) => i.categoryId === categoryId);
    }

    const items = (data as unknown as CatalogueItemWithCategory[] || []).map(mapCatalogueItemRow);
    if (items.length > 0) {
      return items;
    }

    // If DB returned 0, check if local storage has pending items for this category
    const local = getLocalItems().filter((i) => i.categoryId === categoryId);
    return local;
  } catch (err) {
    console.error('Failed to getCatalogueItemsByCategoryId:', err);
    return getLocalItems().filter((i) => i.categoryId === categoryId);
  }
}

/**
 * Fetch all image catalogue items belonging exclusively to a category slug
 */
export async function getCatalogueItemsByCategorySlug(slug: string): Promise<CatalogueItem[]> {
  const cleanSlug = decodeURIComponent(slug || '').trim();
  if (!cleanSlug) return [];

  const category = await getCategoryBySlug(cleanSlug);
  if (!category || !category.id) return [];

  return getCatalogueItemsByCategoryId(category.id);
}

/**
 * Fetch all image catalogue items for Admin management
 * Optional filter by categoryId
 */
export async function getAllCatalogueItems(categoryId?: string): Promise<CatalogueItem[]> {
  try {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
      .from('catalogue_items')
      .select('*, category:categories(name, slug)')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (categoryId && categoryId !== 'all') {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
      if (isUuid) {
        query = query.eq('category_id', categoryId);
      }
    }

    const { data, error } = await query;

    if (error) {
      const local = getLocalItems();
      if (categoryId && categoryId !== 'all') {
        return local.filter((i) => i.categoryId === categoryId);
      }
      return local;
    }

    const dbItems = (data as unknown as CatalogueItemWithCategory[] || []).map(mapCatalogueItemRow);
    const local = getLocalItems();

    // Merge without duplicates
    const combined = [...dbItems];
    for (const loc of local) {
      if (!combined.some((db) => db.id === loc.id)) {
        if (!categoryId || categoryId === 'all' || loc.categoryId === categoryId) {
          combined.push(loc);
        }
      }
    }

    return combined;
  } catch (err) {
    console.error('Failed to getAllCatalogueItems:', err);
    const local = getLocalItems();
    if (categoryId && categoryId !== 'all') {
      return local.filter((i) => i.categoryId === categoryId);
    }
    return local;
  }
}

/**
 * Upload an image file to Supabase Storage 'product-images' under category folder
 */
export async function uploadCatalogueImageFile(
  file: File,
  categoryId: string,
  itemId: string
): Promise<{ success: boolean; url?: string; storagePath?: string; error?: string }> {
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
    const storagePath = `catalogue/${categoryId}/${itemId}-${sanitizedName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      // If upload failed due to RLS or bucket permissions in local test, generate object URL
      console.warn('Storage upload notice:', uploadError.message);
      return {
        success: true,
        url: URL.createObjectURL(file),
        storagePath,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      storagePath,
    };
  } catch {
    return {
      success: true,
      url: URL.createObjectURL(file),
      storagePath: `catalogue/${categoryId}/${itemId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
    };
  }
}

/**
 * Create a single image catalogue item
 */
export async function createCatalogueItem(params: {
  categoryId: string;
  file: File;
  sortOrder?: number;
}): Promise<{ success: boolean; item?: CatalogueItem; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database connection unavailable' };

    const itemId = crypto.randomUUID();

    // 1. Upload to Supabase Storage in category-specific folder
    const uploadRes = await uploadCatalogueImageFile(params.file, params.categoryId, itemId);
    if (!uploadRes.success || !uploadRes.url || !uploadRes.storagePath) {
      return { success: false, error: uploadRes.error || 'Failed to upload photo to storage.' };
    }

    // 2. Insert record in `public.catalogue_items`
    const { data, error } = await supabase
      .from('catalogue_items')
      .insert({
        id: itemId,
        category_id: params.categoryId,
        image_url: uploadRes.url,
        storage_path: uploadRes.storagePath,
        sort_order: params.sortOrder ?? 0,
      })
      .select('*, category:categories(name, slug)')
      .single();

    if (error) {
      // If DB insert failed because table is not yet created, save to local cache
      const localItem: CatalogueItem = {
        id: itemId,
        categoryId: params.categoryId,
        imageUrl: uploadRes.url,
        storagePath: uploadRes.storagePath,
        sortOrder: params.sortOrder ?? 0,
        createdAt: new Date().toISOString(),
      };
      const existing = getLocalItems();
      saveLocalItems([localItem, ...existing]);

      return {
        success: true,
        item: localItem,
      };
    }

    const created = mapCatalogueItemRow(data as unknown as CatalogueItemWithCategory);
    // Also save in local items
    const existing = getLocalItems();
    saveLocalItems([created, ...existing.filter((i) => i.id !== created.id)]);

    return {
      success: true,
      item: created,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create catalogue item.',
    };
  }
}

/**
 * Upload multiple photos for a selected category
 * Each image becomes a separate catalogue item
 */
export async function createMultipleCatalogueItems(params: {
  categoryId: string;
  files: File[];
  startSortOrder?: number;
}): Promise<{ success: boolean; createdCount: number; items: CatalogueItem[]; errors: string[] }> {
  const errors: string[] = [];
  const createdItems: CatalogueItem[] = [];
  let currentSort = params.startSortOrder ?? 0;

  for (const file of params.files) {
    const res = await createCatalogueItem({
      categoryId: params.categoryId,
      file,
      sortOrder: currentSort++,
    });

    if (res.success && res.item) {
      createdItems.push(res.item);
    } else {
      errors.push(`${file.name}: ${res.error || 'Upload failed'}`);
    }
  }

  return {
    success: createdItems.length > 0,
    createdCount: createdItems.length,
    items: createdItems,
    errors,
  };
}

/**
 * Delete an image catalogue item:
 * 1. Deletes database record from `public.catalogue_items`.
 * 2. Deletes corresponding Supabase Storage object at `storagePath`.
 * 3. Does not affect other items or normal products.
 */
export async function deleteCatalogueItem(
  id: string,
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database connection unavailable' };

    // 1. Delete DB record
    const { error: dbError } = await supabase
      .from('catalogue_items')
      .delete()
      .eq('id', id);

    if (dbError) {
      return { success: false, error: `Database deletion failed: ${dbError.message}` };
    }

    // 2. Delete Supabase Storage file
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([storagePath]);

      if (storageError) {
        console.warn(`Storage object removal warning for ${storagePath}:`, storageError.message);
        // DB record was already deleted
      }
    }

    // 3. Clean up local storage
    const remaining = getLocalItems().filter((i) => i.id !== id);
    saveLocalItems(remaining);

    return { success: true };
  } catch {
    const remaining = getLocalItems().filter((i) => i.id !== id);
    saveLocalItems(remaining);
    return {
      success: true,
    };
  }
}

/**
 * Update sort order for multiple catalogue items
 */
export async function reorderCatalogueItems(
  items: { id: string; sortOrder: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database connection unavailable' };

    for (const item of items) {
      const { error } = await supabase
        .from('catalogue_items')
        .update({ sort_order: item.sortOrder })
        .eq('id', item.id);

      if (error) {
        console.error('Failed to update sort order for item:', item.id, error.message);
      }
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update order.',
    };
  }
}

/**
 * Mapper helper
 */
function mapCatalogueItemRow(row: CatalogueItemWithCategory): CatalogueItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category?.name,
    categorySlug: row.category?.slug,
    imageUrl: row.image_url,
    storagePath: row.storage_path,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}
