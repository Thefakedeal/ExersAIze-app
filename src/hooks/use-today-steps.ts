import { useStepCount } from "@/hooks/use-step-count";
import { useEffect, useMemo, useState } from "react";

export const useTodaySteps = () => {
    const [todayStart] = useMemo(() => {
        const todayStart = new Date(
            new Date().setHours(0, 0, 0, 0)
        );

        return [todayStart];
    }, []);


    const todayEnd = new Date();

    const {
        steps,
        loading,
        error,
        isAvailable,
        requestPermissions,
        refresh,
    } = useStepCount(todayStart, todayEnd);
    const [granted, setGranted] = useState(false);

    useEffect(() => {
        const checkPermissions = async () => {
            console.log("Features available:", isAvailable);
            console.log("Checking permissions...");
            const grantedPerm = await requestPermissions();
            console.log("Permissions granted:", grantedPerm);
            setGranted(grantedPerm);
        };

        checkPermissions();
    }, []);

    useEffect(() => {
        if (!granted) return;

        const interval = setInterval(() => {
            void refresh();
        }, 10000);

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