import { useCallback } from "react";

import type { StepCountOptions, StepCountResult } from "./types";

export function useStepCount(
  _startDate: Date,
  _endDate: Date,
  _options: StepCountOptions = {},
): StepCountResult {
  const refresh = useCallback(async () => {}, []);

  return {
    steps: 0,
    loading: false,
    error: "Step tracking is not supported on this web platform.",
    isAvailable: false,
    refresh,
  };
}
