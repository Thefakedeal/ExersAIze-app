import { useCallback, useEffect, useState } from "react";
import {
  aggregateRecord,
  getSdkStatus,
  initialize,
  requestPermission,
} from "react-native-health-connect";

import type { DistanceCountOptions, HealthResult } from "./types";


export  function useDistanceCount(
  startDate: Date,
  endDate: Date,
  options: DistanceCountOptions = {
  },
): HealthResult {
  const [distance, setDistance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  const initializeHealthConnect = useCallback(async () => {
    try {
      const status = await getSdkStatus();
      if (status !== 3) {
        setIsAvailable(false);
        return false;
      }

      const initialized = await initialize();

      setIsAvailable(initialized);

      return initialized;
    } catch(err: any) {
      setIsAvailable(false);
      return false;
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      const initialized = await initializeHealthConnect();
      if (!initialized) {
        return false;
      }

      const permissions = await requestPermission([
        {
          accessType: "read",
          recordType: "Distance",
        },
      ]);
      const granted = permissions.some(
        (permission) =>
          permission.recordType === "Distance" && permission.accessType === "read",
      );

      setHasPermission(granted);

      if (granted) {
        setError(null);
      } else {
        setError("Health permission was not granted.");
      }

      return granted;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to request permission.",
      );

      return false;
    }
  }, [initializeHealthConnect]);

  const refresh = useCallback(async () => {
    if (
      !Number.isFinite(startTime) ||
      !Number.isFinite(endTime) ||
      startTime >= endTime
    ) {
      setError("Please provide a valid date range.");
      setDistance(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const initialized = await initializeHealthConnect();

      if (!initialized) {
        throw new Error("Health Connect is not available.");
      }

      // Do not silently prompt for permission during every refresh.
      if (!hasPermission) {
        throw new Error(
          "Health permission is required. Please grant access first.",
        );
      }

      const result = await aggregateRecord({
        recordType: "Distance",
        timeRangeFilter: {
          operator: "between",
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        },
      });

      setDistance(Math.round(result.DISTANCE.inMeters ?? 0));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to retrieve steps.",
      );
    } finally {
      setLoading(false);
    }
  }, [startTime, endTime, hasPermission, initializeHealthConnect]);

  useEffect(() => {
    void initializeHealthConnect();
  }, [initializeHealthConnect]);

  useEffect(() => {
    if (options.autoFetch && hasPermission) {
      void refresh();
    }
  }, [options.autoFetch, hasPermission, refresh]);

  return {
    distance,
    loading,
    error,
    isAvailable,
    requestPermissions,
    refresh,
  };
}
