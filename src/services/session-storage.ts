import { getDb } from '@/db/database';
import { createStore } from '@/lib/store';
import { ReferenceMode, SessionExercise, WorkoutSession } from '@/types/session';

type SessionRow = {
  id: string;
  title: string;
  description: string | null;
  routine_id: string | null;
  start_time: number;
  end_time: number | null;
  exercises: string;
  reference_mode: string | null;
  created_at: number;
};

function rowToSession(r: SessionRow): WorkoutSession {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    routineId: r.routine_id ?? undefined,
    startTime: r.start_time,
    endTime: r.end_time,
    exercises: JSON.parse(r.exercises) as SessionExercise[],
    referenceMode: (r.reference_mode ?? undefined) as ReferenceMode | undefined,
    createdAt: r.created_at,
  };
}

async function loadWorkoutSessions(): Promise<WorkoutSession[]> {
  try {
    const db = await getDb();
    const rows = await db.getAllAsync<SessionRow>('SELECT * FROM sessions ORDER BY start_time DESC');
    return rows.map(rowToSession);
  } catch (error) {
    console.error('Failed to load workout sessions from storage:', error);
    return [];
  }
}

export const workoutSessionStore = createStore<WorkoutSession[]>(loadWorkoutSessions, []);

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
  await workoutSessionStore.ensureLoaded();
  return workoutSessionStore.get();
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
  referenceMode?: ReferenceMode;
}): Promise<WorkoutSession> {
  try {
    const currentList = workoutSessionStore.get();
    const newSession: WorkoutSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: data.title.trim() || 'Workout Session',
      description: data.description?.trim() || undefined,
      routineId: data.routineId,
      startTime: data.startTime || Date.now(),
      endTime: data.endTime,
      exercises: data.exercises,
      referenceMode: data.referenceMode,
      createdAt: Date.now(),
    };

    const db = await getDb();
    await db.runAsync(
      `INSERT INTO sessions (id, title, description, routine_id, start_time, end_time, exercises, reference_mode, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      newSession.id,
      newSession.title,
      newSession.description ?? null,
      newSession.routineId ?? null,
      newSession.startTime,
      newSession.endTime ?? null,
      JSON.stringify(newSession.exercises),
      newSession.referenceMode ?? null,
      newSession.createdAt
    );

    const updatedList = [newSession, ...currentList.filter((s) => s.id !== newSession.id)];
    workoutSessionStore.setValue(updatedList);
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
    const currentList = workoutSessionStore.get();
    const existingIndex = currentList.findIndex((item) => item.id === id);
    if (existingIndex === -1) {
      throw new Error(`Session with id ${id} not found`);
    }

    const updatedSession: WorkoutSession = {
      ...currentList[existingIndex],
      ...data,
      title:
        data.title !== undefined ? data.title.trim() || 'Workout Session' : currentList[existingIndex].title,
      description:
        data.description !== undefined
          ? data.description.trim() || undefined
          : currentList[existingIndex].description,
    };

    const db = await getDb();
    await db.runAsync(
      `UPDATE sessions SET title = ?, description = ?, start_time = ?, end_time = ?, exercises = ?, reference_mode = ?
       WHERE id = ?`,
      updatedSession.title,
      updatedSession.description ?? null,
      updatedSession.startTime,
      updatedSession.endTime ?? null,
      JSON.stringify(updatedSession.exercises),
      updatedSession.referenceMode ?? null,
      id
    );

    const updatedList = [...currentList];
    updatedList[existingIndex] = updatedSession;
    workoutSessionStore.setValue(updatedList);
    notifyListeners();
    return updatedSession;
  } catch (error) {
    console.error('Failed to update workout session:', error);
    throw error;
  }
}

export async function deleteWorkoutSession(id: string): Promise<void> {
  try {
    const currentList = workoutSessionStore.get();
    const updatedList = currentList.filter((item) => item.id !== id);

    const db = await getDb();
    await db.runAsync('DELETE FROM sessions WHERE id = ?', id);

    workoutSessionStore.setValue(updatedList);
    notifyListeners();
  } catch (error) {
    console.error('Failed to delete workout session:', error);
    throw error;
  }
}
