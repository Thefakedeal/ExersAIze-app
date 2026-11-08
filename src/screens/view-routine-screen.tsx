import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/header';
import { RoutineExerciseViewCard } from '@/components/routine/routine-exercise-view-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RoutineItem } from '@/types/routine';

type Props = {
  routine: RoutineItem;
};

export function ViewRoutineScreen({ routine }: Props) {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const exercises = routine.exercises ?? [];

  return (
    <ThemedView style={styles.container}>
      <Header onBackPress={router.back} title="View Routine" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          {/* 1. Name */}
          <View style={styles.fieldSection}>
            <ThemedText type="smallBold">Routine Name</ThemedText>
            <ThemedView
              type="backgroundElement"
              style={[styles.readOnlyCard, { borderColor: theme.border }]}>
              <ThemedText type="default" style={styles.routineNameText}>
                {routine.name}
              </ThemedText>
              <View
                style={[
                  styles.libraryBadge,
                  { backgroundColor: theme.backgroundSelected },
                ]}>
                <ThemedText type="code" themeColor="primary">
                  Library
                </ThemedText>
              </View>
            </ThemedView>
          </View>

          {/* 2. Description (if available) */}
          {routine.description ? (
            <View style={styles.fieldSection}>
              <ThemedText type="smallBold">Description</ThemedText>
              <ThemedView
                type="backgroundElement"
                style={[styles.readOnlyCard, { borderColor: theme.border }]}>
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={styles.descriptionText}>
                  {routine.description}
                </ThemedText>
              </ThemedView>
            </View>
          ) : null}

          {/* 3. Exercises List */}
          <View style={styles.fieldSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleCol}>
                <ThemedText type="smallBold">Exercises</ThemedText>
                <ThemedText type="code" themeColor="textSecondary">
                  {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
                </ThemedText>
              </View>
            </View>

            {exercises.length === 0 ? (
              <ThemedView
                type="backgroundElement"
                style={[styles.emptyCard, { borderColor: theme.border }]}>
                <ThemedText type="small" themeColor="textSecondary">
                  No exercises listed for this routine.
                </ThemedText>
              </ThemedView>
            ) : (
              <View style={styles.exerciseList}>
                {exercises.map((item, index) => (
                  <RoutineExerciseViewCard
                    key={item.id || `${item.exerciseId}-${index}`}
                    item={item}
                    index={index}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.three,
  },
  innerContainer: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  fieldSection: {
    gap: Spacing.two,
  },
  readOnlyCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routineNameText: {
    fontWeight: '600',
    flex: 1,
    paddingRight: Spacing.two,
  },
  libraryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  descriptionText: {
    lineHeight: 20,
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleCol: {
    gap: 2,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseList: {
    gap: Spacing.three,
  },
});
