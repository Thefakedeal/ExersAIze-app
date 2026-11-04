
import { UseDailyStepRecordOptions, UseDailyStepRecordResult } from './types';
export const useDailyStepRecord = ({ startDate, endDate }: UseDailyStepRecordOptions): UseDailyStepRecordResult => {
    // get all dates between startDate and endDate using date-fns
    const dates = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
        dates.push(currentDate);
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }

    // create an array of records with date and steps
    const records = dates.map(date => ({
        date,
        steps: 0,
    }));

    return {
        records,
        loading: false,
        error: "Device does not support step count tracking.",
    };
};

export * from './types';
