/**
 * Shared schedule types.
 *
 * The full persistence layer for scheduled occurrences is implemented by a
 * separate task. These types are the contract the Home screen calendar expects
 * that layer to honour.
 */

export interface ScheduledOccurrence {
  id: string;

  /**
   * Date-only string in local time (`yyyy-MM-dd`). Used to place the
   * occurrence on a calendar day without risking UTC shifts.
   */
  scheduledDate: string;

  status: 'scheduled' | 'completed' | 'skipped' | 'cancelled';

  /** Optional routine reference; custom workouts may leave this undefined. */
  routineId?: string;

  /** Display title. Independent of whether a routine is linked. */
  title?: string;

  /** Link to the actual workout session that fulfilled this occurrence. */
  workoutSessionId?: string;
}

export type DayWorkoutStatus = 'none' | 'scheduled' | 'completed' | 'skipped';
