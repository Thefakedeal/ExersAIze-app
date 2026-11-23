import { useCallback, useEffect, useState } from "react";


import { IOSHealthService } from "@/services";
import type { DistanceCountOptions, HealthResult } from "./types";


export function useCalorieCount(
  startDate: Date,
  endDate: Date,
  options: DistanceCountOptions = {},
): HealthResult {
  const [calories, setCalories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(async () => setRefreshKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchCalories() {
      try {
        const iosHealthService = new IOSHealthService();
        const isAvailable = await iosHealthService.isAvailable();
        if (cancelled) return;
        setIsAvailable(isAvailable);
        if (!isAvailable) {
          setError("Health service is not available");
          return;
        }
        await iosHealthService.initialize();
        const hasPermission = await iosHealthService.requestPermissions(["activeCalories"]);
        if (cancelled) return;
        if (!hasPermission) {
          setError("No permission to access health data");
          return;
        }
        const caloriesResult = await iosHealthService.getActiveCalories(startDate, endDate);
        if (cancelled) return;
        setCalories(caloriesResult.value);
        setError(null);
      } catch {
        if (cancelled) return;
        setError("Failed to fetch calories");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCalories();

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, refreshKey]);

  return {
    calories,
    loading,
    error,
    isAvailable,
    refresh,
  };
}
