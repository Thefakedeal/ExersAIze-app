import { getDefaultRoutines, syncDefaultRoutines } from '@/services/default-routines';
import {
  deleteCustomRoutine,
  getCustomRoutines,
  subscribeToRoutineUpdates,
} from '@/services/routine-storage';
import { RoutineItem } from '@/types/routine';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';



export function useRoutines() {
  const [customRoutines, setCustomRoutines] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDefault, setLoadingDefault] = useState(true);
  const [defaultRoutines, setDefaultRoutines] = useState<RoutineItem[]>([]);

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

  const loadDefaultRoutines = useCallback(async () => {
    try {
      await syncDefaultRoutines();
      const stored = await getDefaultRoutines();
      setDefaultRoutines(stored.data);
    } catch {
      Alert.alert('Error', 'Failed to load routines. Please try again.');
    } finally {
      setLoadingDefault(false);
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

  useEffect(() => {
    let isMounted = true;

    void getDefaultRoutines().then((stored) => {
      if (isMounted) {
        setDefaultRoutines(stored.data);
        setLoadingDefault(false);
      }
    });

    return () => {
      isMounted = false;
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
    defaultRoutines,
    loading: loading || loadingDefault,
    refresh: loadData,
    removeRoutine,
    syncDefault: loadDefaultRoutines,
  };
}
