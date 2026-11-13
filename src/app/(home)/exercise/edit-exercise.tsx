import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { EditExerciseScreen } from '@/screens/edit-exercise-screen';
import { useExercises } from '@/hooks/use-exercises';

export default function EditExercisePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { customExercises, loading } = useExercises();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const exercise = customExercises.find((ex) => ex.id === id);

  if (!exercise) {
    // Shouldn't happen, but guard against stale navigation
    return null;
  }

  return <EditExerciseScreen exercise={exercise} />;
}
