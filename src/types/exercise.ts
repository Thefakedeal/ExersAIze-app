export type ExerciseType = 'Bodyweight' | 'Strength';

export type TrackMetric = 'Reps' | 'Time' | 'Distance';

export interface ExerciseItem {
  id: string;
  name: string;
  type: ExerciseType;
  categories: string[];
  trackMetrics: TrackMetric[];
  note?: string;
  isCustom?: boolean;
  createdAt?: number;
}

export const DEFAULT_EXERCISE_CATEGORIES: string[] = [
  'Chest',
  'Back',
  'Biceps',
  'Triceps',
  'Shoulders',
  'Legs',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Core / Abs',
  'Forearms',
  'Cardio',
  'Full Body',
];
