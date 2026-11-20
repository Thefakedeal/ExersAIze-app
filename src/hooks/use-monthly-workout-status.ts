import { format } from 'date-fns';
import { useMemo } from 'react';

import { useScheduledOccurrences } from './use-scheduled-occurrences';
import { useWorkoutSessions } from './use-workout-sessions';

import { DayWorkoutStatus } from '@/types/schedule';

interface UseMonthlyWorkoutStatusOptions {
  startDate: Date;
  endDate: Date;
}

type MonthlyStatusMap = Record<string, DayWorkoutStatus>;

/**
 * Build a map of active workout statuses for the given date range.
 *
 * Status precedence per day:
 *   1. completed — any finished workout session
 *   2. skipped   — any scheduled occurrence explicitly skipped
 *   3. scheduled — any active occurrence planned for that day
 *   4. none      — otherwise
 */
export function useMonthlyWorkoutStatus({
  startDate,
  endDate,
}: UseMonthlyWorkoutStatusOptions): MonthlyStatusMap {
  const { occurrences } = useScheduledOccurrences({ startDate, endDate });
  const { sessions } = useWorkoutSessions();

  return useMemo<MonthlyStatusMap>(() => {
    const map: MonthlyStatusMap = {};

    for (const { endTime } of sessions) {
      if (endTime) {
        map[format(new Date(endTime), 'yyyy-MM-dd')] = 'completed';
      }
    }

    for (const { scheduledDate, status } of occurrences) {
      if (status !== 'skipped' && status !== 'scheduled') continue;
      if (map[scheduledDate] !== 'completed') {
        map[scheduledDate] = status;
      }
    }

    return map;
  }, [occurrences, sessions]);
}
