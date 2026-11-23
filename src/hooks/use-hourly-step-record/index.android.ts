import { AndroidHealthService } from "@/services";
import { endOfHour, startOfDay, startOfHour } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { UseDailyStepRecordOptions } from "./types";
export const useHourlyStepRecord = ({ day }: UseDailyStepRecordOptions) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [records, setRecords] = useState<{ hour: number; steps: number }[]>([]);

    const hoursArray = useMemo(() => {
        const dayStart = startOfDay(day);
        const hoursArrayTimeStamp: Date[] = [];
        for (let i = 0; i < 24; i++) {
            const hourDate = new Date(dayStart);
            hourDate.setHours(i, 0, 0, 0);
            hoursArrayTimeStamp.push(hourDate);
        }
        return hoursArrayTimeStamp;

    }, [day]);

    useEffect(() => {
        let cancelled = false;

        async function fetchHourlyStepRecord() {
            try {
                const androidHealthService = new AndroidHealthService();
                const isAvailable = await androidHealthService.isAvailable();

                if (cancelled) return;
                if (!isAvailable) {
                    setError("Health service is not available");
                    console.log("Health service is not available");
                    throw new Error("Health service is not available");
                }
                await androidHealthService.initialize();
                const hasPermission = await androidHealthService.requestPermissions(["steps"]);

                if (cancelled) return;
                if (!hasPermission) {
                    setError("No permission to access health data");
                    console.log("No permission to access health data");
                    throw new Error("No permission to access health data");
                }
                const records = await Promise.all(
                    hoursArray.map(async (hour) => {
                        // startof-day and end-of-day for the current date
                        const startTime = startOfHour(hour);
                        const endTime = endOfHour(hour);
                        const stepsResult = await androidHealthService.getSteps(startTime, endTime);
                        return {
                            hour: hour.getHours(),
                            steps: stepsResult.value,
                        };
                    })
                );

                if (cancelled) return;
                setError(null);
                setRecords(records);

            } catch (error) {
                if (cancelled) return;
                setError(error instanceof Error ? error.message : "An unknown error occurred");
                setRecords(hoursArray.map(hour => ({ hour: hour.getHours(), steps: 0 })));
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchHourlyStepRecord();

        return () => {
            cancelled = true;
        };
    }, [hoursArray]);

    return {
        records,
        loading,
        error,
    };

};
