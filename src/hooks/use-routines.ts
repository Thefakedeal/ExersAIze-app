import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Alert } from 'react-native';

import { getDefaultRoutines } from '@/services/default-data';
import {
  customRoutineStore,
  deleteCustomRoutine,
} from '@/services/routine-storage';

export function useRoutines() {
  const customRoutines = useSyncExternalStore(
    customRoutineStore.subscribe,
    customRoutineStore.getSnapshot
  );
  const defaultRoutines = getDefaultRoutines();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    customRoutineStore
      .ensureLoaded()
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
    loading,
    refresh,
    removeRoutine,
  };
}
