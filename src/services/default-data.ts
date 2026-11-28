import { DEFAULT_EXERCISES } from '@/data/exercises';
import { DEFAULT_ROUTINES } from '@/data/routine';
import { ExerciseItem } from '@/types/exercise';
import { RoutineItem } from '@/types/routine';

const defaultExerciseMap = new Map(DEFAULT_EXERCISES.map((e) => [e.id, e]));

export function getDefaultExercises(): ExerciseItem[] {
  return DEFAULT_EXERCISES;
}

export function getDefaultRoutines(): RoutineItem[] {
  return DEFAULT_ROUTINES as RoutineItem[];
}

export function getDefaultExerciseById(id: string): ExerciseItem | undefined {
  return defaultExerciseMap.get(id);
}

export function findDefaultExerciseByName(name: string): ExerciseItem | undefined {
  return DEFAULT_EXERCISES.find((e) => e.name === name);
}
