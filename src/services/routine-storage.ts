import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoutineItem, RoutineExercise } from '@/types/routine';

const STORAGE_KEY = '@exersaize:custom_routines_v1';

type StorageListener = () => void;
const listeners = new Set<StorageListener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error notifying routine storage listener:', e);
    }
  });
}

export function subscribeToRoutineUpdates(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function getCustomRoutines(): Promise<RoutineItem[]> {
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
    console.error('Failed to load custom routines from storage:', error);
    return [];
  }
}

export async function getCustomRoutineById(id: string): Promise<RoutineItem | null> {
  const list = await getCustomRoutines();
  return list.find((item) => item.id === id) ?? null;
}

export async function saveCustomRoutine(data: {
  name: string;
  description?: string;
  exercises: RoutineExercise[];
}): Promise<RoutineItem> {
  try {
    const currentList = await getCustomRoutines();
    const newRoutine: RoutineItem = {
      id: `routine_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      exercises: data.exercises,
      exerciseCount: data.exercises.length,
      isCustom: true,
      createdAt: Date.now(),
    };

    const updatedList = [newRoutine, ...currentList];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    notifyListeners();
    return newRoutine;
  } catch (error) {
    console.error('Failed to save custom routine to storage:', error);
    throw error;
  }
}

export async function updateCustomRoutine(
  id: string,
  data: {
    name: string;
    description?: string;
    exercises: RoutineExercise[];
  }
): Promise<void> {
  try {
    const currentList = await getCustomRoutines();
    const updatedList = currentList.map((item) =>
      item.id === id
        ? {
            ...item,
            name: data.name.trim(),
            description: data.description?.trim() || undefined,
            exercises: data.exercises,
            exerciseCount: data.exercises.length,
          }
        : item
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    notifyListeners();
  } catch (error) {
    console.error('Failed to update custom routine in storage:', error);
    throw error;
  }
}

export async function deleteCustomRoutine(id: string): Promise<void> {
  try {
    const currentList = await getCustomRoutines();
    const updatedList = currentList.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    notifyListeners();
  } catch (error) {
    console.error('Failed to delete custom routine from storage:', error);
    throw error;
  }
}
