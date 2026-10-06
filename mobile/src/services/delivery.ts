import { supabase } from './supabase';

export interface DeliveryCalculationResult {
  charge: number;
  ruleApplied: string;
  baseCharge: number;
  perPieceCharge: number;
  hasActiveRule: boolean;
}

export const COMMON_INDIAN_STATES = [
  'Telangana',
  'Andhra Pradesh',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Kerala',
  'Gujarat',
  'Madhya Pradesh',
  'Rajasthan',
  'Uttar Pradesh',
  'Delhi',
  'West Bengal',
  'Odisha',
  'Bihar',
  'Punjab',
  'Haryana',
  'Chhattisgarh',
  'Jharkhand',
  'Assam',
  'Goa',
];

/**
 * Calculate delivery charge matching web app logic & live delivery_charge_rules
 */
export async function calculateDeliveryCharge(
  destinationState: string,
  totalPieceCount: number
): Promise<DeliveryCalculationResult> {
  const safeCount = Math.max(0, totalPieceCount);

  try {
    const { data: rules, error } = await supabase
      .from('delivery_charge_rules')
      .select('*')
      .eq('is_active', true);

    if (error || !rules || rules.length === 0) {
      return {
        charge: 0,
        ruleApplied: 'Separate Transport Freight',
        baseCharge: 0,
        perPieceCharge: 0,
        hasActiveRule: false,
      };
    }

    const cleanDest = destinationState.trim().toLowerCase();
    const specificRule = rules.find(
      (r) => r.state_name.trim().toLowerCase() === cleanDest
    );

    if (specificRule) {
      const base = Number(specificRule.base_charge ?? 0);
      const perPiece = Number(specificRule.per_piece_rate ?? 0);
      const perPieceTotal = perPiece * safeCount;
      return {
        charge: Math.max(0, base + perPieceTotal),
        ruleApplied: specificRule.state_name,
        baseCharge: base,
        perPieceCharge: perPieceTotal,
        hasActiveRule: true,
      };
    }

    // Default / All-India rule
    const defaultRule = rules.find(
      (r) =>
        r.state_name.toLowerCase().includes('default') ||
        r.state_name.toLowerCase().includes('all india') ||
        r.zone?.toLowerCase().includes('default')
    );

    if (defaultRule) {
      const base = Number(defaultRule.base_charge ?? 0);
      const perPiece = Number(defaultRule.per_piece_rate ?? 0);
      const perPieceTotal = perPiece * safeCount;
      return {
        charge: Math.max(0, base + perPieceTotal),
        ruleApplied: `${defaultRule.state_name} (Standard)`,
        baseCharge: base,
        perPieceCharge: perPieceTotal,
        hasActiveRule: true,
      };
    }

    return {
      charge: 0,
      ruleApplied: 'Separate Transport Freight',
      baseCharge: 0,
      perPieceCharge: 0,
      hasActiveRule: false,
    };
  } catch (err) {
    console.warn('Error calculating delivery charge:', err);
    return {
      charge: 0,
      ruleApplied: 'Separate Transport Freight',
      baseCharge: 0,
      perPieceCharge: 0,
      hasActiveRule: false,
    };
  }
}
