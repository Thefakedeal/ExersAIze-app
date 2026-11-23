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
    } = useStepCount(dateStart, dateEnd);


    return {
        steps,
        loading,
        error,
        isAvailable,
        granted: isAvailable && !error,
    };
};