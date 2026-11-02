import { useEffect, useMemo, useState } from "react";
import { useStepCount } from "./use-step-count";

export const useTodaySteps = () => {
    const [todayStart, todayEnd] = useMemo(() => {
        const todayStart = new Date(
            new Date().setHours(0, 0, 0, 0)
        );
        const todayEnd = new Date(
            new Date().setHours(23, 59, 59, 999)
        );
        return [todayStart, todayEnd];
    }, []);

    const [loading, setLoading] = useState(true);
    const {
        steps,
        error,
        isAvailable,
        requestPermissions,
        refresh,
    } = useStepCount(todayStart, todayEnd);
    const [granted, setGranted] = useState(false);

    useEffect(() => {
        const checkPermissions = async () => {
            const grantedPerm = await requestPermissions();
            setGranted(grantedPerm);
        };

        checkPermissions();
    }, []);

    useEffect(() => {
        if (!granted) return;

        const interval = setInterval(() => {
            void refresh();
        }, 1000);
        setLoading(false);
        return () => clearInterval(interval);
    }, [granted, refresh]);

    return {
        steps,
        loading,
        error,
        isAvailable,
        granted,
    };
};