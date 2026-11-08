import { Stack } from 'expo-router';

export default function RoutineLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-routine" />
      <Stack.Screen name="edit-routine" />
    </Stack>
  );
}
