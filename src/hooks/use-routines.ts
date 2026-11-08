import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  deleteCustomRoutine,
  getCustomRoutines,
  subscribeToRoutineUpdates,
} from '@/services/routine-storage';
import { RoutineItem } from '@/types/routine';

export const DEFAULT_ROUTINES: RoutineItem[] = [
  {
    id: '1',
    name: 'Full Body Blast',
    description: 'Compound lifts targeting all major muscle groups',
    exerciseCount: 6,
  },
  {
    id: '2',
    name: 'Push Day (Chest, Shoulders, Triceps)',
    description: 'Focus on bench, overhead press, and dips',
    exerciseCount: 5,
  },
  {
    id: '3',
    name: 'Pull Day (Back & Biceps)',
    description: 'Deadlifts, rows, pull-ups, and curls',
    exerciseCount: 5,
  },
  {
    id: '4',
    name: 'Leg Day (Quads & Hamstrings)',
    description: 'Squats, lunges, leg press, and calves',
    exerciseCount: 6,
  },
  {
    id: '5',
    name: 'Upper Body Hypertrophy',
    description: 'High volume muscle building workout',
    exerciseCount: 7,
  },
  {
    id: '6',
    name: 'Core & HIIT Cardio',
    description: 'High intensity interval training with core work',
    exerciseCount: 4,
  },
  {
    id: '7',
    name: 'Morning Mobility & Stretching',
    description: 'Flexibility and active joint recovery',
    exerciseCount: 5,
  },
];

export function useRoutines() {
  const [customRoutines, setCustomRoutines] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const stored = await getCustomRoutines();
      setCustomRoutines(stored);
    } catch {
      Alert.alert('Error', 'Failed to load routines. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    void getCustomRoutines().then((stored) => {
      if (isMounted) {
        setCustomRoutines(stored);
        setLoading(false);
      }
    });

    const unsubscribe = subscribeToRoutineUpdates(() => {
      void getCustomRoutines().then((stored) => {
        if (isMounted) {
          setCustomRoutines(stored);
        }
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const removeRoutine = useCallback(async (id: string) => {
    try {
      await deleteCustomRoutine(id);
    } catch {
      Alert.alert('Error', 'Failed to delete routine.');
    }
  }, []);

  return {
    customRoutines,
    defaultRoutines: DEFAULT_ROUTINES,
    loading,
    refresh: loadData,
    removeRoutine,
  };
}
