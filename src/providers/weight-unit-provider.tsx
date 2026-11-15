import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { DEFAULT_WEIGHT_UNIT, type WeightUnit } from '@/utils/weight';

const WEIGHT_UNIT_KEY = '@exersaize:weight_unit_preference_v1';

type WeightUnitContextValue = {
  unit: WeightUnit;
  setUnit: (unit: WeightUnit) => void;
};

const WeightUnitContext = createContext<WeightUnitContextValue | null>(null);

async function getStoredWeightUnit(): Promise<WeightUnit> {
  try {
    const stored = await AsyncStorage.getItem(WEIGHT_UNIT_KEY);
    return stored === 'kg' || stored === 'lbs' ? stored : DEFAULT_WEIGHT_UNIT;
  } catch (error) {
    console.error('Failed to load weight unit preference from storage:', error);
    return DEFAULT_WEIGHT_UNIT;
  }
}

async function storeWeightUnit(unit: WeightUnit): Promise<void> {
  try {
    await AsyncStorage.setItem(WEIGHT_UNIT_KEY, unit);
  } catch (error) {
    console.error('Failed to save weight unit preference to storage:', error);
  }
}

export function WeightUnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<WeightUnit>(DEFAULT_WEIGHT_UNIT);

  useEffect(() => {
    let isActive = true;
    getStoredWeightUnit().then((stored) => {
      if (isActive) {
        setUnitState(stored);
      }
    });
    return () => {
      isActive = false;
    };
  }, []);

  const setUnit = (next: WeightUnit) => {
    setUnitState(next);
    void storeWeightUnit(next);
  };

  return <WeightUnitContext.Provider value={{ unit, setUnit }}>{children}</WeightUnitContext.Provider>;
}

export function useWeightUnit(): WeightUnitContextValue {
  const context = useContext(WeightUnitContext);

  if (!context) {
    throw new Error('useWeightUnit must be used within a WeightUnitProvider');
  }

  return context;
}
