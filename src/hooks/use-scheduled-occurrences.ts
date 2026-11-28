import { endOfDay, format, startOfDay } from 'date-fns';
import { useEffect, useState } from 'react';

import {
  getScheduledOccurrences,
  getScheduledOccurrencesInRange,
  subscribeToScheduleUpdates,
} from '@/services/schedule-storage';
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
 * Occurrences are stored as date-only strings (`yyyy-MM-dd`) in local time.
 * The range comparison is performed against the start and end of each day so
 * that time-of-day differences do not shift the result to a neighbouring day.
 */
export function useScheduledOccurrences(
  options?: UseScheduledOccurrencesOptions
): UseScheduledOccurrencesResult {
  const [occurrences, setOccurrences] = useState<ScheduledOccurrence[]>([]);
  const [loading, setLoading] = useState(true);

  const startDate = options?.startDate;
  const endDate = options?.endDate;

  useEffect(() => {
    let isMounted = true;

    const rangeStart = startDate ? startOfDay(startDate) : undefined;
    const rangeEnd = endDate ? endOfDay(endDate) : undefined;

    const applyOccurrences = (all: ScheduledOccurrence[]) => {
      if (!isMounted) {
        return;
      }

      setOccurrences(all);
      setLoading(false);
    };

    if (rangeStart && rangeEnd) {
      const startKey = format(rangeStart, 'yyyy-MM-dd');
      const endKey = format(rangeEnd, 'yyyy-MM-dd');
      void getScheduledOccurrencesInRange(startKey, endKey).then(applyOccurrences);

      const unsubscribe = subscribeToScheduleUpdates(() => {
        void getScheduledOccurrencesInRange(startKey, endKey).then(applyOccurrences);
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }

    void getScheduledOccurrences().then(applyOccurrences);

    const unsubscribe = subscribeToScheduleUpdates(() => {
      void getScheduledOccurrences().then(applyOccurrences);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [startDate, endDate]);

  return { occurrences, loading };
}
