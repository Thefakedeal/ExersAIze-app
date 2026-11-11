import { useLocalSearchParams } from 'expo-router';

import { ViewSessionScreen } from '@/screens/view-session-screen';

export default function ViewSessionPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ViewSessionScreen id={id} />;
}
