'use client';

/**
 * Admin Delivery Charges & Freight Tariffs Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Features:
 * - Live rules from `public.delivery_charge_rules`
 * - Add & Edit delivery charge rules
 * - Configure Base Freight (₹) and Per-Piece Rate (₹)
 * - Support Default All-India rule + State-specific rules
 * - Active / Inactive toggle with confirmation when deactivating default rule
 * - Safe deletion with confirmation
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Truck,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  RefreshCw,
  X,
  CheckCircle2,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  getDeliveryChargeRules,
  createDeliveryChargeRule,
  updateDeliveryChargeRule,
  toggleDeliveryChargeRule,
  deleteDeliveryChargeRule,
  type DeliveryChargeRuleInput,
} from '@/lib/supabase/admin-delivery';
import type { DeliveryChargeRuleRow } from '@/types';

const ZONES = [
  'National Default',
  'South',
  'Central',
  'North',
  'West',
  'East',
  'North-East',
];

export function AdminDeliveryChargesView() {
  const [rules, setRules] = useState<DeliveryChargeRuleRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DeliveryChargeRuleRow | null>(null);
  const [formStateName, setFormStateName] = useState('');
  const [formZone, setFormZone] = useState(ZONES[0]);
  const [formBaseCharge, setFormBaseCharge] = useState('0');
  const [formPerPieceRate, setFormPerPieceRate] = useState('0');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Deactivation warning for default rule
  const [ruleToToggle, setRuleToToggle] = useState<DeliveryChargeRuleRow | null>(null);

  // Delete modal
  const [ruleToDelete, setRuleToDelete] = useState<DeliveryChargeRuleRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadRules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDeliveryChargeRules();
      setRules(data);
    } catch (err) {
      console.error('Failed to load delivery rules:', err);
      setError('Unable to load delivery charge rules from database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    getDeliveryChargeRules()
      .then((data) => {
        if (!ignore) {
          setRules(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load delivery rules:', err);
          setError('Unable to load delivery charge rules from database.');
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Identify active default rule
  const defaultRule = rules.find(
    (r) =>
      r.is_active &&
      (r.state_name.toLowerCase().includes('default') ||
        r.state_name.toLowerCase().includes('all india') ||
        r.zone.toLowerCase() === 'national default')
  );

  const distinctZones = Array.from(new Set(rules.map((r) => r.zone).filter(Boolean)));

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingRule(null);
    setFormStateName('');
    setFormZone(ZONES[1] || 'South');
    setFormBaseCharge('150');
    setFormPerPieceRate('5');
    setFormIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (rule: DeliveryChargeRuleRow) => {
    setEditingRule(rule);
    setFormStateName(rule.state_name);
    setFormZone(rule.zone);
    setFormBaseCharge(String(rule.base_charge));
    setFormPerPieceRate(String(rule.per_piece_rate));
    setFormIsActive(rule.is_active);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Submit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanState = formStateName.trim();
    const base = parseFloat(formBaseCharge || '0');
    const perPiece = parseFloat(formPerPieceRate || '0');

    if (!cleanState) {
      setFormError('State / Territory name is required.');
      return;
    }
    if (isNaN(base) || base < 0) {
      setFormError('Base charge must be a valid number >= 0.');
      return;
    }
    if (isNaN(perPiece) || perPiece < 0) {
      setFormError('Per-piece rate must be a valid number >= 0.');
      return;
    }

    setFormSubmitting(true);

    const payload: DeliveryChargeRuleInput = {
      state_name: cleanState,
      zone: formZone,
      base_charge: base,
      per_piece_rate: perPiece,
      is_active: formIsActive,
    };

    if (editingRule) {
      const res = await updateDeliveryChargeRule(editingRule.id, payload);
      setFormSubmitting(false);
      if (res.success) {
        setIsModalOpen(false);
        loadRules();
      } else {
        setFormError(res.error || 'Failed to update delivery rule.');
      }
    } else {
      const res = await createDeliveryChargeRule(payload);
      setFormSubmitting(false);
      if (res.success) {
        setIsModalOpen(false);
        loadRules();
      } else {
        setFormError(res.error || 'Failed to create delivery rule.');
      }
    }
  };

  // Handle Toggle
  const handleToggleClick = (rule: DeliveryChargeRuleRow) => {
    const isDefault =
      rule.state_name.toLowerCase().includes('default') ||
      rule.state_name.toLowerCase().includes('all india');

    if (rule.is_active && isDefault) {
      // Show confirmation dialog before deactivating default rule
      setRuleToToggle(rule);
    } else {
      executeToggle(rule.id, !rule.is_active);
    }
  };

  const executeToggle = async (id: string, newStatus: boolean) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: newStatus } : r))
    );

    const res = await toggleDeliveryChargeRule(id, newStatus);
    if (!res.success) {
      alert(`Could not toggle rule: ${res.error}`);
      loadRules();
    }
    setRuleToToggle(null);
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!ruleToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    const res = await deleteDeliveryChargeRule(ruleToDelete.id);
    setIsDeleting(false);

    if (res.success) {
      setRuleToDelete(null);
      loadRules();
    } else {
      setDeleteError(res.error || 'Failed to delete rule.');
    }
  };

  // Filtered rules
  const filtered = rules.filter((r) => {
    const matchesSearch =
      search === '' ||
      r.state_name.toLowerCase().includes(search.toLowerCase()) ||
      r.zone.toLowerCase().includes(search.toLowerCase());

    const matchesZone = selectedZone === 'all' || r.zone === selectedZone;
    return matchesSearch && matchesZone;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted mb-1">
            <Link href="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <span className="text-primary font-medium">Delivery Charges</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            Pan-India Delivery Charges & Freight Tariffs
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Configure regional transport rates, per-piece freight add-ons, and pan-India wholesale delivery rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadRules}
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
            Add Tariff Rule
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Default Rule */}
        <Card variant="default" className="p-4 sm:p-5 bg-surface border-accent/40 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              Default National Rule
            </span>
            <Badge variant={defaultRule ? 'success' : 'warning'} size="sm">
              {defaultRule ? 'Active' : 'Not Set'}
            </Badge>
          </div>
          {defaultRule ? (
            <div className="mt-2">
              <div className="text-lg font-serif font-bold text-primary">
                ₹{defaultRule.base_charge} Base + ₹{defaultRule.per_piece_rate}/pc
              </div>
              <p className="text-[11px] text-muted mt-1">
                Applied automatically to any destination without a state-specific override.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted mt-2">
              No active default rule found. Add a rule with &ldquo;All India (Default)&rdquo; to configure national fallback freight.
            </p>
          )}
        </Card>

        {/* Active Rules Count */}
        <Card variant="default" className="p-4 sm:p-5 bg-surface border-border shadow-2xs">
          <span className="text-xs text-muted font-medium block">Active Tariff Rules</span>
          <div className="text-2xl font-serif font-bold text-emerald-800 mt-1">
            {rules.filter((r) => r.is_active).length}
          </div>
          <span className="text-[11px] text-muted">
            of {rules.length} configured states & territories
          </span>
        </Card>

        {/* Freight Policy Card */}
        <Card variant="default" className="p-4 sm:p-5 bg-surface border-border shadow-2xs">
          <span className="text-xs text-muted font-medium block">Wholesale Freight Policy</span>
          <div className="text-sm font-semibold text-charcoal mt-1 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-accent" />
            <span>To-Pay & Parcel Transport</span>
          </div>
          <p className="text-[11px] text-muted mt-1">
            Orders can also be dispatched with freight charges payable upon delivery (To-Pay Bilti) if selected.
          </p>
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
              placeholder="Search by state name or transport zone..."
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

          {/* Zone Filter */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              aria-label="Filter by Transport Zone"
              className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-xs text-charcoal font-medium focus:border-accent outline-none cursor-pointer"
            >
              <option value="all">All Transport Zones ({distinctZones.length})</option>
              {distinctZones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {(search || selectedZone !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setSelectedZone('all');
              }}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="text-[11px] text-muted pt-1 flex items-center justify-between">
          <span>
            Showing <strong className="text-primary">{filtered.length}</strong> of {rules.length} tariff rules
          </span>
          <span className="text-[10px] text-muted italic">
            Calculated as: Base Charge + (Pieces × Rate)
          </span>
        </div>
      </Card>

      {/* Rules Table */}
      {isLoading ? (
        <Card variant="default" className="p-12 text-center border-border">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-muted">Loading freight tariff rules...</p>
        </Card>
      ) : error ? (
        <Card variant="default" className="p-8 text-center border-rose-200 bg-rose-50/40">
          <p className="text-xs text-rose-700">{error}</p>
          <Button variant="outline" size="sm" onClick={loadRules} className="mt-3">
            Retry
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card variant="default" className="p-12 text-center border-border">
          <Truck className="w-10 h-10 text-muted/60 mx-auto mb-3" />
          <h2 className="text-base font-serif font-bold text-primary">No delivery rules found</h2>
          <p className="text-xs text-muted max-w-sm mx-auto mt-1">
            {search || selectedZone !== 'all'
              ? 'Try modifying your search or zone filter.'
              : 'Add your first state tariff rule using the button above.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="mt-4"
          >
            Add National Default Rule
          </Button>
        </Card>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-muted font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">State / Territory Scope</th>
                  <th className="py-3 px-4">Transport Zone</th>
                  <th className="py-3 px-4 text-right">Base Charge (₹)</th>
                  <th className="py-3 px-4 text-right">Per-Piece Rate (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-muted">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((r) => {
                  const isDefault =
                    r.state_name.toLowerCase().includes('default') ||
                    r.state_name.toLowerCase().includes('all india');

                  return (
                    <tr key={r.id} className="hover:bg-cream/40 transition-colors">
                      {/* State / Scope Name */}
                      <td className="py-3.5 px-4 font-semibold text-charcoal">
                        <div className="flex items-center gap-2">
                          <span>{r.state_name}</span>
                          {isDefault && (
                            <span className="text-[10px] bg-accent/20 text-charcoal px-2 py-0.5 rounded font-bold uppercase">
                              Default
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Zone */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                          <Compass className="w-3 h-3" />
                          <span>{r.zone}</span>
                        </span>
                      </td>

                      {/* Base Charge */}
                      <td className="py-3.5 px-4 text-right font-serif font-bold text-charcoal">
                        ₹{Number(r.base_charge).toLocaleString('en-IN')}
                      </td>

                      {/* Per-piece Rate */}
                      <td className="py-3.5 px-4 text-right font-serif font-bold text-primary">
                        ₹{Number(r.per_piece_rate).toLocaleString('en-IN')}
                        <span className="text-[10px] text-muted font-sans font-normal ml-0.5">/pc</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleClick(r)}
                          title={r.is_active ? 'Click to Deactivate' : 'Click to Activate'}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                            r.is_active
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {r.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Updated Date */}
                      <td className="py-3.5 px-4 text-muted whitespace-nowrap text-[11px]">
                        {new Date(r.updated_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(r)}
                            title="Edit Tariff Rule"
                            className="p-1.5 text-muted hover:text-primary rounded hover:bg-surface-subtle transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRuleToDelete(r)}
                            title="Delete Tariff Rule"
                            className="p-1.5 text-muted hover:text-rose-600 rounded hover:bg-surface-subtle transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent" />
                <h3 className="font-serif font-bold text-lg text-primary">
                  {editingRule ? 'Edit Freight Tariff Rule' : 'Add State Tariff Rule'}
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
              {/* State Name */}
              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  State / Territory Scope <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telangana or All India (Default)"
                  value={formStateName}
                  onChange={(e) => setFormStateName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:border-accent focus:bg-surface outline-none"
                />
                <span className="text-[10px] text-muted mt-0.5 block">
                  Use &ldquo;All India (Default)&rdquo; to define the national baseline rate.
                </span>
              </div>

              {/* Transport Zone */}
              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Transport Zone <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formZone}
                  onChange={(e) => setFormZone(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:border-accent outline-none cursor-pointer"
                >
                  {ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              {/* Base Charge & Per-Piece Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">
                    Base Charge (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formBaseCharge}
                    onChange={(e) => setFormBaseCharge(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:border-accent outline-none font-mono"
                  />
                  <span className="text-[10px] text-muted mt-0.5 block">
                    Fixed base parcel fee
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">
                    Per-Piece Rate (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formPerPieceRate}
                    onChange={(e) => setFormPerPieceRate(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-charcoal focus:border-accent outline-none font-mono"
                  />
                  <span className="text-[10px] text-muted mt-0.5 block">
                    Added per piece in order
                  </span>
                </div>
              </div>

              {/* Active Toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-charcoal">
                    Rule is Active & Applicable at Checkout
                  </span>
                </label>
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
                    : editingRule
                    ? 'Update Tariff Rule'
                    : 'Create Tariff Rule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal when Deactivating Default Rule */}
      {ruleToToggle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-surface border border-amber-300 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-serif font-bold text-base text-primary">
                Deactivate Default National Rule?
              </h3>
            </div>
            <p className="text-xs text-charcoal/80 leading-relaxed">
              &ldquo;{ruleToToggle.state_name}&rdquo; acts as the fallback freight calculation for all orders that do not match a specific state tariff. Deactivating it may result in orders having 0 automatic freight charge.
            </p>
            <div className="pt-2 border-t border-border flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRuleToToggle(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => executeToggle(ruleToToggle.id, false)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Yes, Deactivate Default
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {ruleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-surface border border-rose-300 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-serif font-bold text-base text-rose-900">
                Delete Rule &ldquo;{ruleToDelete.state_name}&rdquo;?
              </h3>
            </div>
            <p className="text-xs text-charcoal/80 leading-relaxed">
              Are you sure you want to permanently delete this tariff rule? Existing and historical orders will retain their original charges.
            </p>

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
                  setRuleToDelete(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
