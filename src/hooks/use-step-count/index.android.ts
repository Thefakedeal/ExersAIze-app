import { useCallback, useEffect, useState } from "react";
import {
  aggregateRecord,
  getSdkStatus,
  initialize,
  requestPermission,
} from "react-native-health-connect";

import type { StepCountOptions, StepCountResult } from "./types";


export  function useStepCount(
  startDate: Date,
  endDate: Date,
  options: StepCountOptions = {},
): StepCountResult {
  const [steps, setSteps] = useState(220);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  const initializeHealthConnect = useCallback(async () => {
    try {
      console.log("Checking Health Connect SDK status...");
      const status = await getSdkStatus();
      console.log("Health Connect SDK status:", status);
      if (status !== 3) {
        setIsAvailable(false);
        return false;
      }

      const initialized = await initialize();

      setIsAvailable(initialized);

      return initialized;
    } catch(err: any) {
      console.error("Error initializing Health Connect:", err.message);
      setIsAvailable(false);
      return false;
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      console.log("Requesting step-count permission...");
      const initialized = await initializeHealthConnect();
      console.log("Health Connect initialized:", initialized);
      if (!initialized) {
        setError("Health Connect is not available on this device.");
        return false;
      }

      const permissions = await requestPermission([
        {
          accessType: "read",
          recordType: "Steps",
        },
      ]);
      console.log("Step-count permissions:", permissions);
      const granted = permissions.some(
        (permission) =>
          permission.recordType === "Steps" && permission.accessType === "read",
      );

      setHasPermission(granted);

      if (granted) {
        setError(null);
      } else {
        setError("Step-count permission was not granted.");
      }

      return granted;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to request step-count permission.",
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
      setSteps(0);
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
          "Step-count permission is required. Please grant access first.",
        );
      }

      const result = await aggregateRecord({
        recordType: "Steps",
        timeRangeFilter: {
          operator: "between",
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        },
      });

      setSteps(Math.round(result.COUNT_TOTAL ?? 0));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to retrieve steps.",
      );
    } finally {
      setLoading(false);
    }
  }, [startTime, endTime, hasPermission, initializeHealthConnect]);

  useEffect(() => {
    console.log("Initializing Health Connect...");
    void initializeHealthConnect();
  }, [initializeHealthConnect]);

  useEffect(() => {
    if (options.autoFetch && hasPermission) {
      void refresh();
    }
  }, [options.autoFetch, hasPermission, refresh]);

  return {
    steps,
    loading,
    error,
    isAvailable,
    requestPermissions,
    refresh,
  };
}
