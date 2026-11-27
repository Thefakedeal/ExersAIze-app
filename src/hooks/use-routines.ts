import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Alert } from 'react-native';
import {
  defaultRoutineStore,
  syncDefaultRoutines,
} from '@/services/default-routines';
import {
  customRoutineStore,
  deleteCustomRoutine,
} from '@/services/routine-storage';

export function useRoutines() {
  const customRoutines = useSyncExternalStore(
    customRoutineStore.subscribe,
    customRoutineStore.getSnapshot
  );
  const defaultRoutinesStorage = useSyncExternalStore(
    defaultRoutineStore.subscribe,
    defaultRoutineStore.getSnapshot
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([customRoutineStore.ensureLoaded(), defaultRoutineStore.ensureLoaded()])
      .then(() => {
        if (isMounted) setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          Alert.alert('Error', 'Failed to load routines. Please try again.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      await customRoutineStore.refresh();
    } catch {
      Alert.alert('Error', 'Failed to load routines. Please try again.');
    }
  }, []);

  const syncDefault = useCallback(async () => {
    try {
      await syncDefaultRoutines();
    } catch {
      Alert.alert('Error', 'Failed to load routines. Please try again.');
    }
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
    defaultRoutines: defaultRoutinesStorage.data,
    loading,
    refresh,
    removeRoutine,
    syncDefault,
  };
}
