import { DEFAULT_EXERCISES } from '@/data/exercises';
import { getCustomExercises, subscribeToExerciseUpdates } from '@/services/exercise-storage';
import { ExerciseItem } from '@/types/exercise';
import { useCallback, useEffect, useState } from 'react';

export function useExercises() {
  const [customExercises, setCustomExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const stored = await getCustomExercises();
      setCustomExercises(stored);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  return {
    customExercises,
    defaultExercises: DEFAULT_EXERCISES,
    loading,
    refresh: loadData,
  };
}
