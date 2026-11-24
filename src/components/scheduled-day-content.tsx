import { isFuture, isSameDay } from 'date-fns';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActivityCard } from '@/components/schedule/activity-card';
import { SessionCard } from '@/components/session/session-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useScheduledOccurrences } from '@/hooks/use-scheduled-occurrences';
import { useWorkoutSessions } from '@/hooks/use-workout-sessions';

interface ScheduledDayContentProps {
  selectedDate: Date;
}

/**
 * Renders the selected day's scheduled items using the same behavior as the
 * Schedule screen: scheduled activities are listed first, followed by logged
 * workout sessions. Tapping an activity opens its detail screen, where the
 * existing start flow lives. Tapping a session opens the session view.
 */
export function ScheduledDayContent({ selectedDate }: ScheduledDayContentProps) {
  const router = useRouter();
  const { sessions } = useWorkoutSessions();
  const { occurrences: dayOccurrences } = useScheduledOccurrences({
    startDate: selectedDate,
    endDate: selectedDate,
  });

  const daySessions = useMemo(() => {
    return sessions.filter((session) => isSameDay(new Date(session.startTime), selectedDate));
  }, [sessions, selectedDate]);

  const handleActivityPress = (id: string) => {
    router.push(`/schedule/activity-detail?id=${id}`);
  };

  const handleSessionPress = (id: string) => {
    router.push(`/session/view-session?id=${id}`);
  };

  const showWorkouts = !isFuture(selectedDate) && daySessions.length > 0;
  const showActivities = dayOccurrences.length > 0;

  if (!showWorkouts && !showActivities) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showActivities && (
        <View style={styles.section}>
          <ThemedText type="smallBold">Scheduled Activities</ThemedText>
          <View style={styles.activityList}>
            {dayOccurrences.map((occurrence) => (
              <ActivityCard
                key={occurrence.id}
                occurrence={occurrence}
                sessions={sessions}
                onPress={() => handleActivityPress(occurrence.id)}
              />
            ))}
          </View>
        </View>
      )}

      {showWorkouts && (
        <View style={styles.section}>
          <ThemedText type="smallBold">Workouts</ThemedText>
          <View style={styles.sessionList}>
            {daySessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onPress={() => handleSessionPress(session.id)}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  activityList: {
    gap: Spacing.two,
  },
  sessionList: {
    gap: Spacing.three,
  },
});
