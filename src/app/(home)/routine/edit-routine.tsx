import { useLocalSearchParams } from 'expo-router';

import { RoutineSkeleton } from '@/components/routine/routine-skeleton';
import { useRoutines } from '@/hooks/use-routines';
import { EditRoutineScreen } from '@/screens/edit-routine-screen';

export default function EditRoutinePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { customRoutines, loading } = useRoutines();

  if (loading) {
    return <RoutineSkeleton title="Edit Routine" />;
  }

  const routine = customRoutines.find((r) => r.id === id);

  if (!routine) {
    return null;
  }

  return <EditRoutineScreen routine={routine} />;
}
