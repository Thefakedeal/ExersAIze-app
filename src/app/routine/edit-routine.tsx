import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useRoutines } from '@/hooks/use-routines';
import { EditRoutineScreen } from '@/screens/edit-routine-screen';

export default function EditRoutinePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { customRoutines, loading } = useRoutines();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const routine = customRoutines.find((r) => r.id === id);

  if (!routine) {
    return null;
  }

  return <EditRoutineScreen routine={routine} />;
}
