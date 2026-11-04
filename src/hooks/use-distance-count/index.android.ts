import { useEffect, useState } from "react";

import { AndroidHealthService } from "@/services";
import type { DistanceCountOptions, HealthResult } from "./types";

export function useDistanceCount(
  startDate: Date,
  endDate: Date,
  options: DistanceCountOptions = {},
): HealthResult {
  const [distance, setDistance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const getDistance = async () => {
    setLoading(true);
    try {
      const androidHealthService = new AndroidHealthService();
      const isAvailable = await androidHealthService.isAvailable();
      setIsAvailable(isAvailable);
      if (!isAvailable) {
        setError("Health service is not available");
        console.log("Health service is not available");
        return;
      }
      await androidHealthService.initialize();
      const hasPermission = await androidHealthService.requestPermissions(["distance"]);
      setHasPermission(hasPermission);
      if (!hasPermission) {
        setError("No permission to access health data");
        console.log("No permission to access health data");
        return;
      }
      const distanceResult = await androidHealthService.getDistance(startDate, endDate);
      setDistance(distanceResult.value);
      setError(null);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch distance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDistance();
  }, [startDate, endDate]);

  return {
    distance,
    loading,
    error,
    isAvailable,
    refresh: getDistance,
  };
}
