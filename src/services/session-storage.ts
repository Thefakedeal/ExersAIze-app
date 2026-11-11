import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession } from '@/types/session';

const STORAGE_KEY = '@exersaize:workout_sessions_v1';

type StorageListener = () => void;
const listeners = new Set<StorageListener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error notifying workout session storage listener:', e);
    }
  });
}

export function subscribeToSessionUpdates(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function getWorkoutSessions(): Promise<WorkoutSession[]> {
  try {
    const rawData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return [];
    }
    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Sort newest first
    return parsed.sort((a, b) => (b.startTime ?? b.createdAt) - (a.startTime ?? a.createdAt));
  } catch (error) {
    console.error('Failed to load workout sessions from storage:', error);
    return [];
  }
}

export async function getWorkoutSessionById(id: string): Promise<WorkoutSession | null> {
  const sessions = await getWorkoutSessions();
  return sessions.find((item) => item.id === id) ?? null;
}

export async function saveWorkoutSession(data: {
  title: string;
  description?: string;
  routineId?: string;
  startTime: number;
  endTime?: number | null;
  exercises: WorkoutSession['exercises'];
}): Promise<WorkoutSession> {
  try {
    const currentList = await getWorkoutSessions();
    const newSession: WorkoutSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: data.title.trim() || 'Workout Session',
      description: data.description?.trim() || undefined,
      routineId: data.routineId,
      startTime: data.startTime || Date.now(),
      endTime: data.endTime,
      exercises: data.exercises,
      createdAt: Date.now(),
    };

    const updatedList = [newSession, ...currentList.filter((s) => s.id !== newSession.id)];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    notifyListeners();
    return newSession;
  } catch (error) {
    console.error('Failed to save workout session:', error);
    throw error;
  }
}

export async function updateWorkoutSession(
  id: string,
  data: Partial<Omit<WorkoutSession, 'id' | 'createdAt'>>
): Promise<WorkoutSession> {
  try {
    const currentList = await getWorkoutSessions();
    const existingIndex = currentList.findIndex((item) => item.id === id);
    if (existingIndex === -1) {
      throw new Error(`Session with id ${id} not found`);
    }

    const updatedSession: WorkoutSession = {
      ...currentList[existingIndex],
      ...data,
      title: data.title !== undefined ? data.title.trim() || 'Workout Session' : currentList[existingIndex].title,
      description: data.description !== undefined ? data.description.trim() || undefined : currentList[existingIndex].description,
    };

    currentList[existingIndex] = updatedSession;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));
    notifyListeners();
    return updatedSession;
  } catch (error) {
    console.error('Failed to update workout session:', error);
    throw error;
  }
}

export async function deleteWorkoutSession(id: string): Promise<void> {
  try {
    const currentList = await getWorkoutSessions();
    const updatedList = currentList.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    notifyListeners();
  } catch (error) {
    console.error('Failed to delete workout session:', error);
    throw error;
  }
}
