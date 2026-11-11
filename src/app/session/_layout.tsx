import { Stack } from 'expo-router';

export default function SessionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="exercise-session" />
      <Stack.Screen name="view-session" />
    </Stack>
  );
}
