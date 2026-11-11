import { useLocalSearchParams } from 'expo-router';

import { ExerciseSessionScreen } from '@/screens/exercise-session-screen';

export default function ExerciseSessionPage() {
  const { routineId, sessionId } = useLocalSearchParams<{
    routineId?: string;
    sessionId?: string;
  }>();

  return <ExerciseSessionScreen routineId={routineId} sessionId={sessionId} />;
}
