
export type UseDailyStepRecordOptions = {
    startDate: Date;
    endDate: Date;
}

type DailyStepRecord = {
    date: Date;
    steps: number;
}
export type UseDailyStepRecordResult = {
    records: DailyStepRecord[];
    loading: boolean;
    error: string | null;
}