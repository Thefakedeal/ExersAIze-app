
import { UseDailyStepRecordOptions } from './types';
export const useHourlyStepRecord = ({ day }: UseDailyStepRecordOptions) => {
    // get all dates between startDate and endDate using date-fns
   const hoursArray = Array.from({ length: 24 }, (_, i) => {
        const hourDate = new Date(day);
        hourDate.setHours(i, 0, 0, 0);
        return hourDate;
    });

    const records = hoursArray.map(hour => ({ hour: hour.getHours(), steps: 0 }));
    return {
        records,
        loading: false,
        error: "Device does not support step count tracking.",
    };
};

export * from './types';
