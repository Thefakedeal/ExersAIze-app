import { DEFAULT_ROUTINES } from "@/data/routine";
import { RoutineItem } from "@/types/routine";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isBefore } from "date-fns";

const STORAGE_KEY = "@exersaize:default_routines_v1";

type RoutineStorage = {
  isInitialized: boolean;
  lastSyncedAt: number | null;
  data: RoutineItem[];
}


type StorageListener = () => void;
const listeners = new Set<StorageListener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error notifying storage listener:', e);
    }
  });
}

async function loadDefaultRoutines() {
  return await Promise.resolve({
    latestUpdatedAt: Date.now(),
    data: DEFAULT_ROUTINES
  });
}

export function subscribeToDefaultRoutineUpdates(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function getDefaultRoutines(): Promise<RoutineStorage> {
  try {
    const rawData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return { isInitialized: false, lastSyncedAt: null, data: [] };
    }
    const parsed = JSON.parse(rawData);
    return parsed;
  } catch (error) {
    console.error('Failed to load default routines from storage:', error);
    return { isInitialized: false, lastSyncedAt: null, data: [] };
  }
}

export async function syncDefaultRoutines(): Promise<void> {
  try {
    const newRoutinesUpdate = await loadDefaultRoutines();
    
    // add new routines to storage but don't overwrite existing ones with same id
    const defaultRoutinesUpdate = await getDefaultRoutines();

    if(!defaultRoutinesUpdate.isInitialized) {
      defaultRoutinesUpdate.lastSyncedAt = null;
      defaultRoutinesUpdate.isInitialized = true;
      defaultRoutinesUpdate.data = DEFAULT_ROUTINES;
    }

    if(defaultRoutinesUpdate.lastSyncedAt && isBefore(newRoutinesUpdate.latestUpdatedAt, defaultRoutinesUpdate.lastSyncedAt)) {
      return;
    }

    const defaultRoutines = defaultRoutinesUpdate.data;
    const newRoutines = newRoutinesUpdate.data;
    // remove existing routines with same id
    const newRoutineIds = new Set(newRoutines.map((r) => r.id));
    const updatedRoutines = defaultRoutines.filter((r) => !newRoutineIds.has(r.id));
    updatedRoutines.push(...newRoutines);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ isInitialized: true, lastSyncedAt: Date.now(), data: updatedRoutines }));
    notifyListeners();
  } catch (error) {
    console.error('Failed to sync default routines to storage:', error);
  }
}