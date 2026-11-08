import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useRoutines } from '@/hooks/use-routines';
import { ViewRoutineScreen } from '@/screens/view-routine-screen';

export default function ViewRoutinePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { defaultRoutines, customRoutines, loading } = useRoutines();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const routine =
    defaultRoutines.find((r) => r.id === id) ??
    customRoutines.find((r) => r.id === id);

  if (!routine) {
    return null;
  }

  return <ViewRoutineScreen routine={routine} />;
}
