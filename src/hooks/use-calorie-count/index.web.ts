import { useCallback } from "react";

import type { DistanceCountOptions, HealthResult } from "./types";

export function useCalorieCount(
  _startDate: Date,
  _endDate: Date,
  _options: DistanceCountOptions = {
  },
): HealthResult {
  const requestPermissions = useCallback(async () => false, []);
  const refresh = useCallback(async () => {}, []);

  return {
    calories: 0,
    loading: false,
    error: "",
    isAvailable: false,
    requestPermissions,
    refresh,
  };
}
