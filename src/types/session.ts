import { ExerciseType, TrackMetric } from './exercise';

export interface SessionSet {
  id: string;
  setNumber: number;
  weight?: number;
  reps?: number;
  timeInSeconds?: number;
  distance?: number;
  completed?: boolean;
  note?: string; // Short note on how it felt
}

export interface SessionExercise {
  id: string;
  exerciseId: string;
  name: string;
  type?: ExerciseType;
  categories?: string[];
  trackMetrics?: TrackMetric[];
  sets: SessionSet[];
  note?: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  description?: string;
  routineId?: string;
  startTime: number; // ms timestamp
  endTime?: number | null; // ms timestamp or null if in progress
  exercises: SessionExercise[];
  createdAt: number;
}
