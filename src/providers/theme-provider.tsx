import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Appearance, Platform } from 'react-native';

const THEME_PREFERENCE_KEY = '@exersaize:theme_preference_v1';

export type ThemePreference = 'light' | 'dark' | null;

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

async function getStoredThemePreference(): Promise<ThemePreference> {
  try {
    const stored = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch (error) {
    console.error('Failed to load theme preference from storage:', error);
    return null;
  }
}

async function storeThemePreference(preference: ThemePreference): Promise<void> {
  try {
    if (preference === null) {
      await AsyncStorage.removeItem(THEME_PREFERENCE_KEY);
      return;
    }
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
  } catch (error) {
    console.error('Failed to save theme preference to storage:', error);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(null);

  // Restore saved preference on launch. No save-on-change effect: only the
  // setter persists, so the default cannot overwrite stored state before hydration.
  useEffect(() => {
    let isActive = true;
    getStoredThemePreference().then((stored) => {
      if (isActive) {
        setPreferenceState(stored);
      }
    });
    return () => {
      isActive = false;
    };
  }, []);

  // Keep native appearance (keyboard, alerts, native controls) in sync with the
  // selected preference. 'auto' restores system tracking.
  useEffect(() => {
    if (Platform.OS !== 'web') {
      Appearance.setColorScheme(preference ?? 'auto');
    }
  }, [preference]);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    void storeThemePreference(next);
  };

  return (
    <ThemePreferenceContext.Provider value={{ preference, setPreference }}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference(): ThemePreferenceContextValue {
  const context = useContext(ThemePreferenceContext);

  if (!context) {
    throw new Error('useThemePreference must be used within a ThemeProvider');
  }

  return context;
}
