import { Stack } from 'expo-router';

export default function ExerciseLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-exercise" />
      <Stack.Screen name="view-exercise" />
    </Stack>
  );
}
