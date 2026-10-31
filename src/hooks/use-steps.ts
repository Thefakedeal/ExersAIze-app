import { useEffect, useState } from "react";
import { useStepCount } from "./use-step-count";

type DayStepsProps = {
    dateStart: Date;
    dateEnd: Date;
}
export const useSteps = ({dateStart, dateEnd}: DayStepsProps) => {
 
    const {
        steps,
        loading,
        error,
        isAvailable,
        requestPermissions,
        refresh,
    } = useStepCount(dateStart, dateEnd);

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
        void refresh();
    }, [granted, refresh]);

    return {
        steps,
        loading,
        error,
        isAvailable,
        granted,
    };
};