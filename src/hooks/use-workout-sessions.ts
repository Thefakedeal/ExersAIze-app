import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Alert } from 'react-native';
import {
  deleteWorkoutSession,
  getWorkoutSessionById,
  saveWorkoutSession,
  updateWorkoutSession,
  workoutSessionStore,
} from '@/services/session-storage';

export function useWorkoutSessions() {
  const sessions = useSyncExternalStore(
    workoutSessionStore.subscribe,
    workoutSessionStore.getSnapshot
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    workoutSessionStore
      .ensureLoaded()
      .then(() => {
        if (isMounted) setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          Alert.alert('Error', 'Failed to load workout sessions.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      await workoutSessionStore.refresh();
    } catch {
      Alert.alert('Error', 'Failed to load workout sessions.');
    }
  }, []);

  const removeSession = useCallback(async (id: string) => {
    try {
      await deleteWorkoutSession(id);
    } catch {
      Alert.alert('Error', 'Failed to delete workout session.');
    }
  }, []);

  return {
    sessions,
    loading,
    refresh,
    removeSession,
    saveSession: saveWorkoutSession,
    updateSession: updateWorkoutSession,
    getSession: getWorkoutSessionById,
  };
}
