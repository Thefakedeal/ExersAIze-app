import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addMonths,
  addWeeks,
  format,
  isAfter,
  isSameDay,
  parse,
  parseISO,
  startOfDay,
} from 'date-fns';

import { Recurrence, ScheduledOccurrence } from '@/types/schedule';

const STORAGE_KEY = '@exersaize:scheduled_occurrences_v1';

/** Number of future occurrences generated for a weekly or monthly activity. */
const RECURRENCE_LIMIT = 12;

export type DeleteScope = 'this' | 'future' | 'all';
export type EditScope = 'this' | 'future' | 'all';

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

export async function deleteScheduledOccurrence(
  id: string,
  scope: DeleteScope = 'this'
): Promise<void> {
  try {
    const currentList = await getScheduledOccurrences();
    const target = currentList.find((item) => item.id === id);
    if (!target) {
      throw new Error(`Scheduled occurrence with id ${id} not found`);
    }

    const isRecurring = target.recurrence !== 'none' && target.seriesId;
    let updatedList: ScheduledOccurrence[];

    if (!isRecurring || scope === 'this') {
      updatedList = currentList.filter((item) => item.id !== id);
    } else if (scope === 'all') {
      updatedList = currentList.filter((item) => item.seriesId !== target.seriesId);
    } else {
      // future: keep occurrences in the series scheduled before the target date
      updatedList = currentList.filter((item) => {
        if (item.seriesId !== target.seriesId) return true;
        return item.scheduledDate < target.scheduledDate;
      });
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    notifyListeners();
  } catch (error) {
    console.error('Failed to delete scheduled occurrence:', error);
    throw error;
  }
}

export async function updateScheduledOccurrenceWithScope(
  id: string,
  data: Partial<Omit<ScheduledOccurrence, 'id'>>,
  scope: EditScope = 'this'
): Promise<ScheduledOccurrence[]> {
  try {
    const currentList = await getScheduledOccurrences();
    const targetIndex = currentList.findIndex((item) => item.id === id);
    if (targetIndex === -1) {
      throw new Error(`Scheduled occurrence with id ${id} not found`);
    }

    const target = currentList[targetIndex];
    const isRecurring = target.recurrence !== 'none' && target.seriesId;

    if (!isRecurring || scope === 'this') {
      const updated: ScheduledOccurrence = {
        ...target,
        ...data,
        title: data.title !== undefined ? data.title.trim() || 'Activity' : target.title,
        notes: data.notes !== undefined ? data.notes.trim() || undefined : target.notes,
      };

      if (scope === 'this' && isRecurring) {
        // Detach the modified occurrence from the series so it becomes standalone
        updated.recurrence = 'none';
        updated.seriesId = undefined;
      }

      currentList[targetIndex] = updated;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));
      notifyListeners();
      return [updated];
    }

    const seriesId = target.seriesId as string;

    if (scope === 'all') {
      return applySeriesEditAll(currentList, seriesId, data);
    }

    return applySeriesEditFuture(currentList, target, data);
  } catch (error) {
    console.error('Failed to update scheduled occurrence with scope:', error);
    throw error;
  }
}

function normalizeOccurrenceData(
  base: ScheduledOccurrence,
  data: Partial<Omit<ScheduledOccurrence, 'id'>>
): Partial<Omit<ScheduledOccurrence, 'id'>> {
  return {
    ...data,
    title: data.title !== undefined ? data.title.trim() || 'Activity' : base.title,
    notes: data.notes !== undefined ? data.notes.trim() || undefined : base.notes,
  };
}

