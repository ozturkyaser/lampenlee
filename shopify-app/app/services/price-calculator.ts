/**
 * Price Calculator Service
 * Berechnet zusätzliche Kosten basierend auf Extra Fields
 */

import type { ExtraField } from '../models/extra-field';

export interface PriceCalculation {
  basePrice: number;
  additionalCost: number;
  totalPrice: number;
  breakdown: Array<{
    fieldName: string;
    value: number | string;
    cost: number;
  }>;
}

/**
 * Calculate additional cost for a single extra field
 */
export function calculateFieldCost(
  field: ExtraField,
  value: number | string
): number {
  if (!field.pricePerUnit || field.pricePerUnit <= 0) {
    return 0;
  }

  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numericValue) || numericValue <= 0) {
    return 0;
  }

  return Math.round(numericValue * field.pricePerUnit);
}

/**
 * Calculate total additional cost for multiple fields
 */
export function calculateTotalAdditionalCost(
  fields: ExtraField[],
  values: Record<string, number | string>
): PriceCalculation {
  const breakdown: Array<{ fieldName: string; value: number | string; cost: number }> = [];
  let totalAdditionalCost = 0;

  fields.forEach(field => {
    if (field.enabled && field.pricePerUnit && field.pricePerUnit > 0) {
      const value = values[field.name];
      if (value !== undefined && value !== null && value !== '') {
        const cost = calculateFieldCost(field, value);
        if (cost > 0) {
          breakdown.push({
            fieldName: field.label || field.name,
            value,
            cost
          });
          totalAdditionalCost += cost;
        }
      }
    }
  });

  return {
    basePrice: 0, // Wird vom Cart Item bereitgestellt
    additionalCost: totalAdditionalCost,
    totalPrice: 0, // Wird vom Cart Item bereitgestellt
    breakdown
  };
}

/**
 * Format money (cents to EUR string)
 */
export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(cents / 100);
}
