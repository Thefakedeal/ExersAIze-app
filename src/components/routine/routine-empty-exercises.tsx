import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PlusIcon } from '@/components/ui/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type RoutineEmptyExercisesProps = {
  onAddExercise: () => void;
};

export function RoutineEmptyExercises({ onAddExercise }: RoutineEmptyExercisesProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.emptyCard, { borderColor: theme.border }]}>
      <ThemedText type="default" style={styles.emptyTitle}>
        No exercises added
      </ThemedText>
      <ThemedText
        type="small"
        themeColor="textSecondary"
        style={styles.emptySubtitle}>
        Add exercises to configure target sets and rep ranges for this routine.
      </ThemedText>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onAddExercise}
        style={[
          styles.emptyAddBtn,
          {
            backgroundColor: theme.backgroundSelected,
            borderColor: theme.primary,
          },
        ]}>
        <PlusIcon size={16} color={theme.primary} />
        <ThemedText
          type="smallBold"
          style={{ color: theme.primary, marginLeft: 6 }}>
          Select Exercise
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  emptySubtitle: {
    textAlign: 'center',
    maxWidth: 280,
    fontSize: 13,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: Spacing.one,
  },
});
