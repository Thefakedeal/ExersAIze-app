import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { syncDefaultExercises } from '@/services/default-exercises';
import { syncDefaultRoutines } from '@/services/default-routines';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // sync default routines and exercises with storage
  const syncDefaults = async () => {
    await syncDefaultRoutines();
    await syncDefaultExercises();
  }

  useEffect(() => {
    syncDefaults();
    SplashScreen.hideAsync();
  },[]);
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="session" />
      </Stack>
    </ThemeProvider>
  );
}
