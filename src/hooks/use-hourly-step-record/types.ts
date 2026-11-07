
export type UseDailyStepRecordOptions = {
    day: Date;
}

type HourStepRecord = {
    hour: Date;
    steps: number;
}
export type UseDailyStepRecordResult = {
    records: HourStepRecord[];
    loading: boolean;
    error: string | null;
}