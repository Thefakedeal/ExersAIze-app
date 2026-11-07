import { useHourlyStepRecord } from "./use-hourly-step-record";

type DayStepsProps = {
    day: Date;
}
export const useHourlyBreakdown = ({ day }: DayStepsProps) => {
 
    const { records, loading, error } = useHourlyStepRecord({ day });


    return {
        records,
        loading,
        error
    };
};