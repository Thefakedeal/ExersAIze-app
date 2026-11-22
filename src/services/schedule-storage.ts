import AsyncStorage from '@react-native-async-storage/async-storage';
import { addMonths, addWeeks, format, parse } from 'date-fns';

import { Recurrence, ScheduledOccurrence } from '@/types/schedule';

const STORAGE_KEY = '@exersaize:scheduled_occurrences_v1';

/** Number of future occurrences generated for a weekly or monthly activity. */
const RECURRENCE_LIMIT = 12;

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

export async function getScheduledOccurrenceById(id: string): Promise<ScheduledOccurrence | null> {
  try {
    const occurrences = await getScheduledOccurrences();
    return occurrences.find((item) => item.id === id) ?? null;
  } catch (error) {
    console.error('Failed to get scheduled occurrence by id:', error);
    return null;
  }
}

export async function updateScheduledOccurrence(
  id: string,
  data: Partial<Omit<ScheduledOccurrence, 'id'>>
): Promise<ScheduledOccurrence> {
  try {
    const currentList = await getScheduledOccurrences();
    const existingIndex = currentList.findIndex((item) => item.id === id);
    if (existingIndex === -1) {
      throw new Error(`Scheduled occurrence with id ${id} not found`);
    }

    const updatedOccurrence: ScheduledOccurrence = {
      ...currentList[existingIndex],
      ...data,
      title: data.title !== undefined ? data.title.trim() || 'Activity' : currentList[existingIndex].title,
      notes: data.notes !== undefined ? data.notes.trim() || undefined : currentList[existingIndex].notes,
    };

    currentList[existingIndex] = updatedOccurrence;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));
    notifyListeners();
    return updatedOccurrence;
  } catch (error) {
    console.error('Failed to update scheduled occurrence:', error);
    throw error;
  }
}

export async function saveScheduledOccurrence(data: {
  scheduledDate: string;
  title: string;
  routineId?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  recurrence?: Recurrence;
  notes?: string;
}): Promise<ScheduledOccurrence[]> {
  try {
    const currentList = await getScheduledOccurrences();

    const recurrence = data.recurrence ?? 'none';
    const seriesId =
      recurrence !== 'none'
        ? `series_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        : undefined;

    const occurrences = buildOccurrences(data, recurrence, seriesId);

    const updatedList = [...currentList, ...occurrences];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    notifyListeners();

    return occurrences;
  } catch (error) {
    console.error('Failed to save scheduled occurrence to storage:', error);
    throw error;
  }
}

function buildOccurrences(
  data: {
    scheduledDate: string;
    title: string;
    routineId?: string;
    startTime?: string;
    endTime?: string;
    allDay?: boolean;
    recurrence?: Recurrence;
    notes?: string;
  },
  recurrence: Recurrence,
  seriesId?: string
): ScheduledOccurrence[] {
  const baseDate = parse(data.scheduledDate, 'yyyy-MM-dd', new Date());
  const count = recurrence === 'none' ? 1 : RECURRENCE_LIMIT;
  const occurrences: ScheduledOccurrence[] = [];

  for (let i = 0; i < count; i += 1) {
    const date =
      recurrence === 'weekly'
        ? addWeeks(baseDate, i)
        : recurrence === 'monthly'
          ? addMonths(baseDate, i)
          : baseDate;

    const occurrence: ScheduledOccurrence = {
      id: `occ_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${i}`,
      scheduledDate: format(date, 'yyyy-MM-dd'),
      status: 'scheduled',
      title: data.title.trim(),
      routineId: data.routineId,
      notes: data.notes?.trim() || undefined,
      recurrence,
      seriesId,
    };

    if (data.allDay) {
      occurrence.allDay = true;
    } else {
      occurrence.startTime = data.startTime;
      occurrence.endTime = data.endTime;
    }

    occurrences.push(occurrence);
  }

  return occurrences;
}
