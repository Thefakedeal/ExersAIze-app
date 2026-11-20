import AsyncStorage from '@react-native-async-storage/async-storage';

import { ScheduledOccurrence } from '@/types/schedule';

const STORAGE_KEY = '@exersaize:scheduled_occurrences_v1';

type StorageListener = () => void;

const listeners = new Set<StorageListener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error notifying schedule storage listener:', e);
    }
  });
}

export function subscribeToScheduleUpdates(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function getScheduledOccurrences(): Promise<ScheduledOccurrence[]> {
  try {
    const rawData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return [];
    }

    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load scheduled occurrences from storage:', error);
    return [];
  }
}

export async function saveScheduledOccurrence(data: {
  scheduledDate: string;
  title: string;
  routineId?: string;
  startTime?: string;
}): Promise<ScheduledOccurrence> {
  try {
    const currentList = await getScheduledOccurrences();

    const newOccurrence: ScheduledOccurrence = {
      id: `occ_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      scheduledDate: data.scheduledDate,
      status: 'scheduled',
      title: data.title.trim(),
      routineId: data.routineId,
      startTime: data.startTime,
    };

    const updatedList = [...currentList, newOccurrence];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    notifyListeners();

    return newOccurrence;
  } catch (error) {
    console.error('Failed to save scheduled occurrence to storage:', error);
    throw error;
  }
}
