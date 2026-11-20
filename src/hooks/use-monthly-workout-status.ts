import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';
import { useMemo } from 'react';

import { useDatesBetween } from './use-dates-between';
import { useScheduledOccurrences } from './use-scheduled-occurrences';
import { useWorkoutSessions } from './use-workout-sessions';

import { DayWorkoutStatus } from '@/types/schedule';

export type MonthlyStatusMap = Record<string, DayWorkoutStatus>;

/**
 * Build a map of workout statuses for every day visible in the monthly calendar
 * grid for the given displayed month.
 *
 * Status precedence per day:
 *   1. completed — any finished workout session
 *   2. skipped   — any scheduled occurrence explicitly skipped
 *   3. scheduled — any active occurrence planned for that day
 *   4. none      — otherwise
 */
export function useMonthlyWorkoutStatus(displayedMonth: Date): MonthlyStatusMap {
  const monthStart = useMemo(() => startOfMonth(displayedMonth), [displayedMonth]);
  const monthEnd = useMemo(() => endOfMonth(displayedMonth), [displayedMonth]);

  const gridStart = useMemo(
    () => startOfWeek(monthStart, { weekStartsOn: 0 }),
    [monthStart]
  );
  const gridEnd = useMemo(
    () => endOfWeek(monthEnd, { weekStartsOn: 0 }),
    [monthEnd]
  );

  const days = useDatesBetween({ startDate: gridStart, endDate: gridEnd });
  const { occurrences } = useScheduledOccurrences({ startDate: gridStart, endDate: gridEnd });
  const { sessions } = useWorkoutSessions();

  return useMemo<MonthlyStatusMap>(() => {
    const map: MonthlyStatusMap = {};

    for (const day of days) {
      map[format(day, 'yyyy-MM-dd')] = 'none';
    }

    for (const session of sessions) {
      if (!session.endTime) continue;
      const dayKey = format(new Date(session.endTime), 'yyyy-MM-dd');
      if (map[dayKey] !== undefined) {
        map[dayKey] = 'completed';
      }
    }

    const activeOccurrences = occurrences.filter((occurrence) => occurrence.status !== 'cancelled');

    for (const occurrence of activeOccurrences) {
      const current = map[occurrence.scheduledDate];
      if (current === 'completed') continue;

      if (occurrence.status === 'skipped') {
        map[occurrence.scheduledDate] = 'skipped';
      } else if (occurrence.status === 'scheduled') {
        map[occurrence.scheduledDate] = 'scheduled';
      }
    }

    return map;
  }, [days, occurrences, sessions]);
}
