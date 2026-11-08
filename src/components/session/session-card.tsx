import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { format } from 'date-fns';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChevronRightIcon, ClockIcon } from '@/components/ui/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { WorkoutSession } from '@/types/session';

interface SessionCardProps {
  session: WorkoutSession;
  onPress: () => void;
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  const theme = useTheme();

  const totalExercises = session.exercises?.length ?? 0;
  const totalSets =
    session.exercises?.reduce((acc, ex) => acc + (ex.sets?.length ?? 0), 0) ?? 0;
  const completedSets =
    session.exercises?.reduce(
      (acc, ex) => acc + (ex.sets?.filter((s) => s.completed).length ?? 0),
      0
    ) ?? 0;

  // Duration calculation
  let durationText = '';
  if (session.startTime) {
    if (session.endTime) {
      const diffMinutes = Math.max(
        1,
        Math.round((session.endTime - session.startTime) / 60000)
      );
      if (diffMinutes < 60) {
        durationText = `${diffMinutes} min`;
      } else {
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        durationText = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
      }
    } else {
      durationText = 'In Progress';
    }
  }

  const dateFormatted = session.startTime
    ? format(new Date(session.startTime), 'EEE, MMM d, yyyy')
    : format(new Date(session.createdAt), 'EEE, MMM d, yyyy');

  const timeFormatted = session.startTime
    ? format(new Date(session.startTime), 'h:mm a')
    : '';

  const exerciseNamesPreview =
    session.exercises?.map((e) => e.name).slice(0, 3).join(', ') ?? '';
  const remainingCount = totalExercises > 3 ? totalExercises - 3 : 0;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.touchable}>
      <ThemedView
        type="backgroundElement"
        style={[styles.card, { borderColor: theme.border }]}>
        {/* Top: Date & Duration badge */}
        <View style={styles.topRow}>
          <ThemedText type="code" themeColor="textSecondary">
            {dateFormatted} {timeFormatted ? `• ${timeFormatted}` : ''}
          </ThemedText>

          {durationText ? (
            <View
              style={[
                styles.durationBadge,
                {
                  backgroundColor: session.endTime
                    ? theme.backgroundSecondary
                    : theme.primaryLight,
                },
              ]}>
              <ClockIcon
                size={12}
                color={session.endTime ? theme.textSecondary : theme.primary}
              />
              <ThemedText
                type="code"
                themeColor={session.endTime ? 'textSecondary' : 'primary'}
                style={styles.durationBadgeText}>
                {durationText}
              </ThemedText>
            </View>
          ) : null}
        </View>

        {/* Title */}
        <ThemedText type="default" style={styles.titleText}>
          {session.title}
        </ThemedText>

        {/* Optional Description */}
        {session.description ? (
          <ThemedText
            type="small"
            themeColor="textSecondary"
            numberOfLines={2}
            style={styles.descriptionText}>
            {session.description}
          </ThemedText>
        ) : null}

        {/* Exercises Preview */}
        {exerciseNamesPreview ? (
          <ThemedText
            type="small"
            themeColor="textSecondary"
            numberOfLines={1}
            style={styles.previewText}>
            {exerciseNamesPreview}
            {remainingCount > 0 ? ` +${remainingCount} more` : ''}
          </ThemedText>
        ) : null}

        {/* Bottom Badges Row */}
        <View style={styles.bottomRow}>
          <View style={styles.badgesGroup}>
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.backgroundSecondary },
              ]}>
              <ThemedText type="code" themeColor="primary">
                {`${totalExercises} ${totalExercises === 1 ? 'exercise' : 'exercises'}`}
              </ThemedText>
            </View>

            <View
              style={[
                styles.badge,
                { backgroundColor: theme.backgroundSecondary },
              ]}>
              <ThemedText type="code" themeColor="textSecondary">
                {`${totalSets} ${totalSets === 1 ? 'set' : 'sets'}`}
                {completedSets > 0 && ` (${completedSets} done)`}
              </ThemedText>
            </View>
          </View>

          <ChevronRightIcon size={18} color={theme.textSecondary} />
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  durationBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  titleText: {
    fontWeight: '700',
    fontSize: 16,
  },
  descriptionText: {
    lineHeight: 18,
  },
  previewText: {
    fontSize: 13,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  badgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