async function persistOccurrences(list: ScheduledOccurrence[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  notifyListeners();
}

async function applySeriesEditAll(
  currentList: ScheduledOccurrence[],
  seriesId: string,
  data: Partial<Omit<ScheduledOccurrence, 'id'>>
): Promise<ScheduledOccurrence[]> {
  const seriesOccurrences = currentList.filter((item) => item.seriesId === seriesId);
  const recurrenceChanged = data.recurrence !== undefined && data.recurrence !== seriesOccurrences[0]?.recurrence;
  const dateChanged =
    data.scheduledDate !== undefined && data.scheduledDate !== seriesOccurrences[0]?.scheduledDate;

  if (!recurrenceChanged && !dateChanged) {
    const normalized = normalizeOccurrenceData(seriesOccurrences[0], data);
    const updatedList = currentList.map((item) => {
      if (item.seriesId !== seriesId) return item;
      return { ...item, ...normalized };
    });
    await persistOccurrences(updatedList);
    return updatedList.filter((item) => item.seriesId === seriesId);
  }

  // Recurrence or start date changed: preserve past occurrences (with their dates and sessions),
  // regenerate future occurrences using the new recurrence rule.
  const today = startOfDay(new Date());
  const newSeriesId = `series_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newRecurrence = data.recurrence as Recurrence;

  const preserved: ScheduledOccurrence[] = [];
  let anchor: ScheduledOccurrence | null = null;

  for (const item of currentList) {
    if (item.seriesId !== seriesId) {
      preserved.push(item);
      continue;
    }

    const itemDate = startOfDay(parseISO(item.scheduledDate));
    const isFutureOrToday = isAfter(itemDate, today) || isSameDay(itemDate, today);

    if (!isFutureOrToday) {
      // Past occurrence: update editable fields only, keep date and session link
      const normalized = normalizeOccurrenceData(item, data);
      preserved.push({ ...item, ...normalized, seriesId: newSeriesId });
    } else if (!anchor) {
      // First future/today occurrence becomes the anchor for the regenerated series
      anchor = item;
    }
  }

  let regenerated: ScheduledOccurrence[] = [];

  if (anchor) {
    const baseDate = data.scheduledDate ?? anchor.scheduledDate;
    const generated = buildOccurrences(
      {
        scheduledDate: baseDate,
        title: data.title ?? anchor.title ?? 'Activity',
        routineId: data.routineId ?? anchor.routineId,
        startTime: data.startTime ?? anchor.startTime,
        endTime: data.endTime ?? anchor.endTime,
        allDay: data.allDay ?? anchor.allDay,
        recurrence: newRecurrence,
        notes: data.notes ?? anchor.notes,
      },
      newRecurrence,
      newSeriesId
    );

    regenerated = generated.map((occ, index) => {
      if (index === 0) {
        const normalized = normalizeOccurrenceData(anchor!, data);
        return {
          ...occ,
          id: anchor!.id,
          workoutSessionId: anchor!.workoutSessionId,
          ...normalized,
          seriesId: newSeriesId,
        };
      }
      return occ;
    });
  }

  const updatedList = [...preserved, ...regenerated];
  await persistOccurrences(updatedList);
  return updatedList.filter((item) => item.seriesId === newSeriesId);
}

async function applySeriesEditFuture(
  currentList: ScheduledOccurrence[],
  target: ScheduledOccurrence,
  data: Partial<Omit<ScheduledOccurrence, 'id'>>
): Promise<ScheduledOccurrence[]> {
  const seriesId = target.seriesId as string;
  const newSeriesId = `series_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const recurrenceChanged = data.recurrence !== undefined && data.recurrence !== target.recurrence;
  const dateChanged =
    data.scheduledDate !== undefined && data.scheduledDate !== target.scheduledDate;
  const newRecurrence = (data.recurrence ?? target.recurrence) as Recurrence;

  // Past occurrences (before target date) remain in the old series unchanged
  const unchanged = currentList.filter(
    (item) => item.seriesId !== seriesId || item.scheduledDate < target.scheduledDate
  );

  let newFutureOccurrences: ScheduledOccurrence[];

  if (!recurrenceChanged && !dateChanged) {
    const futureOccurrences = currentList.filter(
      (item) => item.seriesId === seriesId && item.scheduledDate >= target.scheduledDate
    );
    newFutureOccurrences = futureOccurrences.map((item) => {
      const normalized = normalizeOccurrenceData(item, data);
      return { ...item, ...normalized, seriesId: newSeriesId };
    });
  } else {
    // Regenerate future occurrences from the target date using the new recurrence
    const baseDate = data.scheduledDate ?? target.scheduledDate;
    const generated = buildOccurrences(
      {
        scheduledDate: baseDate,
        title: data.title ?? target.title ?? 'Activity',
        routineId: data.routineId ?? target.routineId,
        startTime: data.startTime ?? target.startTime,
        endTime: data.endTime ?? target.endTime,
        allDay: data.allDay ?? target.allDay,
        recurrence: newRecurrence,
        notes: data.notes ?? target.notes,
      },
      newRecurrence,
      newSeriesId
    );

    newFutureOccurrences = generated.map((occ, index) => {
      if (index === 0) {
        const normalized = normalizeOccurrenceData(target, data);
        return {
          ...occ,
          id: target.id,
          workoutSessionId: target.workoutSessionId,
          ...normalized,
          seriesId: newSeriesId,
        };
      }
      return occ;
    });
  }

  const updatedList = [...unchanged, ...newFutureOccurrences];
  await persistOccurrences(updatedList);
  return newFutureOccurrences;
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
