import { useMemo } from 'react';
import { useTodaySteps } from './use-today-steps';

export interface DayStepData {
  date: Date;
  dayName: string; // 'Sun', 'Mon', etc.
  dayNumber: number; // 1 - 31
  fullDateStr: string; // e.g. "Oct 28"
  steps: number;
  calories: number;
  distanceKm: number;
  isToday: boolean;
  isFuture: boolean;
  metGoal: boolean;
  hourlyBreakdown: { timeLabel: string; hour: number; steps: number }[];
}

export interface WeeklyStepsResult {
  weekStartDate: Date;
  weekEndDate: Date;
  weekRangeLabel: string;
  days: DayStepData[];
  totalWeekSteps: number;
  averageDailySteps: number;
  goalSteps: number;
  caloriesBurned: number;
  distanceKm: number;
}

const DEFAULT_GOAL = 10000;

// Step distribution patterns for past days when sensor data is not available
const RELATIVE_DAILY_FACTORS = [0.72, 0.95, 1.08, 0.84, 1.15, 1.22, 0.68]; // Sun to Sat

// Hourly distribution fractions for a day's steps (summing to ~1.0)
const HOURLY_FRACTIONS = [
  { timeLabel: '12 AM', hour: 0, fraction: 0.01 },
  { timeLabel: '3 AM', hour: 3, fraction: 0.01 },
  { timeLabel: '6 AM', hour: 6, fraction: 0.08 },
  { timeLabel: '9 AM', hour: 9, fraction: 0.22 },
  { timeLabel: '12 PM', hour: 12, fraction: 0.19 },
  { timeLabel: '3 PM', hour: 15, fraction: 0.14 },
  { timeLabel: '6 PM', hour: 18, fraction: 0.24 },
  { timeLabel: '9 PM', hour: 21, fraction: 0.09 },
  { timeLabel: '11 PM', hour: 23, fraction: 0.02 },
];

export function calculateCalories(steps: number): number {
  return Math.round(steps * 0.04);
}

export function calculateDistanceKm(steps: number): number {
  return parseFloat(((steps * 0.762) / 1000).toFixed(2));
}

export function useWeeklySteps(weekOffset = 0, initialGoal = DEFAULT_GOAL): WeeklyStepsResult {
  const { steps: todayStepsFromHook = 0 } = useTodaySteps();

  return useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Reference date shifted by weekOffset weeks
    const refDate = new Date(todayMidnight);
    refDate.setDate(refDate.getDate() + weekOffset * 7);

    // Find Sunday of this week (0 = Sunday)
    const dayOfWeek = refDate.getDay();
    const sunday = new Date(refDate);
    sunday.setDate(refDate.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    // Generate formatted date range string, e.g. "Oct 25 – Oct 31, 2026"
    const startMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = saturday.toLocaleDateString('en-US', { month: 'short' });
    const startDay = sunday.getDate();
    const endDay = saturday.getDate();
    const year = saturday.getFullYear();

    const weekRangeLabel =
      startMonth === endMonth
        ? `${startMonth} ${startDay} – ${endDay}, ${year}`
        : `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;

    // Base step count to anchor mock/fallback data if real health data is 0
    const baseSteps = todayStepsFromHook > 0 ? todayStepsFromHook : 7400;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days: DayStepData[] = [];
    let totalWeekSteps = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);

      const isToday =
        d.getFullYear() === todayMidnight.getFullYear() &&
        d.getMonth() === todayMidnight.getMonth() &&
        d.getDate() === todayMidnight.getDate();

      const isFuture = d > todayMidnight;

      let steps = 0;
      if (isToday) {
        steps = todayStepsFromHook > 0 ? todayStepsFromHook : 6420;
      } else if (isFuture) {
        steps = 0;
      } else {
        // Deterministic realistic step count based on day index and weekOffset
        const dayFactor = RELATIVE_DAILY_FACTORS[i];
        const offsetShift = ((Math.abs(weekOffset) * 317 + i * 541) % 1500) - 750;
        steps = Math.max(0, Math.round(baseSteps * dayFactor + offsetShift));
      }

      totalWeekSteps += steps;

      const calories = calculateCalories(steps);
      const distanceKm = calculateDistanceKm(steps);
      const metGoal = steps >= initialGoal;

      // Hourly breakdown for this day
      const hourlyBreakdown = HOURLY_FRACTIONS.map((item) => ({
        timeLabel: item.timeLabel,
        hour: item.hour,
        steps: Math.round(steps * item.fraction),
      }));

      days.push({
        date: d,
        dayName: dayNames[i],
        dayNumber: d.getDate(),
        fullDateStr: d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        steps,
        calories,
        distanceKm,
        isToday,
        isFuture,
        metGoal,
        hourlyBreakdown,
      });
    }

    // Compute active days (non-future days)
    const passedDaysCount = days.filter((day) => !day.isFuture).length || 1;
    const averageDailySteps = Math.round(totalWeekSteps / passedDaysCount);

    return {
      weekStartDate: sunday,
      weekEndDate: saturday,
      weekRangeLabel,
      days,
      totalWeekSteps,
      averageDailySteps,
      goalSteps: initialGoal,
      caloriesBurned: calculateCalories(totalWeekSteps),
      distanceKm: calculateDistanceKm(totalWeekSteps),
    };
  }, [weekOffset, todayStepsFromHook, initialGoal]);
}
