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
  // Chest
  'Upper Chest',
  'Middle Chest',
  'Lower Chest',

  // Back
  'Lats',
  'Traps',
  'Rhomboids',
  'Lower Back',
  'Teres Major',

  // Shoulders
  'Front Delts',
  'Side Delts',
  'Rear Delts',

  // Arms
  'Biceps',
  'Triceps',
  'Brachialis',
  'Forearms',

  // Legs
  'Quads',
  'Hamstrings',
  'Glutes',
  'Hip Flexors',
  'Adductors',
  'Abductors',
  'Calves',
  'Tibialis Anterior',

  // Core
  'Upper Abs',
  'Lower Abs',
  'Obliques',
  'Transverse Abdominis',
  'Erector Spinae',

  // Other
  'Cardio',
  // 'Full Body',
];
