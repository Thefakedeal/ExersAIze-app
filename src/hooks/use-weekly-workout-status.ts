import { endOfWeek, format, isToday, startOfWeek } from 'date-fns';
import { useMemo } from 'react';

import { useScheduledOccurrences } from './use-scheduled-occurrences';
import { useWorkoutSessions } from './use-workout-sessions';

import { useDatesBetween } from '@/hooks/use-dates-between';
import { DayWorkoutStatus } from '@/types/schedule';
import { getScheduledActivityStatus } from '@/utils/schedule-status';

interface WeeklyWorkoutStatus {
  days: Date[];
  statuses: DayWorkoutStatus[];
  todayIndex: number;
}

/**
 * Derive the status for each day of the current (Sunday-first) week.
 *
 * Precedence:
 *   1. completed — any session finished on that day, or occurrence with a linked session
 *   2. skipped   — any past occurrence without a linked session
 *   3. scheduled — any future or today occurrence without a linked session
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

    const statusByDay = new Map<string, DayWorkoutStatus>();

    for (const occurrence of occurrences) {
      if (occurrence.status === 'cancelled') continue;
      const status = getScheduledActivityStatus(occurrence.scheduledDate, {
        workoutSessionId: occurrence.workoutSessionId,
        sessions,
      });
      const current = statusByDay.get(occurrence.scheduledDate);
      const precedence: Record<DayWorkoutStatus, number> = {
        none: 0,
        scheduled: 1,
        skipped: 2,
        completed: 3,
      };
      if (!current || precedence[status] > precedence[current]) {
        statusByDay.set(occurrence.scheduledDate, status);
      }
    }

    return days.map((day) => {
      const dayKey = format(day, 'yyyy-MM-dd');
      if (completedDays.has(dayKey)) return 'completed';
      return statusByDay.get(dayKey) ?? 'none';
    });
  }, [days, occurrences, sessions]);

  const todayIndex = days.findIndex((day) => isToday(day));

  return { days, statuses, todayIndex };
}
