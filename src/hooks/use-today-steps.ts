import { endOfDay, startOfDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useStepCount } from "./use-step-count";
export const useTodaySteps = () => {
    const [todayStart, todayEnd] = useMemo(() => {
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        return [todayStart, todayEnd];
    }, []);

    
    const [loading, setLoading] = useState(true);
    const {
        steps,
        error,
        isAvailable,
        refresh,
        loading: stepCountLoading
    } = useStepCount(todayStart, todayEnd);

    useEffect(() => {
        const interval = setInterval(() => {
            void refresh();
        }, 1000);
        setLoading(false);
        return () => clearInterval(interval);
    }, [refresh]);

    return {
        steps,
        loading,
        error,
        isAvailable,
    };
};