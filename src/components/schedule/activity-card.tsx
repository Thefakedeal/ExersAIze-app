import { format } from 'date-fns';
import { Alert, TouchableOpacity, View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChevronRightIcon, MoreHorizontalIcon } from '@/components/ui/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DeleteScope } from '@/services/schedule-storage';
import { ScheduledOccurrence } from '@/types/schedule';
import { WorkoutSession } from '@/types/session';
import { DisplayActivityStatus, getScheduledActivityStatus } from '@/utils/schedule-status';

interface ActivityCardProps {
  occurrence: ScheduledOccurrence;
  sessions: WorkoutSession[];
  onPress: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string, scope: DeleteScope) => void;
}

export function ActivityCard({ occurrence, sessions, onPress, onEdit, onDelete }: ActivityCardProps) {
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

  const isRecurring = occurrence.recurrence !== 'none' && occurrence.seriesId;
  const showMenu = onEdit || onDelete;

  const handleDeleteConfirm = (scope: DeleteScope) => {
    Alert.alert(
      'Delete Activity',
      `Are you sure you want to delete "${occurrence.title ?? 'this activity'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(occurrence.id, scope),
        },
      ]
    );
  };

  const handleDelete = () => {
    if (!isRecurring) {
      handleDeleteConfirm('this');
      return;
    }

    Alert.alert(
      'Delete Recurring Activity',
      'This is a recurring activity. What would you like to delete?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Only this occurrence',
          style: 'destructive',
          onPress: () => handleDeleteConfirm('this'),
        },
        {
          text: 'This and future occurrences',
          style: 'destructive',
          onPress: () => handleDeleteConfirm('future'),
        },
        {
          text: 'Entire series',
          style: 'destructive',
          onPress: () => handleDeleteConfirm('all'),
        },
      ]
    );
  };

  const handleMenuPress = () => {
    Alert.alert(
      occurrence.title ?? 'Activity',
      undefined,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Edit',
          onPress: () => onEdit?.(occurrence.id),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDelete,
        },
      ]
    );
  };

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.activityCard, { borderColor: theme.border }]}>
      <View style={styles.activityCardMain}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${occurrence.title ?? 'Activity'}, ${status.label}`}
          style={styles.activityContent}>
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
        </TouchableOpacity>

        {showMenu && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleMenuPress}
            accessibilityRole="button"
            accessibilityLabel="Activity options"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.menuButton}>
            <MoreHorizontalIcon size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  activityCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
  },
  activityCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  activityContent: {
    flex: 1,
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
  menuButton: {
    padding: Spacing.one,
    margin: -Spacing.one,
  },
});
