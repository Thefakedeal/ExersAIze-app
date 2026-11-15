import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { RoutineSkeleton } from '@/components/routine/routine-skeleton';
import { getCustomRoutineById } from '@/services/routine-storage';
import { RoutineItem } from '@/types/routine';
import { EditRoutineScreen } from '@/screens/edit-routine-screen';

export default function EditRoutinePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [routine, setRoutine] = useState<RoutineItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const item = await getCustomRoutineById(id);
        if (!isMounted) return;
        setRoutine(item);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <RoutineSkeleton title="Edit Routine" />;
  }

  if (!routine) {
    return null;
  }

  return <EditRoutineScreen routine={routine} />;
}
