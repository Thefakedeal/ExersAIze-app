export type DistanceUnit = 'km' | 'mi';

export const DEFAULT_DISTANCE_UNIT: DistanceUnit = 'km';

export const MI_PER_KM = 0.621371; // 1 km = 0.621371 mi

/** Converts stored km to the display unit, rounded to 2 decimals for UI. */
export function toDisplayDistance(km: number, unit: DistanceUnit): number {
  const display = unit === 'km' ? km : km * MI_PER_KM;
  return Number(display.toFixed(2));
}

/** Converts a display-unit input back to km without rounding stored precision. */
export function toStoredDistance(display: number, unit: DistanceUnit): number {
  return unit === 'km' ? display : display / MI_PER_KM;
}
