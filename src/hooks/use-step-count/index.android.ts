import { useEffect, useState } from "react";

import { AndroidHealthService } from "@/services";
import type { StepCountOptions, StepCountResult } from "./types";


export  function useStepCount(
  startDate: Date,
  endDate: Date,
  options: StepCountOptions = {},
): StepCountResult {
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  const getSteps = async () => {
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
        const hasPermission = await androidHealthService.requestPermissions(["steps"]);
        if (!hasPermission) {
          setError("No permission to access health data");
          console.log("No permission to access health data");
          return;
        }
        const stepsResult = await androidHealthService.getSteps(startDate, endDate);
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
