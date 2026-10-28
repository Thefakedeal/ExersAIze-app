import { ExerciseItem, ExerciseType, TrackMetric } from '../types/exercise';

type ExerciseSeed = {
  name: string;
  type: ExerciseType;
  categories: string[];
  trackMetrics?: TrackMetric[];
  note?: string;
};

const exerciseSeeds: ExerciseSeed[] = [
  // ============================================================
  // CHEST — STRENGTH
  // ============================================================
  { name: 'Barbell Bench Press', type: 'Strength', categories: ['Chest', 'Triceps', 'Shoulders'] },
  { name: 'Incline Barbell Bench Press', type: 'Strength', categories: ['Chest', 'Shoulders', 'Triceps'] },
  { name: 'Dumbbell Bench Press', type: 'Strength', categories: ['Chest', 'Triceps', 'Shoulders'] },
  { name: 'Incline Dumbbell Press', type: 'Strength', categories: ['Chest', 'Shoulders', 'Triceps'] },
  { name: 'Decline Bench Press', type: 'Strength', categories: ['Chest', 'Triceps'] },
  { name: 'Dumbbell Fly', type: 'Strength', categories: ['Chest'] },
  { name: 'Cable Chest Fly', type: 'Strength', categories: ['Chest'] },
  { name: 'Pec Deck Machine', type: 'Strength', categories: ['Chest'] },

  // CHEST — BODYWEIGHT
  { name: 'Push-Up', type: 'Bodyweight', categories: ['Chest', 'Triceps', 'Shoulders', 'Full Body'] },
  { name: 'Wide-Grip Push-Up', type: 'Bodyweight', categories: ['Chest'] },
  { name: 'Diamond Push-Up', type: 'Bodyweight', categories: ['Chest', 'Triceps'] },
  { name: 'Decline Push-Up', type: 'Bodyweight', categories: ['Chest', 'Shoulders'] },
  { name: 'Archer Push-Up', type: 'Bodyweight', categories: ['Chest', 'Triceps'] },
  { name: 'Pike Push-Up', type: 'Bodyweight', categories: ['Shoulders', 'Triceps'] },
  { name: 'Dips', type: 'Bodyweight', categories: ['Chest', 'Triceps', 'Shoulders'] },

  // ============================================================
  // BACK — STRENGTH
  // ============================================================
  { name: 'Barbell Bent-Over Row', type: 'Strength', categories: ['Back', 'Biceps', 'Forearms'] },
  { name: 'Dumbbell Row', type: 'Strength', categories: ['Back', 'Biceps'] },
  { name: 'Seated Cable Row', type: 'Strength', categories: ['Back', 'Biceps'] },
  { name: 'Lat Pulldown', type: 'Strength', categories: ['Back', 'Biceps'] },
  { name: 'T-Bar Row', type: 'Strength', categories: ['Back', 'Biceps'] },
  { name: 'Chest-Supported Row', type: 'Strength', categories: ['Back', 'Biceps'] },
  { name: 'Straight-Arm Pulldown', type: 'Strength', categories: ['Back'] },
  { name: 'Face Pull', type: 'Strength', categories: ['Back', 'Shoulders'] },

  // BACK — BODYWEIGHT
  { name: 'Pull-Up', type: 'Bodyweight', categories: ['Back', 'Biceps', 'Forearms'] },
  { name: 'Chin-Up', type: 'Bodyweight', categories: ['Back', 'Biceps', 'Forearms'] },
  { name: 'Inverted Row', type: 'Bodyweight', categories: ['Back', 'Biceps'] },
  { name: 'Negative Pull-Up', type: 'Bodyweight', categories: ['Back', 'Biceps'] },
  { name: 'Scapular Pull-Up', type: 'Bodyweight', categories: ['Back', 'Shoulders'] },
  { name: 'Superman', type: 'Bodyweight', categories: ['Back', 'Glutes'] },
  { name: 'Reverse Snow Angel', type: 'Bodyweight', categories: ['Back', 'Shoulders'] },

  // ============================================================
  // BICEPS — STRENGTH
  // ============================================================
  { name: 'Barbell Curl', type: 'Strength', categories: ['Biceps', 'Forearms'] },
  { name: 'Dumbbell Biceps Curl', type: 'Strength', categories: ['Biceps'] },
  { name: 'Hammer Curl', type: 'Strength', categories: ['Biceps', 'Forearms'] },
  { name: 'Preacher Curl', type: 'Strength', categories: ['Biceps'] },
  { name: 'Concentration Curl', type: 'Strength', categories: ['Biceps'] },
  { name: 'Incline Dumbbell Curl', type: 'Strength', categories: ['Biceps'] },
  { name: 'Cable Biceps Curl', type: 'Strength', categories: ['Biceps'] },

  // BICEPS — BODYWEIGHT
  { name: 'Chin-Up', type: 'Bodyweight', categories: ['Back', 'Biceps', 'Forearms'] },
  { name: 'Inverted Chin-Up Row', type: 'Bodyweight', categories: ['Back', 'Biceps'] },
  { name: 'Close-Grip Chin-Up', type: 'Bodyweight', categories: ['Back', 'Biceps'] },
  { name: 'Negative Chin-Up', type: 'Bodyweight', categories: ['Back', 'Biceps'] },
  { name: 'Towel-Assisted Chin-Up', type: 'Bodyweight', categories: ['Back', 'Biceps', 'Forearms'] },

  // ============================================================
  // TRICEPS — STRENGTH
  // ============================================================
  { name: 'Cable Triceps Pushdown', type: 'Strength', categories: ['Triceps'] },
  { name: 'Overhead Dumbbell Triceps Extension', type: 'Strength', categories: ['Triceps'] },
  { name: 'Skull Crusher', type: 'Strength', categories: ['Triceps'] },
  { name: 'Close-Grip Bench Press', type: 'Strength', categories: ['Triceps', 'Chest'] },
  { name: 'Dumbbell Kickback', type: 'Strength', categories: ['Triceps'] },
  { name: 'Overhead Cable Triceps Extension', type: 'Strength', categories: ['Triceps'] },

  // TRICEPS — BODYWEIGHT
  { name: 'Diamond Push-Up', type: 'Bodyweight', categories: ['Chest', 'Triceps'] },
  { name: 'Bench Dip', type: 'Bodyweight', categories: ['Triceps', 'Chest'] },
  { name: 'Parallel Bar Dip', type: 'Bodyweight', categories: ['Triceps', 'Chest', 'Shoulders'] },
  { name: 'Close-Grip Push-Up', type: 'Bodyweight', categories: ['Triceps', 'Chest'] },
  { name: 'Bodyweight Triceps Extension', type: 'Bodyweight', categories: ['Triceps'] },

  // ============================================================
  // SHOULDERS — STRENGTH
  // ============================================================
  { name: 'Barbell Overhead Press', type: 'Strength', categories: ['Shoulders', 'Triceps'] },
  { name: 'Dumbbell Shoulder Press', type: 'Strength', categories: ['Shoulders', 'Triceps'] },
  { name: 'Dumbbell Lateral Raise', type: 'Strength', categories: ['Shoulders'] },
  { name: 'Dumbbell Front Raise', type: 'Strength', categories: ['Shoulders'] },
  { name: 'Reverse Dumbbell Fly', type: 'Strength', categories: ['Shoulders', 'Back'] },
  { name: 'Arnold Press', type: 'Strength', categories: ['Shoulders', 'Triceps'] },
  { name: 'Machine Shoulder Press', type: 'Strength', categories: ['Shoulders', 'Triceps'] },

  // SHOULDERS — BODYWEIGHT
  { name: 'Pike Push-Up', type: 'Bodyweight', categories: ['Shoulders', 'Triceps'] },
  { name: 'Elevated Pike Push-Up', type: 'Bodyweight', categories: ['Shoulders', 'Triceps'] },
  { name: 'Wall Handstand Push-Up', type: 'Bodyweight', categories: ['Shoulders', 'Triceps'] },
  { name: 'Shoulder Tap', type: 'Bodyweight', categories: ['Shoulders', 'Core / Abs'] },
  { name: 'Arm Circle', type: 'Bodyweight', categories: ['Shoulders'], note: 'Count each complete circle as one rep.' },
  { name: 'Bear Crawl Shoulder Tap', type: 'Bodyweight', categories: ['Shoulders', 'Core / Abs', 'Full Body'] },

  // ============================================================
  // LEGS — STRENGTH
  // ============================================================
  { name: 'Barbell Back Squat', type: 'Strength', categories: ['Legs', 'Quads', 'Glutes'] },
  { name: 'Front Squat', type: 'Strength', categories: ['Legs', 'Quads'] },
  { name: 'Leg Press', type: 'Strength', categories: ['Legs', 'Quads', 'Glutes'] },
  { name: 'Hack Squat', type: 'Strength', categories: ['Legs', 'Quads'] },
  { name: 'Dumbbell Walking Lunge', type: 'Strength', categories: ['Legs', 'Quads', 'Glutes'] },
  { name: 'Bulgarian Split Squat', type: 'Strength', categories: ['Legs', 'Quads', 'Glutes'] },
  { name: 'Leg Extension', type: 'Strength', categories: ['Legs', 'Quads'] },
  { name: 'Goblet Squat', type: 'Strength', categories: ['Legs', 'Quads', 'Glutes'] },

  // LEGS — BODYWEIGHT
  { name: 'Bodyweight Squat', type: 'Bodyweight', categories: ['Legs', 'Quads', 'Glutes'] },
  { name: 'Reverse Lunge', type: 'Bodyweight', categories: ['Legs', 'Quads', 'Glutes'] },
  { name: 'Forward Lunge', type: 'Bodyweight', categories: ['Legs', 'Quads', 'Glutes'] },
  { name: 'Walking Lunge', type: 'Bodyweight', categories: ['Legs', 'Quads', 'Glutes'] },
  { name: 'Jump Squat', type: 'Bodyweight', categories: ['Legs', 'Quads', 'Glutes', 'Full Body'] },
  { name: 'Step-Up', type: 'Bodyweight', categories: ['Legs', 'Quads', 'Glutes'] },
  { name: 'Wall Sit', type: 'Bodyweight', categories: ['Legs', 'Quads'], trackMetrics: ['Time'] },

  // ============================================================
  // QUADS — STRENGTH
  // ============================================================
  { name: 'Barbell Back Squat', type: 'Strength', categories: ['Legs', 'Quads', 'Glutes'] },
  { name: 'Front Squat', type: 'Strength', categories: ['Legs', 'Quads'] },
  { name: 'Leg Press', type: 'Strength', categories: ['Legs', 'Quads', 'Glutes'] },
  { name: 'Hack Squat', type: 'Strength', categories: ['Legs', 'Quads'] },
  { name: 'Leg Extension', type: 'Strength', categories: ['Legs', 'Quads'] },
  { name: 'Smith Machine Squat', type: 'Strength', categories: ['Legs', 'Quads', 'Glutes'] },

  // QUADS — BODYWEIGHT
  { name: 'Bodyweight Squat', type: 'Bodyweight', categories: ['Legs', 'Quads', 'Glutes'] },
  { name: 'Reverse Lunge', type: 'Bodyweight', categories: ['Legs', 'Quads', 'Glutes'] },
  { name: 'Forward Lunge', type: 'Bodyweight', categories: ['Legs', 'Quads', 'Glutes'] },
  { name: 'Jump Squat', type: 'Bodyweight', categories: ['Legs', 'Quads', 'Glutes', 'Full Body'] },
  { name: 'Bulgarian Split Squat', type: 'Bodyweight', categories: ['Legs', 'Quads', 'Glutes'] },
  { name: 'Sissy Squat', type: 'Bodyweight', categories: ['Legs', 'Quads'] },
  { name: 'Step-Up', type: 'Bodyweight', categories: ['Legs', 'Quads', 'Glutes'] },

  // ============================================================
  // HAMSTRINGS — STRENGTH
  // ============================================================
  { name: 'Romanian Deadlift', type: 'Strength', categories: ['Hamstrings', 'Glutes', 'Back'] },
  { name: 'Barbell Deadlift', type: 'Strength', categories: ['Hamstrings', 'Glutes', 'Back', 'Legs'] },
  { name: 'Lying Leg Curl', type: 'Strength', categories: ['Hamstrings'] },
  { name: 'Seated Leg Curl', type: 'Strength', categories: ['Hamstrings'] },
  { name: 'Dumbbell Romanian Deadlift', type: 'Strength', categories: ['Hamstrings', 'Glutes'] },
  { name: 'Good Morning', type: 'Strength', categories: ['Hamstrings', 'Glutes', 'Back'] },

  // HAMSTRINGS — BODYWEIGHT
  { name: 'Glute Bridge Walkout', type: 'Bodyweight', categories: ['Hamstrings', 'Glutes', 'Core / Abs'] },
  { name: 'Single-Leg Glute Bridge', type: 'Bodyweight', categories: ['Hamstrings', 'Glutes'] },
  { name: 'Nordic Hamstring Curl', type: 'Bodyweight', categories: ['Hamstrings'] },
  { name: 'Single-Leg Romanian Deadlift', type: 'Bodyweight', categories: ['Hamstrings', 'Glutes'] },
  { name: 'Hamstring Walkout', type: 'Bodyweight', categories: ['Hamstrings', 'Glutes'] },

  // ============================================================
  // GLUTES — STRENGTH
  // ============================================================
  { name: 'Barbell Hip Thrust', type: 'Strength', categories: ['Glutes', 'Hamstrings'] },
  { name: 'Dumbbell Hip Thrust', type: 'Strength', categories: ['Glutes', 'Hamstrings'] },
  { name: 'Cable Glute Kickback', type: 'Strength', categories: ['Glutes'] },
  { name: 'Barbell Glute Bridge', type: 'Strength', categories: ['Glutes'] },
  { name: 'Cable Pull-Through', type: 'Strength', categories: ['Glutes', 'Hamstrings'] },
  { name: 'Dumbbell Step-Up', type: 'Strength', categories: ['Glutes', 'Quads', 'Legs'] },

  // GLUTES — BODYWEIGHT
  { name: 'Glute Bridge', type: 'Bodyweight', categories: ['Glutes', 'Hamstrings'] },
  { name: 'Single-Leg Glute Bridge', type: 'Bodyweight', categories: ['Glutes', 'Hamstrings'] },
  { name: 'Donkey Kick', type: 'Bodyweight', categories: ['Glutes'] },
  { name: 'Fire Hydrant', type: 'Bodyweight', categories: ['Glutes'] },
  { name: 'Bodyweight Hip Thrust', type: 'Bodyweight', categories: ['Glutes', 'Hamstrings'] },
  { name: 'Frog Pump', type: 'Bodyweight', categories: ['Glutes'] },
  { name: 'Reverse Lunge', type: 'Bodyweight', categories: ['Glutes', 'Quads', 'Legs'] },

  // ============================================================
  // CALVES — STRENGTH
  // ============================================================
  { name: 'Standing Calf Raise', type: 'Strength', categories: ['Calves'] },
  { name: 'Seated Calf Raise', type: 'Strength', categories: ['Calves'] },
  { name: 'Leg Press Calf Raise', type: 'Strength', categories: ['Calves', 'Legs'] },
  { name: 'Smith Machine Calf Raise', type: 'Strength', categories: ['Calves'] },
  { name: 'Donkey Calf Raise', type: 'Strength', categories: ['Calves'] },

  // CALVES — BODYWEIGHT
  { name: 'Bodyweight Calf Raise', type: 'Bodyweight', categories: ['Calves'] },
  { name: 'Single-Leg Calf Raise', type: 'Bodyweight', categories: ['Calves'] },
  { name: 'Bent-Knee Calf Raise', type: 'Bodyweight', categories: ['Calves'] },
  { name: 'Calf Raise on Step', type: 'Bodyweight', categories: ['Calves'] },
  { name: 'Single-Leg Calf Raise on Step', type: 'Bodyweight', categories: ['Calves'] },

  // ============================================================
  // CORE / ABS — STRENGTH
  // ============================================================
  { name: 'Cable Crunch', type: 'Strength', categories: ['Core / Abs'] },
  { name: 'Weighted Sit-Up', type: 'Strength', categories: ['Core / Abs'] },
  { name: 'Weighted Russian Twist', type: 'Strength', categories: ['Core / Abs'] },
  { name: 'Ab Crunch Machine', type: 'Strength', categories: ['Core / Abs'] },
  { name: 'Hanging Leg Raise with Ankle Weights', type: 'Strength', categories: ['Core / Abs'] },
  { name: 'Weighted Decline Sit-Up', type: 'Strength', categories: ['Core / Abs'] },

  // CORE / ABS — BODYWEIGHT
  { name: 'Crunch', type: 'Bodyweight', categories: ['Core / Abs'] },
  { name: 'Sit-Up', type: 'Bodyweight', categories: ['Core / Abs'] },
  { name: 'Reverse Crunch', type: 'Bodyweight', categories: ['Core / Abs'] },
  { name: 'Bicycle Crunch', type: 'Bodyweight', categories: ['Core / Abs'] },
  { name: 'Leg Raise', type: 'Bodyweight', categories: ['Core / Abs'] },
  { name: 'Mountain Climber', type: 'Bodyweight', categories: ['Core / Abs', 'Full Body'] },
  { name: 'Dead Bug', type: 'Bodyweight', categories: ['Core / Abs'] },
  { name: 'Flutter Kicks', type: 'Bodyweight', categories: ['Core / Abs'] },
  { name: 'V-Up', type: 'Bodyweight', categories: ['Core / Abs'] },
  { name: 'Hanging Knee Raise', type: 'Bodyweight', categories: ['Core / Abs'] },

  // ============================================================
  // FOREARMS — STRENGTH
  // ============================================================
  { name: 'Wrist Curl', type: 'Strength', categories: ['Forearms'] },
  { name: 'Reverse Wrist Curl', type: 'Strength', categories: ['Forearms'] },
  { name: 'Reverse Barbell Curl', type: 'Strength', categories: ['Forearms', 'Biceps'] },
  { name: 'Dumbbell Wrist Rotation', type: 'Strength', categories: ['Forearms'] },
  { name: 'Dumbbell Farmer Carry', type: 'Strength', categories: ['Forearms', 'Full Body'], trackMetrics: ['Time'] },
  { name: 'Wrist Roller', type: 'Strength', categories: ['Forearms'], trackMetrics: ['Time'] },

  // FOREARMS — BODYWEIGHT
  { name: 'Dead Hang', type: 'Bodyweight', categories: ['Forearms', 'Back'], trackMetrics: ['Time'] },
  { name: 'Towel Hang', type: 'Bodyweight', categories: ['Forearms', 'Back'], trackMetrics: ['Time'] },
  { name: 'Pull-Up', type: 'Bodyweight', categories: ['Forearms', 'Back', 'Biceps'] },
  { name: 'Chin-Up', type: 'Bodyweight', categories: ['Forearms', 'Back', 'Biceps'] },
  { name: 'Fingertip Push-Up', type: 'Bodyweight', categories: ['Forearms', 'Chest', 'Triceps'] },

  // ============================================================
  // FULL BODY — STRENGTH
  // ============================================================
  { name: 'Barbell Deadlift', type: 'Strength', categories: ['Full Body', 'Back', 'Legs', 'Glutes', 'Hamstrings'] },
  { name: 'Power Clean', type: 'Strength', categories: ['Full Body', 'Legs', 'Shoulders', 'Back'] },
  { name: 'Thruster', type: 'Strength', categories: ['Full Body', 'Legs', 'Shoulders', 'Quads'] },
  { name: 'Kettlebell Swing', type: 'Strength', categories: ['Full Body', 'Glutes', 'Hamstrings', 'Back'] },
  { name: 'Dumbbell Man Maker', type: 'Strength', categories: ['Full Body', 'Chest', 'Shoulders', 'Legs'] },
  { name: 'Barbell Clean and Press', type: 'Strength', categories: ['Full Body', 'Shoulders', 'Legs'] },

  // FULL BODY — BODYWEIGHT
  { name: 'Burpee', type: 'Bodyweight', categories: ['Full Body', 'Chest', 'Legs', 'Cardio'] },
  { name: 'Jumping Jack', type: 'Bodyweight', categories: ['Full Body', 'Cardio'] },
  { name: 'Bear Crawl', type: 'Bodyweight', categories: ['Full Body', 'Core / Abs', 'Shoulders'] },
  { name: 'Inchworm', type: 'Bodyweight', categories: ['Full Body', 'Core / Abs', 'Shoulders'] },
  { name: 'Mountain Climber', type: 'Bodyweight', categories: ['Full Body', 'Core / Abs', 'Cardio'] },
  { name: 'Squat Thrust', type: 'Bodyweight', categories: ['Full Body', 'Legs', 'Cardio'] },
  { name: 'Push-Up', type: 'Bodyweight', categories: ['Full Body', 'Chest', 'Triceps'] },

  // ============================================================
  // CARDIO — TIME-BASED
  // Track the duration of the activity.
  // ============================================================
  {
    name: 'Treadmill Running',
    type: 'Bodyweight',
    categories: ['Cardio'],
    trackMetrics: ['Time'],
  },
  {
    name: 'Stationary Cycling',
    type: 'Bodyweight',
    categories: ['Cardio'],
    trackMetrics: ['Time'],
  },
  {
    name: 'Elliptical Trainer',
    type: 'Bodyweight',
    categories: ['Cardio'],
    trackMetrics: ['Time'],
  },
  {
    name: 'Rowing Machine',
    type: 'Bodyweight',
    categories: ['Cardio', 'Full Body'],
    trackMetrics: ['Time'],
  },
  {
    name: 'Stair Climber',
    type: 'Bodyweight',
    categories: ['Cardio', 'Legs'],
    trackMetrics: ['Time'],
  },
  {
    name: 'Jump Rope',
    type: 'Bodyweight',
    categories: ['Cardio', 'Full Body', 'Calves'],
    trackMetrics: ['Time'],
  },
  {
    name: 'Swimming',
    type: 'Bodyweight',
    categories: ['Cardio', 'Full Body'],
    trackMetrics: ['Time'],
  },
  {
    name: 'Shadow Boxing',
    type: 'Bodyweight',
    categories: ['Cardio', 'Full Body'],
    trackMetrics: ['Time'],
  },
  {
    name: 'High Knees',
    type: 'Bodyweight',
    categories: ['Cardio', 'Full Body', 'Legs'],
    trackMetrics: ['Time'],
  },
  {
    name: 'Burpee Intervals',
    type: 'Bodyweight',
    categories: ['Cardio', 'Full Body'],
    trackMetrics: ['Time'],
  },

  // ============================================================
  // CARDIO — DISTANCE-BASED
  // Track the distance completed.
  // ============================================================
  {
    name: 'Outdoor Running',
    type: 'Bodyweight',
    categories: ['Cardio'],
    trackMetrics: ['Distance'],
  },
  {
    name: 'Outdoor Walking',
    type: 'Bodyweight',
    categories: ['Cardio'],
    trackMetrics: ['Distance'],
  },
  {
    name: 'Treadmill Walking',
    type: 'Bodyweight',
    categories: ['Cardio'],
    trackMetrics: ['Distance'],
  },
  {
    name: 'Treadmill Running Distance',
    type: 'Bodyweight',
    categories: ['Cardio'],
    trackMetrics: ['Distance'],
  },
  {
    name: 'Outdoor Cycling',
    type: 'Bodyweight',
    categories: ['Cardio'],
    trackMetrics: ['Distance'],
  },
  {
    name: 'Stationary Bike Distance',
    type: 'Bodyweight',
    categories: ['Cardio'],
    trackMetrics: ['Distance'],
  },
  {
    name: 'Swimming Laps',
    type: 'Bodyweight',
    categories: ['Cardio', 'Full Body'],
    trackMetrics: ['Distance'],
  },
  {
    name: 'Rowing Distance',
    type: 'Bodyweight',
    categories: ['Cardio', 'Full Body'],
    trackMetrics: ['Distance'],
  },
  {
    name: 'Hiking',
    type: 'Bodyweight',
    categories: ['Cardio', 'Legs'],
    trackMetrics: ['Distance'],
  },
  {
    name: 'Cross-Country Skiing',
    type: 'Bodyweight',
    categories: ['Cardio', 'Full Body'],
    trackMetrics: ['Distance'],
  },
];

// ============================================================
// DEFAULT EXERCISE LIBRARY
// ============================================================

function createExerciseId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const DEFAULT_EXERCISES: ExerciseItem[] = Array.from(
  new Map(
    exerciseSeeds.map((exercise) => {
      const id = createExerciseId(exercise.name);

      const item: ExerciseItem = {
        id,
        name: exercise.name,
        type: exercise.type,
        categories: exercise.categories,
        trackMetrics: exercise.trackMetrics ?? ['Reps'],
        isCustom: false,
        ...(exercise.note ? { note: exercise.note } : {}),
      };

      return [id, item];
    }),
  ).values(),
);