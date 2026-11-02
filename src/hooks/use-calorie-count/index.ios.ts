import {
  isHealthDataAvailable,
  queryQuantitySamples,
  requestAuthorization,
} from "@kingstinct/react-native-healthkit";
import { useCallback, useEffect, useState } from "react";

import type { DistanceCountOptions, HealthResult } from "./types";

const CALORIE_COUNT = "HKQuantityTypeIdentifierActiveEnergyBurned";

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

  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  const requestPermissions = useCallback(async () => {
    try {
      const available = isHealthDataAvailable();

      setIsAvailable(available);

      if (!available) {
        setError("Apple Health is not available on this device.");
        return false;
      }

      await requestAuthorization({
        toRead: [CALORIE_COUNT],
      });

      setHasPermission(true);
      setError(null);

      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to request Apple Health permission.",
      );

      return false;
    }
  }, []);

  const refresh = useCallback(async () => {
    if (
      !Number.isFinite(startTime) ||
      !Number.isFinite(endTime) ||
      startTime >= endTime
    ) {
      setError("Please provide a valid date range.");
      setCalories(0);
      return;
    }

    if (!hasPermission) {
      setError("Health permission is required. Please grant access first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const samples = await queryQuantitySamples(CALORIE_COUNT, {
        filter: {
          date: {
            startDate: new Date(startTime),
            endDate: new Date(endTime),
          },
        },
        limit: 0,
      });

      const total = samples.reduce((sum, sample) => sum + sample.quantity, 0);

      setCalories(Math.round(total));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve Apple Health steps.",
      );
    } finally {
      setLoading(false);
    }
  }, [startTime, endTime, hasPermission]);

  useEffect(() => {
    setIsAvailable(isHealthDataAvailable());
  }, []);

  useEffect(() => {
    if (options.autoFetch && hasPermission) {
      void refresh();
    }
  }, [options.autoFetch, hasPermission, refresh]);

  return {
    calories,
    loading,
    error,
    isAvailable,
    requestPermissions,
    refresh,
  };
}
