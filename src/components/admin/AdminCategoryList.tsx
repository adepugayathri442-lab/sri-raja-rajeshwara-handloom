'use client';

/**
 * Admin Category Management Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Real-time Supabase categories list with live product counts
 * - Add Category modal with validation & slug generation
 * - Edit Category modal (name, slug, group, sort order, description)
 * - Safe activation / deactivation with warning when products exist
 * - Safe deletion prevention if products are attached
 * - Group filter (Towels, Lungies, Traditional Cloth, Dhoties, Shawls, etc.)
 * - Search by category name or slug
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  RefreshCw,
  X,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  toggleCategoryActive,
  deleteCategory,
  type AdminCategoryItem,
  type AdminCategoryInput,
} from '@/lib/supabase/admin-categories';

const DEFAULT_GROUPS = [
  'Towels',
  'Lungies',
  'Traditional Cloth',
  'Dhoties',
  'Shawls',
];

export function AdminCategoryList() {
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formGroup, setFormGroup] = useState('');
  const [formCustomGroup, setFormCustomGroup] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSortOrder, setFormSortOrder] = useState('0');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Deactivation warning modal
  const [categoryToToggle, setCategoryToToggle] = useState<AdminCategoryItem | null>(null);

  // Delete modal
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Unable to load wholesale categories from database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    getAdminCategories()
      .then((data) => {
        if (!ignore) {
          setCategories(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load categories:', err);
          setError('Unable to load wholesale categories from database.');
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Distinct groups for filtering
  const distinctGroups = Array.from(
    new Set(categories.map((c) => c.group_name).filter(Boolean))
  );

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormGroup(DEFAULT_GROUPS[0]);
    setFormCustomGroup('');
    setFormDescription('');
    setFormSortOrder(String(categories.length + 1));
    setFormIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (category: AdminCategoryItem) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormSlug(category.slug);
    if (DEFAULT_GROUPS.includes(category.group_name)) {
      setFormGroup(category.group_name);
      setFormCustomGroup('');
    } else {
      setFormGroup('custom');
      setFormCustomGroup(category.group_name);
    }
    setFormDescription(category.description || '');
    setFormSortOrder(String(category.sort_order));
    setFormIsActive(category.is_active);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Slug auto-generation on name change (only when creating)
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      const slugified = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setFormSlug(slugified);
    }
  };

  // Submit Category Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const finalGroup = formGroup === 'custom' ? formCustomGroup.trim() : formGroup.trim();

    if (!formName.trim()) {
      setFormError('Category name is required.');
      return;
    }
    if (!formSlug.trim()) {
      setFormError('Category slug is required.');
      return;
    }
    if (!finalGroup) {
      setFormError('Group name is required.');
      return;
    }

    setFormSubmitting(true);

    const payload: AdminCategoryInput = {
      name: formName.trim(),
      slug: formSlug.trim().toLowerCase(),
      group_name: finalGroup,
      description: formDescription.trim() || null,
      sort_order: parseInt(formSortOrder || '0', 10),
      is_active: formIsActive,
    };

    if (editingCategory) {
      const res = await updateCategory(editingCategory.id, payload);
      setFormSubmitting(false);
      if (res.success) {
        setIsModalOpen(false);
        loadCategories();
      } else {
        setFormError(res.error || 'Failed to update category.');
      }
    } else {
      const res = await createCategory(payload);
      setFormSubmitting(false);
      if (res.success) {
        setIsModalOpen(false);
        loadCategories();
      } else {
        setFormError(res.error || 'Failed to create category.');
      }
    }
  };

  // Handle direct active/inactive toggle
  const handleToggleClick = (category: AdminCategoryItem) => {
    if (category.is_active && category.productCount > 0) {
      // Trigger warning dialog
      setCategoryToToggle(category);
    } else {
      executeToggle(category.id, !category.is_active);
    }
  };

  const executeToggle = async (id: string, newStatus: boolean) => {
    // Optimistic UI update
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: newStatus } : c))
    );

    const res = await toggleCategoryActive(id, newStatus);
    if (!res.success) {
      alert(`Could not toggle category: ${res.error}`);
      loadCategories();
    }
    setCategoryToToggle(null);
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    const res = await deleteCategory(categoryToDelete.id);
    setIsDeleting(false);

    if (res.success) {
      setCategoryToDelete(null);
      loadCategories();
    } else {
      setDeleteError(res.error || 'Failed to delete category.');
    }
  };

  // Filtered categories
  const filtered = categories.filter((c) => {
    const matchesSearch =
      search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      c.group_name.toLowerCase().includes(search.toLowerCase());

    const matchesGroup =
      selectedGroup === 'all' || c.group_name === selectedGroup;

    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted mb-1">
            <Link href="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <span className="text-primary font-medium">Categories</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            Wholesale Categories Management
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Organize textile lines into wholesale families, configure sort orders, and manage catalogue availability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCategories}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add Category
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="default" className="p-4 bg-surface border-border">
          <span className="text-xs text-muted font-medium block">Total Categories</span>
          <div className="text-2xl font-serif font-bold text-primary mt-1">
            {categories.length}
          </div>
          <span className="text-[10px] text-muted">Across all textile families</span>
        </Card>

        <Card variant="default" className="p-4 bg-surface border-border">
          <span className="text-xs text-emerald-800 font-medium block">Active Categories</span>
          <div className="text-2xl font-serif font-bold text-emerald-800 mt-1">
            {categories.filter((c) => c.is_active).length}
          </div>
          <span className="text-[10px] text-emerald-700">Visible on storefront</span>
        </Card>

        <Card variant="default" className="p-4 bg-surface border-border">
          <span className="text-xs text-amber-800 font-medium block">Inactive Categories</span>
          <div className="text-2xl font-serif font-bold text-amber-800 mt-1">
            {categories.filter((c) => !c.is_active).length}
          </div>
          <span className="text-[10px] text-amber-700">Hidden from storefront</span>
        </Card>

        <Card variant="default" className="p-4 bg-surface border-border">
          <span className="text-xs text-muted font-medium block">Textile Groups</span>
          <div className="text-2xl font-serif font-bold text-primary mt-1">
            {distinctGroups.length}
          </div>
          <span className="text-[10px] text-muted">Core textile classifications</span>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card variant="default" className="p-4 sm:p-5 border-border bg-surface shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category by name, slug, or group..."
              className="w-full pl-9 pr-9 py-2 bg-surface-subtle border border-border rounded-lg text-xs text-charcoal focus:border-accent focus:bg-surface outline-none transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Group Filter */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              aria-label="Filter by Textile Group"
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-xs text-charcoal font-medium focus:border-accent outline-none cursor-pointer"
            >
              <option value="all">All Groups ({distinctGroups.length})</option>
              {distinctGroups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {(search || selectedGroup !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setSelectedGroup('all');
              }}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="text-[11px] text-muted pt-1 flex items-center justify-between">
          <span>
            Showing <strong className="text-primary">{filtered.length}</strong> of {categories.length} categories
          </span>
          <span className="text-[10px] text-muted italic">
            Ordered by sort sequence
          </span>
        </div>
      </Card>

      {/* Content */}
      {isLoading ? (
        <Card variant="default" className="p-12 text-center border-border">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-muted">Loading wholesale categories from Supabase...</p>
        </Card>
      ) : error ? (
        <Card variant="default" className="p-8 text-center border-rose-200 bg-rose-50/40">
          <p className="text-xs text-rose-700">{error}</p>
          <Button variant="outline" size="sm" onClick={loadCategories} className="mt-3">
            Retry
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card variant="default" className="p-12 text-center border-border">
          <FolderTree className="w-10 h-10 text-muted/60 mx-auto mb-3" />
          <h2 className="text-base font-serif font-bold text-primary">No categories found</h2>
          <p className="text-xs text-muted max-w-sm mx-auto mt-1">
            {search || selectedGroup !== 'all'
              ? 'Try modifying your search or filter parameters.'
              : 'Add your first wholesale category using the button above.'}
          </p>
        </Card>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-muted font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 text-center w-14">Order</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Products</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-cream/40 transition-colors">
                    {/* Sort Order */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-primary">
                      #{cat.sort_order}
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-charcoal block">
                        {cat.name}
                      </span>
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted">
                      {cat.slug}
                    </td>

                    {/* Group */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                        {cat.group_name}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 text-muted max-w-xs truncate" title={cat.description || ''}>
                      {cat.description || '—'}
                    </td>

                    {/* Product count */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          cat.productCount > 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-surface-subtle text-muted border border-border'
                        }`}
                      >
                        <Package className="w-3 h-3" />
                        <span>{cat.productCount} pcs lines</span>
                      </span>
                    </td>

                    {/* Active Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleClick(cat)}
                        title={cat.is_active ? 'Click to Deactivate' : 'Click to Activate'}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                          cat.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          title="Edit Category"
                          className="p-1.5 text-muted hover:text-primary rounded hover:bg-surface-subtle transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(cat)}
                          title="Delete Category"
                          className="p-1.5 text-muted hover:text-rose-600 rounded hover:bg-surface-subtle transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-accent" />
                <h3 className="font-serif font-bold text-lg text-primary">
                  {editingCategory ? 'Edit Category' : 'Add Wholesale Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-charcoal p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Category Name */}
              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Turkey Towels"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:border-accent focus:bg-surface outline-none"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. turkey-towels"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal font-mono text-[11px] focus:border-accent focus:bg-surface outline-none"
                />
                <span className="text-[10px] text-muted mt-0.5 block">
                  Must be unique. Used in catalogue URLs like: /categories/{formSlug || 'slug'}
                </span>
              </div>

              {/* Group Name */}
              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Textile Group Family <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formGroup}
                  onChange={(e) => setFormGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:border-accent outline-none cursor-pointer"
                >
                  {DEFAULT_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                  <option value="custom">+ Create New Group...</option>
                </select>

                {formGroup === 'custom' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter new group name (e.g. Bedspreads)"
                    value={formCustomGroup}
                    onChange={(e) => setFormCustomGroup(e.target.value)}
                    className="w-full mt-2 px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:border-accent outline-none"
                  />
                )}
              </div>

              {/* Sort Order & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:border-accent outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">
                    Status
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                    <span className="text-xs text-charcoal">Active on Storefront</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Wholesale textile specifications, weave details, or packaging info..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:border-accent focus:bg-surface outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={formSubmitting}
                  leftIcon={formSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  {formSubmitting
                    ? 'Saving...'
                    : editingCategory
                    ? 'Update Category'
                    : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warning Modal when Deactivating a Category with Products */}
      {categoryToToggle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-surface border border-amber-300 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-serif font-bold text-base text-primary">
                Deactivate &ldquo;{categoryToToggle.name}&rdquo;?
              </h3>
            </div>
            <p className="text-xs text-charcoal/80 leading-relaxed">
              This category currently contains{' '}
              <strong className="text-primary font-bold">{categoryToToggle.productCount} wholesale product(s)</strong>.
              Deactivating this category will hide it from the storefront catalog navigation, but existing products will remain safely preserved in the database.
            </p>
            <div className="pt-2 border-t border-border flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCategoryToToggle(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => executeToggle(categoryToToggle.id, false)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Yes, Deactivate Category
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-surface border border-rose-300 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-serif font-bold text-base text-rose-900">
                Delete Category &ldquo;{categoryToDelete.name}&rdquo;?
              </h3>
            </div>

            {categoryToDelete.productCount > 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
                <strong>Cannot Delete:</strong>
                <p>
                  This category contains {categoryToDelete.productCount} product(s). To protect historical catalog integrity, Supabase prevents deleting referenced categories.
                </p>
                <p className="text-[11px] text-amber-700 pt-1">
                  Tip: Toggle its status to <em>Inactive</em> instead.
                </p>
              </div>
            ) : (
              <p className="text-xs text-charcoal/80 leading-relaxed">
                Are you sure you want to permanently remove this category? This action cannot be undone.
              </p>
            )}

            {deleteError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">
                {deleteError}
              </div>
            )}

            <div className="pt-2 border-t border-border flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCategoryToDelete(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              {categoryToDelete.productCount === 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
