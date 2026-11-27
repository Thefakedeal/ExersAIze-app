import { useLocalSearchParams } from 'expo-router';

import { ExerciseSessionScreen } from '@/screens/exercise-session-screen';

export default function ExerciseSessionPage() {
  const { routineId, sessionId, scheduledOccurrenceId } = useLocalSearchParams<{
    routineId?: string;
    sessionId?: string;
    scheduledOccurrenceId?: string;
  }>();

  return (
    <ExerciseSessionScreen
      routineId={routineId}
      sessionId={sessionId}
      scheduledOccurrenceId={scheduledOccurrenceId}
    />
  );
}
