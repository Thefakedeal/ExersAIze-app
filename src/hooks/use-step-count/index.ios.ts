import { useEffect, useState } from "react";

import { IOSHealthService } from "@/services/IOSHealthService";
import type { StepCountOptions, StepCountResult } from "./types";

const STEP_COUNT = "HKQuantityTypeIdentifierStepCount";

export function useStepCount(
  startDate: Date,
  endDate: Date,
  options: StepCountOptions = {},
): StepCountResult {
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const getSteps = async () => {
      setLoading(true);
      try {
        const iosHealthService = new IOSHealthService();
        const isAvailable = await iosHealthService.isAvailable();
        setIsAvailable(isAvailable);
        if (!isAvailable) {
          setError("Health service is not available");
          return;
        }
        await iosHealthService.initialize();
        const hasPermission = await iosHealthService.requestPermissions(["steps"]);
        setHasPermission(hasPermission);
        if (!hasPermission) {
          setError("No permission to access health data");
          return;
        }
        const stepsResult = await iosHealthService.getSteps(startDate, endDate);
        setSteps(stepsResult.value);
        setError(null);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch steps");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      getSteps();
    }, [startDate, endDate]);
  
    return {
      steps,
      loading,
      error,
      isAvailable,
      refresh: getSteps,
    };
}
