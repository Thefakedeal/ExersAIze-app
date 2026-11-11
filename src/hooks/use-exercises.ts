import { getDefaultExercises, syncDefaultExercises } from '@/services/default-exercises';
import { getCustomExercises, subscribeToExerciseUpdates } from '@/services/exercise-storage';
import { ExerciseItem } from '@/types/exercise';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useExercises() {
  const [customExercises, setCustomExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultExercises, setDefaultExercises] = useState<ExerciseItem[]>([]);
  const [loadingDefault, setLoadingDefault] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const stored = await getCustomExercises();
      setCustomExercises(stored);
    } catch (e) {
      Alert.alert('Error', 'Failed to load exercises. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDefaultExercises = useCallback(async () => {
    try {
      await syncDefaultExercises();
      const stored = await getDefaultExercises();
      setDefaultExercises(stored.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load exercises. Please try again.');
    } finally {
      setLoadingDefault(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    void getCustomExercises().then((stored) => {
      if (isMounted) {
        setCustomExercises(stored);
        setLoading(false);
      }
    });

    const unsubscribe = subscribeToExerciseUpdates(() => {
      void getCustomExercises().then((stored) => {
        if (isMounted) {
          setCustomExercises(stored);
        }
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    void getDefaultExercises().then((stored) => {
      if (isMounted) {
        setDefaultExercises(stored.data);
        setLoadingDefault(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    customExercises,
    defaultExercises,
    loading: loading || loadingDefault,
    refresh: loadData,
    syncDefault: loadDefaultExercises
  };
}
