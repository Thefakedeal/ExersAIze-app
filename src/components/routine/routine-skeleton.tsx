import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/header';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type RoutineSkeletonProps = {
  title: string;
};

export function RoutineSkeleton({ title }: RoutineSkeletonProps) {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <Header title={title} onBackPress={router.back} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          {/* Name field */}
          <View style={styles.fieldSection}>
            <View style={[styles.labelSkeleton, { backgroundColor: theme.backgroundSecondary }]} />
            <View
              style={[
                styles.inputSkeleton,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}
            />
          </View>

          {/* Description field */}
          <View style={styles.fieldSection}>
            <View style={[styles.labelSkeleton, { backgroundColor: theme.backgroundSecondary }]} />
            <View
              style={[
                styles.descriptionSkeleton,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}
            />
          </View>

          {/* Exercises section */}
          <View style={styles.fieldSection}>
            <View style={styles.sectionHeaderRow}>
              <View
                style={[
                  styles.sectionTitleSkeleton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              />
              <View
                style={[
                  styles.addButtonSkeleton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              />
            </View>

            <View style={styles.exerciseList}>
              <ExerciseCardSkeleton />
              <ExerciseCardSkeleton />
              <ExerciseCardSkeleton />
            </View>
          </View>

          {/* Action buttons */}
          <View style={[styles.buttonSkeleton, { backgroundColor: theme.backgroundSecondary }]} />
          <View style={[styles.buttonSkeleton, { backgroundColor: theme.backgroundSecondary }]} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function ExerciseCardSkeleton() {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.exerciseCard, { borderColor: theme.border }]}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderLeft}>
          <View
            style={[
              styles.indexBadgeSkeleton,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          />
          <View style={styles.titleCol}>
            <View
              style={[
                styles.textLineSkeleton,
                { backgroundColor: theme.backgroundSecondary, width: '60%' },
              ]}
            />
            <View
              style={[
                styles.textLineSkeleton,
                { backgroundColor: theme.backgroundSecondary, width: '40%' },
              ]}
            />
          </View>
        </View>
        <View
          style={[
            styles.reorderSkeleton,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        />
      </View>

      <View
        style={[
          styles.inputsRowSkeleton,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}>
        <View
          style={[
            styles.inputBoxSkeleton,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        />
        <View
          style={[
            styles.inputBoxSkeleton,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        />
      </View>

      <View style={styles.cardActionsRow}>
        <View
          style={[
            styles.actionButtonSkeleton,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        />
        <View
          style={[
            styles.actionButtonSkeleton,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        />
      </View>
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
  labelSkeleton: {
    width: 110,
    height: 14,
    borderRadius: 6,
  },
  inputSkeleton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
  },
  descriptionSkeleton: {
    height: 90,
    borderWidth: 1,
    borderRadius: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleSkeleton: {
    width: 80,
    height: 16,
    borderRadius: 6,
  },
  addButtonSkeleton: {
    width: 110,
    height: 32,
    borderRadius: 8,
  },
  exerciseList: {
    gap: Spacing.three,
  },
  exerciseCard: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
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
  indexBadgeSkeleton: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  titleCol: {
    flex: 1,
    gap: 6,
  },
  textLineSkeleton: {
    height: 12,
    borderRadius: 6,
  },
  reorderSkeleton: {
    width: 66,
    height: 30,
    borderRadius: 8,
  },
  inputsRowSkeleton: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: 10,
    borderWidth: 1,
  },
  inputBoxSkeleton: {
    flex: 1,
    height: 40,
    borderRadius: 6,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  actionButtonSkeleton: {
    width: 90,
    height: 28,
    borderRadius: 8,
  },
  buttonSkeleton: {
    height: 48,
    borderRadius: 12,
  },
});
