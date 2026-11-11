import { DEFAULT_EXERCISES } from '@/data/exercises';
import { ExerciseItem } from '@/types/exercise';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isBefore } from 'date-fns';
const STORAGE_KEY = '@exersaize:default_exercises_v1';


type ExerciseStorage = {
  isInitialized: boolean;
  lastSyncedAt: number | null;
  data: ExerciseItem[];
}

type StorageListener = () => void;
const listeners = new Set<StorageListener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error notifying storage listener:', e);
    }
  });
}

async function loadDefaultExercises() {
  return await Promise.resolve({
    latestUpdatedAt: Date.now(),
    data: DEFAULT_EXERCISES
  });
}
export function subscribeToDefaultExerciseUpdates(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}


export const getDefaultExercises = async (): Promise<ExerciseStorage> => {
  try {
    const rawData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return { isInitialized: false, lastSyncedAt: null, data: [] };
    }
    const parsed = JSON.parse(rawData);
    return parsed;
  } catch (error) {
    console.error('Failed to load default exercises from storage:', error);
    return { isInitialized: false, lastSyncedAt: null, data: [] };
  }
};

export const syncDefaultExercises = async (): Promise<void> => {
  try {
    const newExercisesUpdate = await loadDefaultExercises();
    
    // add new exercises to storage but don't overwrite existing ones with same id
    const defaultExercisesUpdate = await getDefaultExercises();

    if(!defaultExercisesUpdate.isInitialized) {
      defaultExercisesUpdate.lastSyncedAt = null;
      defaultExercisesUpdate.isInitialized = true;
      defaultExercisesUpdate.data = DEFAULT_EXERCISES;
    }

    if(defaultExercisesUpdate.lastSyncedAt && isBefore(newExercisesUpdate.latestUpdatedAt, defaultExercisesUpdate.lastSyncedAt)) {
      return;
    }

    const defaultExercises = defaultExercisesUpdate.data;
    const newExercises = newExercisesUpdate.data;
    // remove existing exercises with same id
    const newExerciseIds = new Set(newExercises.map((e) => e.id));
    const updatedExercises = defaultExercises.filter((e) => !newExerciseIds.has(e.id));
    updatedExercises.push(...newExercises);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ isInitialized: true, lastSyncedAt: Date.now(), data: updatedExercises }));
    notifyListeners();
  } catch (error) {
    console.error('Failed to sync default exercises to storage:', error);
  }
};