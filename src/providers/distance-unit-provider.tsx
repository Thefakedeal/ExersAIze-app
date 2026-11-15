import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { DEFAULT_DISTANCE_UNIT, type DistanceUnit } from '@/utils/distance';

const DISTANCE_UNIT_KEY = '@exersaize:distance_unit_preference_v1';

type DistanceUnitContextValue = {
  unit: DistanceUnit;
  setUnit: (unit: DistanceUnit) => void;
};

const DistanceUnitContext = createContext<DistanceUnitContextValue | null>(null);

async function getStoredDistanceUnit(): Promise<DistanceUnit> {
  try {
    const stored = await AsyncStorage.getItem(DISTANCE_UNIT_KEY);
    return stored === 'km' || stored === 'mi' ? stored : DEFAULT_DISTANCE_UNIT;
  } catch (error) {
    console.error('Failed to load distance unit preference from storage:', error);
    return DEFAULT_DISTANCE_UNIT;
  }
}

async function storeDistanceUnit(unit: DistanceUnit): Promise<void> {
  try {
    await AsyncStorage.setItem(DISTANCE_UNIT_KEY, unit);
  } catch (error) {
    console.error('Failed to save distance unit preference to storage:', error);
  }
}

export function DistanceUnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<DistanceUnit>(DEFAULT_DISTANCE_UNIT);

  useEffect(() => {
    let isActive = true;
    getStoredDistanceUnit().then((stored) => {
      if (isActive) {
        setUnitState(stored);
      }
    });
    return () => {
      isActive = false;
    };
  }, []);

  const setUnit = (next: DistanceUnit) => {
    setUnitState(next);
    void storeDistanceUnit(next);
  };

  return <DistanceUnitContext.Provider value={{ unit, setUnit }}>{children}</DistanceUnitContext.Provider>;
}

export function useDistanceUnit(): DistanceUnitContextValue {
  const context = useContext(DistanceUnitContext);

  if (!context) {
    throw new Error('useDistanceUnit must be used within a DistanceUnitProvider');
  }

  return context;
}
