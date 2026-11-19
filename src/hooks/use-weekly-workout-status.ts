import { endOfWeek, format, isToday, startOfWeek } from 'date-fns';
import { useMemo } from 'react';

import { useScheduledOccurrences } from './use-scheduled-occurrences';
import { useWorkoutSessions } from './use-workout-sessions';

import { useDatesBetween } from '@/hooks/use-dates-between';
import { DayWorkoutStatus } from '@/types/schedule';

interface WeeklyWorkoutStatus {
  days: Date[];
  statuses: DayWorkoutStatus[];
  todayIndex: number;
}

/**
 * Derive the status for each day of the current (Sunday-first) week.
 *
 * Precedence:
 *   1. completed — any session finished on that day (scheduled or independent)
 *   2. skipped   — any occurrence explicitly skipped that day
 *   3. scheduled — any active occurrence planned for that day
 *   4. none      — otherwise
 */
export function useWeeklyWorkoutStatus(): WeeklyWorkoutStatus {
  const [weekStart, weekEnd] = useMemo(() => {
    const today = new Date();
    return [
      startOfWeek(today, { weekStartsOn: 0 }),
      endOfWeek(today, { weekStartsOn: 0 }),
    ];
  }, []);

  const days = useDatesBetween({ startDate: weekStart, endDate: weekEnd });
  const { occurrences } = useScheduledOccurrences({ startDate: weekStart, endDate: weekEnd });
  const { sessions } = useWorkoutSessions();

  const statuses = useMemo<DayWorkoutStatus[]>(() => {
    const completedDays = new Set(
      sessions.flatMap((session) =>
        session.endTime ? [format(session.endTime, 'yyyy-MM-dd')] : []
      )
    );

    const activeOccurrences = occurrences.filter((occurrence) => occurrence.status !== 'cancelled');
    const skippedDays = new Set(
      activeOccurrences
        .filter((occurrence) => occurrence.status === 'skipped')
        .map((occurrence) => occurrence.scheduledDate)
    );
    const scheduledDays = new Set(
      activeOccurrences
        .filter((occurrence) => occurrence.status === 'scheduled')
        .map((occurrence) => occurrence.scheduledDate)
    );

    return days.map((day) => {
      const dayKey = format(day, 'yyyy-MM-dd');
      if (completedDays.has(dayKey)) return 'completed';
      if (skippedDays.has(dayKey)) return 'skipped';
      if (scheduledDays.has(dayKey)) return 'scheduled';
      return 'none';
    });
  }, [days, occurrences, sessions]);

  const todayIndex = days.findIndex((day) => isToday(day));

  return { days, statuses, todayIndex };
}
