import { AndroidHealthService } from "@/services";
import { addDays, endOfDay, startOfDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { UseDailyStepRecordOptions } from "./types";
export const useDailyStepRecord = ({ startDate, endDate }: UseDailyStepRecordOptions) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [records, setRecords] = useState<{ date: Date; steps: number }[]>([]);

    const dateArray = useMemo(() => {
        const dateArray = [];
        let currentDate = startDate;
        while (currentDate <= endDate) {
            dateArray.push(currentDate);
            currentDate = addDays(currentDate, 1);
        }
        return dateArray;
    }, [startDate, endDate]);

    useEffect(() => {
        let cancelled = false;

        async function fetchDailyStepRecord() {
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
                    dateArray.map(async (date) => {
                        // startof-day and end-of-day for the current date
                        const startDate = startOfDay(date);
                        const endDate = endOfDay(date);
                        const stepsResult = await androidHealthService.getSteps(startDate, endDate);
                        return {
                            date,
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
                setRecords(dateArray.map(date => ({ date, steps: 0 })));
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchDailyStepRecord();

        return () => {
            cancelled = true;
        };
    }, [dateArray]);

    return {
        records,
        loading,
        error,
    };

};
