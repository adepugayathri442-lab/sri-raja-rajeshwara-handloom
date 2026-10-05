/**
 * Supabase Admin Delivery Charges & Freight Tariffs Service
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Provides authenticated operations for:
 * - Managing pan-India delivery charge rules
 * - Adding, updating, and toggling state freight rules
 * - Computing real-time delivery charges based on destination and piece counts
 * - Ensuring safe defaults and preventing negative freight amounts
 */

import { createClient } from './client';
import type { DeliveryChargeRuleRow, Database } from '@/types';

export interface DeliveryChargeRuleInput {
  state_name: string;
  zone: string;
  base_charge: number;
  per_piece_rate: number;
  is_active?: boolean;
}

/**
 * Fetch all delivery charge rules
 */
export async function getDeliveryChargeRules(): Promise<DeliveryChargeRuleRow[]> {
  try {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('delivery_charge_rules')
      .select('*')
      .order('state_name', { ascending: true });

    if (error || !data) {
      console.error('Failed to fetch delivery charge rules:', error);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Error in getDeliveryChargeRules:', err);
    return [];
  }
}

/**
 * Create a new delivery charge rule
 */
export async function createDeliveryChargeRule(
  input: DeliveryChargeRuleInput
): Promise<{ success: boolean; rule?: DeliveryChargeRuleRow; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    const cleanState = input.state_name.trim();
    const cleanZone = input.zone.trim();
    const base = Number(input.base_charge ?? 0);
    const perPiece = Number(input.per_piece_rate ?? 0);

    if (!cleanState) return { success: false, error: 'State / Territory name is required' };
    if (!cleanZone) return { success: false, error: 'Transport zone is required' };
    if (base < 0 || isNaN(base)) return { success: false, error: 'Base charge must be >= 0' };
    if (perPiece < 0 || isNaN(perPiece)) return { success: false, error: 'Per-piece rate must be >= 0' };

    // Check duplicate state_name
    const { data: existing } = await supabase
      .from('delivery_charge_rules')
      .select('id')
      .ilike('state_name', cleanState)
      .maybeSingle();

    if (existing) {
      return { success: false, error: `A tariff rule for "${cleanState}" already exists.` };
    }

    const { data, error } = await supabase
      .from('delivery_charge_rules')
      .insert({
        state_name: cleanState,
        zone: cleanZone,
        base_charge: base,
        per_piece_rate: perPiece,
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, rule: data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create delivery rule',
    };
  }
}

/**
 * Update an existing delivery charge rule
 */
export async function updateDeliveryChargeRule(
  id: string,
  input: Partial<DeliveryChargeRuleInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    const updatePayload: Database['public']['Tables']['delivery_charge_rules']['Update'] = {
      updated_at: new Date().toISOString(),
    };


    if (input.state_name !== undefined) {
      const cleanState = input.state_name.trim();
      if (!cleanState) return { success: false, error: 'State name cannot be empty' };
      updatePayload.state_name = cleanState;

      const { data: existing } = await supabase
        .from('delivery_charge_rules')
        .select('id')
        .ilike('state_name', cleanState)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return { success: false, error: `Another tariff rule for "${cleanState}" already exists.` };
      }
    }

    if (input.zone !== undefined) {
      const cleanZone = input.zone.trim();
      if (!cleanZone) return { success: false, error: 'Zone cannot be empty' };
      updatePayload.zone = cleanZone;
    }

    if (input.base_charge !== undefined) {
      const base = Number(input.base_charge);
      if (base < 0 || isNaN(base)) return { success: false, error: 'Base charge must be >= 0' };
      updatePayload.base_charge = base;
    }

    if (input.per_piece_rate !== undefined) {
      const perPiece = Number(input.per_piece_rate);
      if (perPiece < 0 || isNaN(perPiece)) return { success: false, error: 'Per-piece rate must be >= 0' };
      updatePayload.per_piece_rate = perPiece;
    }

    if (input.is_active !== undefined) {
      updatePayload.is_active = input.is_active;
    }

    const { error } = await supabase
      .from('delivery_charge_rules')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update delivery rule',
    };
  }
}

/**
 * Toggle delivery charge rule active status
 */
export async function toggleDeliveryChargeRule(
  id: string,
  newStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    const { error } = await supabase
      .from('delivery_charge_rules')
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
      error: err instanceof Error ? err.message : 'Failed to toggle delivery rule',
    };
  }
}

/**
 * Delete delivery charge rule
 */
export async function deleteDeliveryChargeRule(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    const { error } = await supabase
      .from('delivery_charge_rules')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete delivery rule',
    };
  }
}

export interface DeliveryCalculationResult {
  charge: number;
  ruleApplied: string;
  baseCharge: number;
  perPieceCharge: number;
  hasActiveRule: boolean;
}

/**
 * Calculate applicable delivery charge for a destination state and total order piece count
 * Guarantee: result is always >= 0
 */
export async function calculateDeliveryCharge(
  destinationState: string,
  totalPieceCount: number
): Promise<DeliveryCalculationResult> {
  try {
    const rules = await getDeliveryChargeRules();
    const activeRules = rules.filter((r) => r.is_active);

    const safeCount = Math.max(0, totalPieceCount);

    if (activeRules.length === 0) {
      return {
        charge: 0,
        ruleApplied: 'No active delivery rule',
        baseCharge: 0,
        perPieceCharge: 0,
        hasActiveRule: false,
      };
    }

    // 1. Try to find direct state match
    const cleanDestination = destinationState.trim().toLowerCase();
    const specificRule = cleanDestination
      ? activeRules.find(
          (r) => r.state_name.trim().toLowerCase() === cleanDestination
        )
      : null;

    if (specificRule) {
      const base = Number(specificRule.base_charge ?? 0);
      const perPiece = Number(specificRule.per_piece_rate ?? 0);
      const perPieceTotal = perPiece * safeCount;
      const charge = Math.max(0, base + perPieceTotal);
      return {
        charge,
        ruleApplied: specificRule.state_name,
        baseCharge: base,
        perPieceCharge: perPieceTotal,
        hasActiveRule: true,
      };
    }

    // 2. Try to find default / all-India rule
    const defaultRule = activeRules.find(
      (r) =>
        r.state_name.toLowerCase().includes('default') ||
        r.state_name.toLowerCase().includes('all india') ||
        r.state_name.toLowerCase() === 'all-india' ||
        r.zone.toLowerCase() === 'national default' ||
        r.zone.toLowerCase() === 'default'
    );

    if (defaultRule) {
      const base = Number(defaultRule.base_charge ?? 0);
      const perPiece = Number(defaultRule.per_piece_rate ?? 0);
      const perPieceTotal = perPiece * safeCount;
      const charge = Math.max(0, base + perPieceTotal);
      return {
        charge,
        ruleApplied: `${defaultRule.state_name} (All-India Default)`,
        baseCharge: base,
        perPieceCharge: perPieceTotal,
        hasActiveRule: true,
      };
    }

    // 3. Fallback if no matching state and no default rule
    return {
      charge: 0,
      ruleApplied: 'No matching state rule',
      baseCharge: 0,
      perPieceCharge: 0,
      hasActiveRule: false,
    };
  } catch (err) {
    console.error('Error calculating delivery charge:', err);
    return {
      charge: 0,
      ruleApplied: 'Manual Transport Freight',
      baseCharge: 0,
      perPieceCharge: 0,
      hasActiveRule: false,
    };
  }
}
