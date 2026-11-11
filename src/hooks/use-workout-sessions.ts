import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  deleteWorkoutSession,
  getWorkoutSessionById,
  getWorkoutSessions,
  saveWorkoutSession,
  subscribeToSessionUpdates,
  updateWorkoutSession,
} from '@/services/session-storage';
import { WorkoutSession } from '@/types/session';

export function useWorkoutSessions() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const stored = await getWorkoutSessions();
      setSessions(stored);
    } catch {
      Alert.alert('Error', 'Failed to load workout sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    void getWorkoutSessions().then((stored) => {
      if (isMounted) {
        setSessions(stored);
        setLoading(false);
      }
    });

    const unsubscribe = subscribeToSessionUpdates(() => {
      void getWorkoutSessions().then((stored) => {
        if (isMounted) {
          setSessions(stored);
        }
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
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
    refresh: loadSessions,
    removeSession,
    saveSession: saveWorkoutSession,
    updateSession: updateWorkoutSession,
    getSession: getWorkoutSessionById,
  };
}
