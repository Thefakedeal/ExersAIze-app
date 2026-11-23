import { useCallback, useEffect, useState } from "react";

import { AndroidHealthService } from "@/services";
import type { StepCountOptions, StepCountResult } from "./types";


export function useStepCount(
  startDate: Date,
  endDate: Date,
  options: StepCountOptions = {},
): StepCountResult {
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(async () => setRefreshKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchSteps() {
      try {
        const androidHealthService = new AndroidHealthService();
        const isAvailable = await androidHealthService.isAvailable();
        if (cancelled) return;
        setIsAvailable(isAvailable);
        if (!isAvailable) {
          setError("Health service is not available");
          console.log("Health service is not available");
          return;
        }
        await androidHealthService.initialize();
        const hasPermission = await androidHealthService.requestPermissions(["steps"]);
        if (cancelled) return;
        if (!hasPermission) {
          setError("No permission to access health data");
          console.log("No permission to access health data");
          return;
        }
        const stepsResult = await androidHealthService.getSteps(startDate, endDate);
        if (cancelled) return;
        setSteps(stepsResult.value);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.log(err);
        setError("Failed to fetch steps");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSteps();

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, refreshKey]);

  return {
    steps,
    loading,
    error,
    isAvailable,
    refresh,
  };
}
