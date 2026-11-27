/**
 * Shared schedule types.
 *
 * The full persistence layer for scheduled occurrences is implemented by a
 * separate task. These types are the contract the Home screen calendar expects
 * that layer to honour.
 */

export type Recurrence = 'none' | 'weekly' | 'monthly';

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

  /**
   * Optional local start time in `HH:mm`. Combined with `scheduledDate` it
   * describes when the occurrence is planned to start.
   */
  startTime?: string;

  /**
   * Optional local end time in `HH:mm`. Only meaningful when `allDay` is false
   * or undefined.
   */
  endTime?: string;

  /** When true the occurrence is treated as an all-day activity. */
  allDay?: boolean;

  /**
   * Recurrence pattern for the activity. When omitted the occurrence is a
   * one-time event.
   */
  recurrence?: Recurrence;

  /** Optional notes or instructions for the activity. */
  notes?: string;

  /**
   * Shared identifier for occurrences generated from the same recurring
   * activity. Useful for future series editing.
   */
  seriesId?: string;

  /** Link to the actual workout session that fulfilled this occurrence. */
  workoutSessionId?: string;
}

export type DayWorkoutStatus = 'none' | 'scheduled' | 'completed' | 'skipped';
