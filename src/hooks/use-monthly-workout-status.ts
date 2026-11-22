import { format } from 'date-fns';
import { useMemo } from 'react';

import { useScheduledOccurrences } from './use-scheduled-occurrences';
import { useWorkoutSessions } from './use-workout-sessions';

import { DayWorkoutStatus } from '@/types/schedule';
import { getScheduledActivityStatus } from '@/utils/schedule-status';

interface UseMonthlyWorkoutStatusOptions {
  startDate: Date;
  endDate: Date;
}

type MonthlyStatusMap = Record<string, DayWorkoutStatus>;

/**
 * Build a map of active workout statuses for the given date range.
 *
 * Status precedence per day:
 *   1. completed — any finished workout session or occurrence with a linked session
 *   2. skipped   — any past occurrence without a linked session
 *   3. scheduled — any future or today occurrence without a linked session
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

    for (const { scheduledDate, workoutSessionId } of occurrences) {
      const status = getScheduledActivityStatus(scheduledDate, {
        workoutSessionId,
        sessions,
      });
      const precedence: Record<DayWorkoutStatus, number> = {
        none: 0,
        scheduled: 1,
        skipped: 2,
        completed: 3,
      };
      if (precedence[status] > precedence[map[scheduledDate] ?? 'none']) {
        map[scheduledDate] = status;
      }
    }

    return map;
  }, [occurrences, sessions]);
}
