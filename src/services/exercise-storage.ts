import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExerciseItem, ExerciseType, TrackMetric } from '@/types/exercise';

const STORAGE_KEY = '@exersaize:custom_exercises_v1';

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

export function subscribeToExerciseUpdates(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function getCustomExercises(): Promise<ExerciseItem[]> {
  try {
    const rawData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return [];
    }
    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error) {
    console.error('Failed to load custom exercises from storage:', error);
    return [];
  }
}

export async function saveCustomExercise(data: {
  name: string;
  type: ExerciseType;
  categories: string[];
  trackMetrics: TrackMetric[];
  note?: string;
}): Promise<ExerciseItem> {
  try {
    const currentList = await getCustomExercises();
    const newExercise: ExerciseItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      type: data.type,
      categories: data.categories,
      trackMetrics: data.trackMetrics,
      note: data.note?.trim() || undefined,
      isCustom: true,
      createdAt: Date.now(),
    };

    const updatedList = [newExercise, ...currentList];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    notifyListeners();
    return newExercise;
  } catch (error) {
    console.error('Failed to save custom exercise to storage:', error);
    throw error;
  }
}

export async function updateCustomExercise(
  id: string,
  data: {
    name: string;
    type: ExerciseType;
    categories: string[];
    trackMetrics: TrackMetric[];
    note?: string;
  }
): Promise<void> {
  try {
    const currentList = await getCustomExercises();
    const updatedList = currentList.map((item) =>
      item.id === id
        ? {
            ...item,
            name: data.name.trim(),
            type: data.type,
            categories: data.categories,
            trackMetrics: data.trackMetrics,
            note: data.note?.trim() || undefined,
          }
        : item
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    notifyListeners();
  } catch (error) {
    console.error('Failed to update custom exercise in storage:', error);
    throw error;
  }
}

export async function deleteCustomExercise(id: string): Promise<void> {
  try {
    const currentList = await getCustomExercises();
    const updatedList = currentList.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    notifyListeners();
  } catch (error) {
    console.error('Failed to delete custom exercise from storage:', error);
    throw error;
  }
}
