import { ScheduledOccurrence } from '@/types/schedule';

interface UseScheduledOccurrencesOptions {
  startDate: Date;
  endDate: Date;
}

interface UseScheduledOccurrencesResult {
  occurrences: ScheduledOccurrence[];
  loading: boolean;
}

/**
 * Returns scheduled occurrences within the requested date range.
 *
 * TODO: Replace the empty stub with the real schedule data layer once the
 * separate persistence task is complete. The signature must remain stable so
 * callers do not need to change.
 */
export function useScheduledOccurrences(
  _options?: UseScheduledOccurrencesOptions
): UseScheduledOccurrencesResult {
  return { occurrences: [], loading: false };
}
