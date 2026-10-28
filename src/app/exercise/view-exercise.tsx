import { useLocalSearchParams } from 'expo-router';

import { AddExerciseScreen } from '@/screens/add-exercise-screen';
import { useExercises } from '@/hooks/use-exercises';
import { View, ActivityIndicator } from 'react-native';

export default function ViewExercisePage() {
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
  return <AddExerciseScreen exercise={exercise} />;
}
