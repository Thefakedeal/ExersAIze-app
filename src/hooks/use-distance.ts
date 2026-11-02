import { useEffect, useState } from "react";
import { useDistanceCount } from "./use-distance-count";

type DayStepsProps = {
    dateStart: Date;
    dateEnd: Date;
}
export const useDistance = ({dateStart, dateEnd}: DayStepsProps) => {
 
    const {
        distance,
        loading,
        error,
        isAvailable,
        requestPermissions,
        refresh,
    } = useDistanceCount(dateStart, dateEnd);

    const [granted, setGranted] = useState(false);

    useEffect(() => {
        const checkPermissions = async () => {
            const grantedPerm = await requestPermissions();
            console.log("Permissions",grantedPerm);
            setGranted(grantedPerm);
        };
        checkPermissions();
    }, []);

    useEffect(() => {
        if (!granted) return;
        void refresh();
    }, [granted, refresh]);

    return {
        distance,
        loading,
        error,
        isAvailable,
        granted,
    };
};