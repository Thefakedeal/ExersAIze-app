
export type ExerciseType = 'Strength' | 'Bodyweight';

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  name: string;
  type?: ExerciseType;
  categories?: string[];
  sets: number;
  repRange: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  exercises: RoutineExercise[];
}

type RoutineExerciseInput = {
  name: string;
  sets: number;
  repRange: string;
};

const createExerciseId = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const createRoutine = (
  name: string,
  description: string,
  exercises: RoutineExerciseInput[],
): Routine => ({
  id: createExerciseId(name),
  name,
  description,
  exercises: exercises.map((exercise, index) => ({
    id: `${createExerciseId(name)}-${index + 1}`,
    exerciseId: createExerciseId(exercise.name),
    name: exercise.name,
    sets: exercise.sets,
    repRange: exercise.repRange,
  })),
});

export const DEFAULT_ROUTINES: Routine[] = [
  // ============================================================
  // FULL BODY
  // ============================================================

  createRoutine(
    'Full Body A',
    'A balanced full-body workout focused on compound movements and overall strength.',
    [
      { name: 'Barbell Back Squat', sets: 3, repRange: '6-10' },
      { name: 'Barbell Bench Press', sets: 3, repRange: '6-10' },
      { name: 'Barbell Bent-Over Row', sets: 3, repRange: '8-12' },
      { name: 'Romanian Deadlift', sets: 3, repRange: '8-12' },
      { name: 'Dumbbell Shoulder Press', sets: 3, repRange: '8-12' },
      { name: 'Cable Crunch', sets: 3, repRange: '12-15' },
    ],
  ),

  createRoutine(
    'Full Body B',
    'A complementary full-body workout using different movement patterns to build balanced strength.',
    [
      { name: 'Leg Press', sets: 3, repRange: '10-12' },
      { name: 'Incline Dumbbell Press', sets: 3, repRange: '8-12' },
      { name: 'Lat Pulldown', sets: 3, repRange: '8-12' },
      { name: 'Barbell Hip Thrust', sets: 3, repRange: '8-12' },
      { name: 'Dumbbell Lateral Raise', sets: 3, repRange: '12-15' },
      { name: 'Hanging Knee Raise', sets: 3, repRange: '12-15' },
    ],
  ),

  // ============================================================
  // UPPER / LOWER
  // ============================================================

  createRoutine(
    'Upper Body',
    'An upper-body workout targeting the chest, back, shoulders, and arms.',
    [
      { name: 'Barbell Bench Press', sets: 3, repRange: '6-10' },
      { name: 'Lat Pulldown', sets: 3, repRange: '8-12' },
      { name: 'Dumbbell Shoulder Press', sets: 3, repRange: '8-12' },
      { name: 'Seated Cable Row', sets: 3, repRange: '8-12' },
      { name: 'Dumbbell Lateral Raise', sets: 3, repRange: '12-15' },
      { name: 'Barbell Curl', sets: 3, repRange: '10-12' },
      { name: 'Cable Triceps Pushdown', sets: 3, repRange: '10-12' },
    ],
  ),

  createRoutine(
    'Lower Body',
    'A lower-body workout targeting the quads, hamstrings, glutes, and calves.',
    [
      { name: 'Barbell Back Squat', sets: 3, repRange: '6-10' },
      { name: 'Romanian Deadlift', sets: 3, repRange: '8-12' },
      { name: 'Leg Press', sets: 3, repRange: '10-12' },
      { name: 'Seated Leg Curl', sets: 3, repRange: '10-15' },
      { name: 'Standing Calf Raise', sets: 4, repRange: '12-15' },
      { name: 'Reverse Crunch', sets: 3, repRange: '12-15' },
    ],
  ),

  // ============================================================
  // PUSH / PULL / LEGS
  // ============================================================

  createRoutine(
    'Push',
    'A push-focused workout targeting the chest, shoulders, and triceps.',
    [
      { name: 'Barbell Bench Press', sets: 3, repRange: '6-10' },
      { name: 'Incline Dumbbell Press', sets: 3, repRange: '8-12' },
      { name: 'Barbell Overhead Press', sets: 3, repRange: '8-10' },
      { name: 'Dumbbell Lateral Raise', sets: 3, repRange: '12-15' },
      { name: 'Cable Triceps Pushdown', sets: 3, repRange: '10-12' },
      { name: 'Overhead Dumbbell Triceps Extension', sets: 3, repRange: '10-12' },
    ],
  ),

  createRoutine(
    'Pull',
    'A pull-focused workout targeting the back, biceps, and forearms.',
    [
      { name: 'Barbell Bent-Over Row', sets: 3, repRange: '6-10' },
      { name: 'Lat Pulldown', sets: 3, repRange: '8-12' },
      { name: 'Seated Cable Row', sets: 3, repRange: '8-12' },
      { name: 'Face Pull', sets: 3, repRange: '12-15' },
      { name: 'Barbell Curl', sets: 3, repRange: '10-12' },
      { name: 'Hammer Curl', sets: 3, repRange: '10-12' },
    ],
  ),

  createRoutine(
    'Legs',
    'A complete leg workout covering quads, hamstrings, glutes, and calves.',
    [
      { name: 'Barbell Back Squat', sets: 3, repRange: '6-10' },
      { name: 'Romanian Deadlift', sets: 3, repRange: '8-12' },
      { name: 'Bulgarian Split Squat', sets: 3, repRange: '10-12' },
      { name: 'Lying Leg Curl', sets: 3, repRange: '10-15' },
      { name: 'Leg Extension', sets: 3, repRange: '10-15' },
      { name: 'Seated Calf Raise', sets: 4, repRange: '12-15' },
    ],
  ),

  // ============================================================
  // BODYWEIGHT
  // ============================================================

  createRoutine(
    'Bodyweight Full Body',
    'A full-body workout using bodyweight exercises with minimal equipment.',
    [
      { name: 'Push-Up', sets: 3, repRange: '10-15' },
      { name: 'Pull-Up', sets: 3, repRange: '5-10' },
      { name: 'Bodyweight Squat', sets: 3, repRange: '15-20' },
      { name: 'Reverse Lunge', sets: 3, repRange: '10-12' },
      { name: 'Glute Bridge', sets: 3, repRange: '12-15' },
      { name: 'Pike Push-Up', sets: 3, repRange: '8-12' },
      { name: 'Plank', sets: 3, repRange: '30-60 sec' },
    ],
  ),
];