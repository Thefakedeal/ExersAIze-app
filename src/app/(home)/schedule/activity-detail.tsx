import { useLocalSearchParams } from 'expo-router';

import { ScheduledActivityDetailScreen } from '@/screens/scheduled-activity-detail-screen';

export default function ScheduledActivityDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ScheduledActivityDetailScreen id={id} />;
}
