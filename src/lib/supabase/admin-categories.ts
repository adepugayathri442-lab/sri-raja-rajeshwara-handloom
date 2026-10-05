/**
 * Supabase Admin Category Management Service
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Provides authenticated operations for:
 * - Listing all categories with live product counts
 * - Adding new wholesale categories
 * - Editing category name, slug, group, description, and sort order
 * - Activating / deactivating categories with safety checks
 * - Safe deletion (restricted if products are attached)
 */

import { createClient } from './client';
import type { CategoryRow, Database } from '@/types';

export interface AdminCategoryItem extends CategoryRow {

  productCount: number;
}

export interface AdminCategoryInput {
  name: string;
  slug: string;
  group_name: string;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

/**
 * Fetch all categories with real product counts
 */
export async function getAdminCategories(): Promise<AdminCategoryItem[]> {
  try {
    const supabase = createClient();
    if (!supabase) return [];

    // Query categories with products count
    const { data, error } = await supabase
      .from('categories')
      .select('*, products(id)')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('Failed to fetch admin categories:', error);
      return [];
    }

    return data.map((c) => {
      const productsArr = Array.isArray(c.products) ? c.products : [];
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        group_name: c.group_name,
        description: c.description,
        image_url: c.image_url,
        is_active: c.is_active,
        sort_order: c.sort_order,
        created_at: c.created_at,
        updated_at: c.updated_at,
        productCount: productsArr.length,
      };
    });
  } catch (err) {
    console.error('Error in getAdminCategories:', err);
    return [];
  }
}

/**
 * Create a new wholesale category
 */
export async function createCategory(
  input: AdminCategoryInput
): Promise<{ success: boolean; category?: CategoryRow; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    const cleanName = input.name.trim();
    const cleanSlug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const cleanGroup = input.group_name.trim();

    if (!cleanName) return { success: false, error: 'Category name is required' };
    if (!cleanSlug) return { success: false, error: 'Valid category slug is required' };
    if (!cleanGroup) return { success: false, error: 'Group name is required' };

    // Check slug uniqueness
    const { data: existingSlug } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (existingSlug) {
      return { success: false, error: `Category with slug "${cleanSlug}" already exists.` };
    }

    // Check name uniqueness
    const { data: existingName } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', cleanName)
      .maybeSingle();

    if (existingName) {
      return { success: false, error: `Category with name "${cleanName}" already exists.` };
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: cleanName,
        slug: cleanSlug,
        group_name: cleanGroup,
        description: input.description?.trim() || null,
        sort_order: Number(input.sort_order ?? 0),
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, category: data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create category',
    };
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(
  id: string,
  input: Partial<AdminCategoryInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    const updatePayload: Database['public']['Tables']['categories']['Update'] = {
      updated_at: new Date().toISOString(),
    };


    if (input.name !== undefined) {
      const cleanName = input.name.trim();
      if (!cleanName) return { success: false, error: 'Category name cannot be empty' };
      updatePayload.name = cleanName;

      // Check name uniqueness
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', cleanName)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return { success: false, error: `Another category with name "${cleanName}" already exists.` };
      }
    }

    if (input.slug !== undefined) {
      const cleanSlug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      if (!cleanSlug) return { success: false, error: 'Category slug cannot be empty' };
      updatePayload.slug = cleanSlug;

      // Check slug uniqueness
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', cleanSlug)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return { success: false, error: `Another category with slug "${cleanSlug}" already exists.` };
      }
    }

    if (input.group_name !== undefined) {
      const cleanGroup = input.group_name.trim();
      if (!cleanGroup) return { success: false, error: 'Group name cannot be empty' };
      updatePayload.group_name = cleanGroup;
    }

    if (input.description !== undefined) {
      updatePayload.description = input.description?.trim() || null;
    }

    if (input.sort_order !== undefined) {
      updatePayload.sort_order = Number(input.sort_order);
    }

    if (input.is_active !== undefined) {
      updatePayload.is_active = input.is_active;
    }

    const { error } = await supabase
      .from('categories')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update category',
    };
  }
}

/**
 * Toggle category active status
 */
export async function toggleCategoryActive(
  id: string,
  newStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    const { error } = await supabase
      .from('categories')
      .update({
        is_active: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to toggle category status',
    };
  }
}

/**
 * Delete category safely (only allowed if zero products reference it)
 */
export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    // Check if category has any products attached
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) {
      return { success: false, error: 'Could not verify category dependencies.' };
    }

    if (count && count > 0) {
      return {
        success: false,
        error: `Cannot delete this category because it contains ${count} product(s). Please reassign or delete the products first, or deactivate the category instead.`,
      };
    }

    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete category',
    };
  }
}
