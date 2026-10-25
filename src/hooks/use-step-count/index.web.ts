import { useCallback } from "react";

import type { StepCountOptions, StepCountResult } from "./types";

export function useStepCount(
  _startDate: Date,
  _endDate: Date,
  _options: StepCountOptions = {},
): StepCountResult {
  const requestPermissions = useCallback(async () => false, []);
  const refresh = useCallback(async () => {}, []);

  return {
    steps: 0,
    loading: false,
    error: "Step tracking is not supported on this web platform.",
    isAvailable: false,
    requestPermissions,
    refresh,
  };
}
