import { useEffect, useState } from "react";
import { useCalorieCount } from "./use-calorie-count";

type DayCalorieProps = {
    dateStart: Date;
    dateEnd: Date;
}
export const useCalorie = ({dateStart, dateEnd}: DayCalorieProps) => {
 
    const {
        calories,
        loading,
        error,
        isAvailable,
        requestPermissions,
        refresh,
    } = useCalorieCount(dateStart, dateEnd);

    const [granted, setGranted] = useState(false);

    useEffect(() => {
        const checkPermissions = async () => {
            const grantedPerm = await requestPermissions();
            console.log("Calorie Permissions",grantedPerm);
            setGranted(grantedPerm);
        };
        checkPermissions();
    }, []);

    useEffect(() => {
        if (!granted) return;
        void refresh();
    }, [granted, refresh]);

    return {
        calories,
        loading,
        error,
        isAvailable,
        granted,
    };
};