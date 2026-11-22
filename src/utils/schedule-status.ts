import { isAfter, isSameDay, parseISO, startOfDay } from 'date-fns';

import { WorkoutSession } from '@/types/session';

export type DisplayActivityStatus = 'scheduled' | 'completed' | 'skipped';

interface GetScheduledActivityStatusOptions {
  /** ID of the workout session linked to the activity, if any. */
  workoutSessionId?: string;
  /**
   * Optional list of actual workout sessions. When provided, the function checks
   * that the linked session still exists in storage.
   */
  sessions?: WorkoutSession[];
}

/**
 * Determine the displayed status of a scheduled activity from its date and
 * associated workout session.
 *
 * Rules:
 * - Future date                 -> Scheduled
 * - Today + no session          -> Scheduled
 * - Today + session exists      -> Completed
 * - Past + session exists       -> Completed
 * - Past + no session           -> Skipped
 *
 * Comparisons use local calendar dates to avoid timezone-related mismatches.
 */
export function getScheduledActivityStatus(
  scheduledDate: string,
  options: GetScheduledActivityStatusOptions = {}
): DisplayActivityStatus {
  const { workoutSessionId, sessions } = options;

  const hasSession = workoutSessionId
    ? sessions === undefined || sessions.some((session) => session.id === workoutSessionId)
    : false;

  const date = startOfDay(parseISO(scheduledDate));
  const today = startOfDay(new Date());

  if (isAfter(date, today)) {
    return 'scheduled';
  }

  if (hasSession) {
    return 'completed';
  }

  if (isSameDay(date, today)) {
    return 'scheduled';
  }

  return 'skipped';
}
