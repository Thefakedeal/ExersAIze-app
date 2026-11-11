import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RoutineExercise } from '@/types/routine';

export type RoutineExerciseViewCardProps = {
  item: RoutineExercise;
  index: number;
};

export function RoutineExerciseViewCard({ item, index }: RoutineExerciseViewCardProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.exerciseCard, { borderColor: theme.border }]}>
      {/* Header: Index Badge, Exercise Name & Categories */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderLeft}>
          <View
            style={[
              styles.indexBadge,
              { backgroundColor: theme.backgroundSelected },
            ]}>
            <ThemedText type="smallBold" themeColor="primary">
              {index + 1}
            </ThemedText>
          </View>
          <View style={styles.exerciseTitleCol}>
            <ThemedText type="smallBold" style={styles.exerciseNameText}>
              {item.name}
            </ThemedText>
            {item.type && (
              <ThemedText type="code" themeColor="textSecondary">
                {item.type}
                {item.categories && item.categories.length > 0
                  ? ` • ${item.categories[0]}`
                  : ''}
              </ThemedText>
            )}
          </View>
        </View>
      </View>

      {/* Middle Row: Read-only Sets and Rep Range */}
      <View
        style={[
          styles.metricsContainer,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}>
        <View style={styles.metricBadge}>
          <ThemedText type="code" themeColor="textSecondary">
            Sets
          </ThemedText>
          <ThemedText type="smallBold" style={styles.metricValue}>
            {item.sets}
          </ThemedText>
        </View>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <View style={styles.metricBadge}>
          <ThemedText type="code" themeColor="textSecondary">
            Rep Range
          </ThemedText>
          <ThemedText type="smallBold" style={styles.metricValue}>
            {item.repRange} reps
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.two,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseTitleCol: {
    flex: 1,
    gap: 2,
  },
  exerciseNameText: {
    fontSize: 15,
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    borderRadius: 10,
    borderWidth: 1,
    gap: Spacing.three,
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  metricValue: {
    fontSize: 14,
  },
  separator: {
    width: 1,
    height: 16,
  },
});
