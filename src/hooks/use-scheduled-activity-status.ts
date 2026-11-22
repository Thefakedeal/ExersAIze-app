import { useMemo } from 'react';

import { useWorkoutSessions } from './use-workout-sessions';

import { ScheduledOccurrence } from '@/types/schedule';
import { getScheduledActivityStatus } from '@/utils/schedule-status';

/**
 * Returns the dynamic displayed status for a scheduled activity.
 *
 * The status is derived from the activity's scheduled date and whether its
 * linked workout session exists. It updates automatically when sessions are
 * created, linked, completed, or deleted.
 */
export function useScheduledActivityStatus(
  occurrence: ScheduledOccurrence | null | undefined
): ReturnType<typeof getScheduledActivityStatus> {
  const { sessions } = useWorkoutSessions();

  return useMemo(() => {
    if (!occurrence) {
      return 'scheduled';
    }

    return getScheduledActivityStatus(occurrence.scheduledDate, {
      workoutSessionId: occurrence.workoutSessionId,
      sessions,
    });
  }, [occurrence, sessions]);
}
