import { useCallback, useEffect, useState } from "react";

import { AndroidHealthService } from "@/services";
import type { DistanceCountOptions, HealthResult } from "./types";

export function useDistanceCount(
  startDate: Date,
  endDate: Date,
  options: DistanceCountOptions = {},
): HealthResult {
  const [distance, setDistance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(async () => setRefreshKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchDistance() {
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
        const hasPermission = await androidHealthService.requestPermissions(["distance"]);
        if (cancelled) return;
        if (!hasPermission) {
          setError("No permission to access health data");
          console.log("No permission to access health data");
          return;
        }
        const distanceResult = await androidHealthService.getDistance(startDate, endDate);
        if (cancelled) return;
        setDistance(distanceResult.value);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.log(err);
        setError("Failed to fetch distance");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDistance();

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, refreshKey]);

  return {
    distance,
    loading,
    error,
    isAvailable,
    refresh,
  };
}
