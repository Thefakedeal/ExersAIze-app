import { format } from 'date-fns';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChevronRightIcon } from '@/components/ui/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ScheduledOccurrence } from '@/types/schedule';
import { WorkoutSession } from '@/types/session';
import { DisplayActivityStatus, getScheduledActivityStatus } from '@/utils/schedule-status';

interface ActivityCardProps {
  occurrence: ScheduledOccurrence;
  sessions: WorkoutSession[];
  onPress: () => void;
}

export function ActivityCard({ occurrence, sessions, onPress }: ActivityCardProps) {
  const theme = useTheme();

  const statusConfig: Record<DisplayActivityStatus, { backgroundColor: string; color: string; label: string }> = {
    scheduled: { backgroundColor: theme.backgroundSelected, color: theme.textSecondary, label: 'Scheduled' },
    completed: { backgroundColor: theme.backgroundSelected, color: theme.primary, label: 'Completed' },
    skipped: { backgroundColor: theme.errorLight, color: theme.error, label: 'Skipped' },
  };

  const dynamicStatus = getScheduledActivityStatus(occurrence.scheduledDate, {
    workoutSessionId: occurrence.workoutSessionId,
    sessions,
  });
  const status = statusConfig[dynamicStatus];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${occurrence.title ?? 'Activity'}, ${status.label}`}>
      <ThemedView
        type="backgroundElement"
        style={[styles.activityCard, { borderColor: theme.border }]}>
        <View style={styles.activityCardMain}>
          <View style={styles.activityInfo}>
            <ThemedText type="smallBold">
              {occurrence.title ?? 'Activity'}
            </ThemedText>
            {occurrence.startTime && (
              <ThemedText type="small" themeColor="textSecondary">
                {format(
                  new Date(`${occurrence.scheduledDate}T${occurrence.startTime}`),
                  'h:mm a'
                )}
              </ThemedText>
            )}
          </View>
          <View style={styles.activityMeta}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: status.backgroundColor },
              ]}>
              <ThemedText type="code" style={{ color: status.color }}>
                {status.label}
              </ThemedText>
            </View>
            <ChevronRightIcon size={18} color={theme.textSecondary} />
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  activityCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
    gap: 2,
  },
  activityCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  activityInfo: {
    flex: 1,
    gap: 2,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
