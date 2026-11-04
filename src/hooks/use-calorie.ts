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
    } = useCalorieCount(dateStart, dateEnd);

   


    return {
        calories,
        loading,
        error,
        isAvailable,
    };
};