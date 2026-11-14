import {
  ReferenceMode,
  SessionExercise,
  SessionSet,
  WorkoutSession,
} from '@/types/session';
import { toDisplayWeight, type WeightUnit } from '@/utils/weight';

export type ReferenceSet = Pick<
  SessionSet,
  'weight' | 'reps' | 'timeInSeconds' | 'distance'
>;

export interface ExerciseReference {
  mode: ReferenceMode;
  date: number;
  sets: ReferenceSet[];
}

interface HistoryEntry {
  session: WorkoutSession;
  exercise: SessionExercise;
}

function hasValues(set: SessionSet) {
  return (
    set.weight != null ||
    set.reps != null ||
    set.timeInSeconds != null ||
    set.distance != null
  );
}

function toReferenceSet(set: SessionSet): ReferenceSet {
  return {
    weight: set.weight,
    reps: set.reps,
    timeInSeconds: set.timeInSeconds,
    distance: set.distance,
  };
}

function getHistory(
  sessions: WorkoutSession[],
  exerciseId: string,
  excludeSessionId?: string
): HistoryEntry[] {
  return sessions
    .filter((session) => session.id !== excludeSessionId && session.endTime != null)
    .map((session) => {
      const exercise = session.exercises?.find((item) => item.exerciseId === exerciseId);
      if (!exercise || !exercise.sets?.some(hasValues)) return null;
      return { session, exercise };
    })
    .filter((entry): entry is HistoryEntry => entry !== null)
    .sort((a, b) => b.session.startTime - a.session.startTime);
}

/**
 * Resolves the reference data shown while logging an exercise.
 * Only finished sessions are considered, and the active session is excluded.
 */
export function findExerciseReference(
  sessions: WorkoutSession[],
  exerciseId: string,
  mode: ReferenceMode,
  excludeSessionId?: string
): ExerciseReference | null {
  const history = getHistory(sessions, exerciseId, excludeSessionId);
  if (history.length === 0) return null;

  if (mode === 'pr') {
    let bestSet: SessionSet | null = null;
    let bestDate = 0;

    for (const { session, exercise } of history) {
      for (const set of exercise.sets) {
        if (set.weight == null || set.weight <= 0) continue;
        if (bestSet == null || set.weight > (bestSet.weight ?? 0)) {
          bestSet = set;
          bestDate = session.startTime;
        }
      }
    }

    if (bestSet == null) return null;
    return { mode, date: bestDate, sets: [toReferenceSet(bestSet)] };
  }

  const latest = history[0];
  return {
    mode,
    date: latest.session.startTime,
    sets: latest.exercise.sets.filter(hasValues).map(toReferenceSet),
  };
}

export function getReferenceSetForRow(
  reference: ExerciseReference | null | undefined,
  rowIndex: number
): ReferenceSet | null {
  if (!reference || reference.sets.length === 0) return null;
  if (reference.mode === 'pr') return reference.sets[0];
  return reference.sets[rowIndex] ?? null;
}

export function describeReferenceSet(
  set: ReferenceSet,
  weightUnit: WeightUnit
): string {
  const parts: string[] = [];
  if (set.weight != null) parts.push(`${toDisplayWeight(set.weight, weightUnit)} ${weightUnit}`);
  if (set.reps != null) parts.push(`${set.reps} reps`);
  if (set.timeInSeconds != null) parts.push(`${set.timeInSeconds}s`);
  if (set.distance != null) parts.push(`${set.distance} km`);
  return parts.join(' × ');
}
