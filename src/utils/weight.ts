export type WeightUnit = 'kg' | 'lbs';

export const DEFAULT_WEIGHT_UNIT: WeightUnit = 'kg';

const KG_PER_LB = 0.45359237;

/** Converts stored kg to the display unit, rounded to 1 decimal for UI. */
export function toDisplayWeight(kg: number, unit: WeightUnit): number {
  const display = unit === 'kg' ? kg : kg / KG_PER_LB;
  return Number(display.toFixed(1));
}

/** Converts a display-unit input back to kg without rounding stored precision. */
export function toStoredWeight(display: number, unit: WeightUnit): number {
  return unit === 'kg' ? display : display * KG_PER_LB;
}
