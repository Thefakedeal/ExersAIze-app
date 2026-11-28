import { getDb } from '@/db/database';
import { createStore } from '@/lib/store';
import { ExerciseItem, ExerciseType, TrackMetric } from '@/types/exercise';

type ExerciseRow = {
  id: string;
  name: string;
  type: string;
  categories: string;
  track_metrics: string;
  note: string | null;
  is_custom: number;
  created_at: number | null;
};

async function loadCustomExercises(): Promise<ExerciseItem[]> {
  try {
    const db = await getDb();
    const rows = await db.getAllAsync<ExerciseRow>(
      'SELECT * FROM exercises WHERE is_custom = 1 ORDER BY created_at DESC'
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type as ExerciseType,
      categories: JSON.parse(r.categories) as string[],
      trackMetrics: JSON.parse(r.track_metrics) as TrackMetric[],
      note: r.note ?? undefined,
      isCustom: true,
      createdAt: r.created_at ?? undefined,
    }));
  } catch (error) {
    console.error('Failed to load custom exercises from storage:', error);
    return [];
  }
}

export const customExerciseStore = createStore<ExerciseItem[]>(loadCustomExercises, []);

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
  await customExerciseStore.ensureLoaded();
  return customExerciseStore.get();
}

export async function saveCustomExercise(data: {
  name: string;
  type: ExerciseType;
  categories: string[];
  trackMetrics: TrackMetric[];
  note?: string;
}): Promise<ExerciseItem> {
  try {
    const currentList = customExerciseStore.get();
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

    const db = await getDb();
    await db.runAsync(
      `INSERT INTO exercises (id, name, type, categories, track_metrics, note, is_custom, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      newExercise.id,
      newExercise.name,
      newExercise.type,
      JSON.stringify(newExercise.categories),
      JSON.stringify(newExercise.trackMetrics),
      newExercise.note ?? null,
      newExercise.createdAt ?? null
    );

    customExerciseStore.setValue([newExercise, ...currentList]);
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
    const currentList = customExerciseStore.get();
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

    const db = await getDb();
    await db.runAsync(
      'UPDATE exercises SET name = ?, type = ?, categories = ?, track_metrics = ?, note = ? WHERE id = ?',
      data.name.trim(),
      data.type,
      JSON.stringify(data.categories),
      JSON.stringify(data.trackMetrics),
      data.note?.trim() || null,
      id
    );

    customExerciseStore.setValue(updatedList);
    notifyListeners();
  } catch (error) {
    console.error('Failed to update custom exercise in storage:', error);
    throw error;
  }
}

export async function deleteCustomExercise(id: string): Promise<void> {
  try {
    const currentList = customExerciseStore.get();
    const updatedList = currentList.filter((item) => item.id !== id);

    const db = await getDb();
    await db.runAsync('DELETE FROM exercises WHERE id = ?', id);

    customExerciseStore.setValue(updatedList);
    notifyListeners();
  } catch (error) {
    console.error('Failed to delete custom exercise from storage:', error);
    throw error;
  }
}
