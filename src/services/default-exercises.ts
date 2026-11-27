import { createStore } from '@/lib/store';
import { ExerciseItem } from '@/types/exercise';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isBefore } from 'date-fns';
const STORAGE_KEY = '@exersaize:default_exercises_v1';


type ExerciseStorage = {
  isInitialized: boolean;
  lastSyncedAt: number | null;
  data: ExerciseItem[];
}

async function loadDefaultExercisesStorage(): Promise<ExerciseStorage> {
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
}

export const defaultExerciseStore = createStore<ExerciseStorage>(loadDefaultExercisesStorage, {
  isInitialized: false,
  lastSyncedAt: null,
  data: [],
});

async function loadDefaultExercises() {
  const { DEFAULT_EXERCISES } = await import('@/data/exercises');
  return await Promise.resolve({
    latestUpdatedAt: Date.now(),
    data: DEFAULT_EXERCISES
  });
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

export function subscribeToDefaultExerciseUpdates(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}


export const getDefaultExercises = async (): Promise<ExerciseStorage> => {
  await defaultExerciseStore.ensureLoaded();
  return defaultExerciseStore.get();
};

let defaultExerciseMap: Map<string, ExerciseItem> | null = null;

async function ensureDefaultExerciseMap(): Promise<Map<string, ExerciseItem>> {
  if (!defaultExerciseMap) {
    const { DEFAULT_EXERCISES } = await import('@/data/exercises');
    defaultExerciseMap = new Map(DEFAULT_EXERCISES.map((e) => [e.id, e]));
  }
  return defaultExerciseMap;
}

export async function getDefaultExerciseById(id: string): Promise<ExerciseItem | undefined> {
  const map = await ensureDefaultExerciseMap();
  return map.get(id);
}

export async function findDefaultExerciseByName(name: string): Promise<ExerciseItem | undefined> {
  const map = await ensureDefaultExerciseMap();
  return Array.from(map.values()).find((e) => e.name === name);
}

export const syncDefaultExercises = async (): Promise<void> => {
  try {
    const newExercisesUpdate = await loadDefaultExercises();
    
    // add new exercises to storage but don't overwrite existing ones with same id
    const defaultExercisesUpdate = defaultExerciseStore.get();

    if(!defaultExercisesUpdate.isInitialized) {
      defaultExercisesUpdate.lastSyncedAt = null;
      defaultExercisesUpdate.isInitialized = true;
      defaultExercisesUpdate.data = newExercisesUpdate.data;
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
    const updatedStorage: ExerciseStorage = { isInitialized: true, lastSyncedAt: Date.now(), data: updatedExercises };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStorage));
    defaultExerciseStore.setValue(updatedStorage);
    notifyListeners();
  } catch (error) {
    console.error('Failed to sync default exercises to storage:', error);
  }
};
