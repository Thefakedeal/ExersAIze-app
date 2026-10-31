import { useCallback } from "react";

import type { DistanceCountOptions, HealthResult } from "./types";

export function useDistanceCount(
  _startDate: Date,
  _endDate: Date,
  _options: DistanceCountOptions = {
  },
): HealthResult {
  const requestPermissions = useCallback(async () => false, []);
  const refresh = useCallback(async () => {}, []);

  return {
    distance: 0,
    loading: false,
    error: "",
    isAvailable: false,
    requestPermissions,
    refresh,
  };
}
