import { getDb } from '@/db/database';
import { createStore } from '@/lib/store';
import { RoutineItem, RoutineExercise } from '@/types/routine';

type RoutineRow = {
  id: string;
  name: string;
  description: string | null;
  exercises: string;
  exercise_count: number | null;
  is_custom: number;
  created_at: number | null;
};

async function loadCustomRoutines(): Promise<RoutineItem[]> {
  try {
    const db = await getDb();
    const rows = await db.getAllAsync<RoutineRow>(
      'SELECT * FROM routines WHERE is_custom = 1 ORDER BY created_at DESC'
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? undefined,
      exercises: JSON.parse(r.exercises) as RoutineExercise[],
      exerciseCount: r.exercise_count ?? undefined,
      isCustom: true,
      createdAt: r.created_at ?? undefined,
    }));
  } catch (error) {
    console.error('Failed to load custom routines from storage:', error);
    return [];
  }
}

export const customRoutineStore = createStore<RoutineItem[]>(loadCustomRoutines, []);

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
  await customRoutineStore.ensureLoaded();
  return customRoutineStore.get();
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
    const currentList = customRoutineStore.get();
    const newRoutine: RoutineItem = {
      id: `routine_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      exercises: data.exercises,
      exerciseCount: data.exercises.length,
      isCustom: true,
      createdAt: Date.now(),
    };

    const db = await getDb();
    await db.runAsync(
      `INSERT INTO routines (id, name, description, exercises, exercise_count, is_custom, created_at)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      newRoutine.id,
      newRoutine.name,
      newRoutine.description ?? null,
      JSON.stringify(newRoutine.exercises ?? []),
      newRoutine.exerciseCount ?? null,
      newRoutine.createdAt ?? null
    );

    customRoutineStore.setValue([newRoutine, ...currentList]);
    notifyListeners();
    return newRoutine;
  } catch (error) {
    console.error('Failed to save custom routine to storage:', error);
    throw error;
  }
}

export async function updateCustomRoutine(
  id: string,
  data: { name: string; description?: string; exercises: RoutineExercise[] }
): Promise<void> {
  try {
    const currentList = customRoutineStore.get();
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

    const db = await getDb();
    await db.runAsync(
      'UPDATE routines SET name = ?, description = ?, exercises = ?, exercise_count = ? WHERE id = ?',
      data.name.trim(),
      data.description?.trim() || null,
      JSON.stringify(data.exercises),
      data.exercises.length,
      id
    );

    customRoutineStore.setValue(updatedList);
    notifyListeners();
  } catch (error) {
    console.error('Failed to update custom routine in storage:', error);
    throw error;
  }
}

export async function deleteCustomRoutine(id: string): Promise<void> {
  try {
    const currentList = customRoutineStore.get();
    const updatedList = currentList.filter((item) => item.id !== id);

    const db = await getDb();
    await db.runAsync('DELETE FROM routines WHERE id = ?', id);

    customRoutineStore.setValue(updatedList);
    notifyListeners();
  } catch (error) {
    console.error('Failed to delete custom routine from storage:', error);
    throw error;
  }
}
