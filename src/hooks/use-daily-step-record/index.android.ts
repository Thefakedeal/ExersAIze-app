import { AndroidHealthService } from "@/services";
import { endOfDay, startOfDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { UseDailyStepRecordOptions } from "./types";
export const useDailyStepRecord = ({ startDate, endDate }: UseDailyStepRecordOptions) => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [records, setRecords] = useState<{ date: Date; steps: number }[]>([]);

    const dateArray = useMemo(() => {
       const startOfDate = startOfDay(startDate);
       const endOfDate = endOfDay(endDate);
        const dateArray = [];
        let currentDate = startDate;
        while (currentDate <= endDate) {
            dateArray.push(currentDate);
            currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
        }
        return dateArray;
    }, [startDate, endDate]);

    const getDailyStepRecord = async () => {
        try {
            setLoading(true);
            setError(null);

            const androidHealthService = new AndroidHealthService();
            const isAvailable = await androidHealthService.isAvailable();
    
            if (!isAvailable) {
                setError("Health service is not available");
                console.log("Health service is not available");
                throw new Error("Health service is not available");
            }
            await androidHealthService.initialize();
            const hasPermission = await androidHealthService.requestPermissions(["steps"]);
            
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

            setRecords(records);

        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred");
            setRecords(dateArray.map(date => ({ date, steps: 0 })));
        } finally {
            setLoading(false);
        }

    };
    useEffect(() => {
        getDailyStepRecord();
    }, [startDate, endDate]);
    // get all dates between startDate and endDate using date-fns


    return {
        records,
        loading,
        error,
    };

};