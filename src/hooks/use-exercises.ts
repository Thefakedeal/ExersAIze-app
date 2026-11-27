import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Alert } from 'react-native';
import {
  defaultExerciseStore,
  syncDefaultExercises,
} from '@/services/default-exercises';
import {
  customExerciseStore,
} from '@/services/exercise-storage';

export function useExercises() {
  const customExercises = useSyncExternalStore(
    customExerciseStore.subscribe,
    customExerciseStore.getSnapshot
  );
  const defaultExercisesStorage = useSyncExternalStore(
    defaultExerciseStore.subscribe,
    defaultExerciseStore.getSnapshot
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([customExerciseStore.ensureLoaded(), defaultExerciseStore.ensureLoaded()])
      .then(() => {
        if (isMounted) setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          Alert.alert('Error', 'Failed to load exercises. Please try again.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      await customExerciseStore.refresh();
    } catch {
      Alert.alert('Error', 'Failed to load exercises. Please try again.');
    }
  }, []);

  const syncDefault = useCallback(async () => {
    try {
      await syncDefaultExercises();
    } catch {
      Alert.alert('Error', 'Failed to load exercises. Please try again.');
    }
  }, []);

  return {
    customExercises,
    defaultExercises: defaultExercisesStorage.data,
    loading,
    refresh,
    syncDefault,
  };
}
