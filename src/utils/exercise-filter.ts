import { ExerciseItem } from '@/types/exercise';

export function matchesExerciseQuery(exercise: ExerciseItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  return (
    exercise.name.toLowerCase().includes(q) ||
    exercise.type.toLowerCase().includes(q) ||
    exercise.categories.some((category) => category.toLowerCase().includes(q))
  );
}
