import { useEffect, useState } from "react";


import { AndroidHealthService } from "@/services";
import type { DistanceCountOptions, HealthResult } from "./types";


export function useCalorieCount(
  startDate: Date,
  endDate: Date,
  options: DistanceCountOptions = {},
): HealthResult {
  const [calories, setCalories] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const getCalories = async () => {
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
      const hasPermission = await androidHealthService.requestPermissions(["activeCalories"]);
      setHasPermission(hasPermission);
      if (!hasPermission) {
        setError("No permission to access health data");
        console.log("No permission to access health data");
        return;
      }
      const caloriesResult = await androidHealthService.getActiveCalories(startDate, endDate);
      setCalories(caloriesResult.value);
      setError(null);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch calories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCalories();
  }, [startDate, endDate]);

  return {
    calories,
    loading,
    error,
    isAvailable,
    refresh: getCalories,
  };
}
