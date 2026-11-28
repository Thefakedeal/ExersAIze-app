import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Alert } from 'react-native';

import { getDefaultExercises } from '@/services/default-data';
import { customExerciseStore } from '@/services/exercise-storage';

export function useExercises() {
  const customExercises = useSyncExternalStore(
    customExerciseStore.subscribe,
    customExerciseStore.getSnapshot
  );
  const defaultExercises = getDefaultExercises();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    customExerciseStore
      .ensureLoaded()
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

  return {
    customExercises,
    defaultExercises,
    loading,
    refresh,
  };
}
