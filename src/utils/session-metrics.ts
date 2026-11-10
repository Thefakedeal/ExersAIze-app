import { ExerciseType, TrackMetric } from '@/types/exercise';

export const DEFAULT_TRACK_METRICS: TrackMetric[] = ['Reps'];

/**
 * Resolves which metric columns/inputs an exercise should show.
 * Falls back to reps when no metrics are configured.
 */
export function getMetricVisibility(trackMetrics?: TrackMetric[], type?: ExerciseType) {
  const metrics = trackMetrics?.length ? trackMetrics : DEFAULT_TRACK_METRICS;
  const hasTime = metrics.includes('Time');
  const hasDistance = metrics.includes('Distance');

  return {
    metrics,
    hasTime,
    hasDistance,
    hasReps: metrics.includes('Reps') || (!hasTime && !hasDistance),
    showWeight: type === 'Strength' || (!hasTime && !hasDistance),
  };
}
