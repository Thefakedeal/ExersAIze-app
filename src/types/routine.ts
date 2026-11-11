import { ExerciseType } from './exercise';

export interface RoutineExercise {
  id: string; // unique item id inside this routine instance
  exerciseId: string;
  name: string;
  type?: ExerciseType;
  categories?: string[];
  sets: number;
  repRange: string;
}

export interface RoutineItem {
  id: string;
  name: string;
  description?: string;
  exercises?: RoutineExercise[];
  exerciseCount?: number;
  isCustom?: boolean;
  createdAt?: number;
}
