import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
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
  const reduceMotion = useReducedMotion();

  const pulseStyle = useAnimatedStyle(
    () => ({
      opacity: reduceMotion
        ? 1
        : withRepeat(withTiming(0.45, { duration: 800 }), -1, true),
    }),
    [reduceMotion]
  );

  return (
    <ThemedView style={styles.container}>
      <Header title={title} onBackPress={router.back} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        <Animated.View style={[styles.innerContainer, pulseStyle]}>
          {/* Name field */}
          <View style={styles.fieldSection}>
            <Bone style={styles.label} />
            <ThemedView
              type="backgroundElement"
              style={[styles.nameInput, { borderColor: theme.border }]}
            />
          </View>

          {/* Description field */}
          <View style={styles.fieldSection}>
            <Bone style={styles.label} />
            <ThemedView
              type="backgroundElement"
              style={[styles.descriptionInput, { borderColor: theme.border }]}
            />
          </View>

          {/* Exercises section */}
          <View style={styles.fieldSection}>
            <View style={styles.sectionHeaderRow}>
              <Bone style={styles.sectionTitle} />
              <Bone style={styles.addButton} />
            </View>

            <View style={styles.exerciseList}>
              <ExerciseCardSkeleton />
              <ExerciseCardSkeleton />
              <ExerciseCardSkeleton />
            </View>
          </View>

          {/* Action buttons */}
          <Bone style={styles.button} />
          <Bone style={styles.button} />
        </Animated.View>
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
          <Bone style={styles.indexBadge} />
          <View style={styles.titleCol}>
            <Bone style={[styles.textLine, { width: '60%' }]} />
            <Bone style={[styles.textLine, { width: '40%' }]} />
          </View>
        </View>
        <Bone style={styles.reorder} />
      </View>

      <View
        style={[
          styles.inputsRow,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}>
        <Bone style={styles.inputBox} />
        <Bone style={styles.inputBox} />
      </View>

      <View style={styles.cardActionsRow}>
        <Bone style={styles.actionButton} />
        <Bone style={styles.actionButton} />
      </View>
    </ThemedView>
  );
}

function Bone({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();

  return (
    <View
      style={[styles.bone, { backgroundColor: theme.backgroundSecondary }, style]}
    />
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
  bone: {
    borderRadius: 6,
  },
  label: {
    width: 110,
    height: 14,
  },
  nameInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
  },
  descriptionInput: {
    height: 90,
    borderWidth: 1,
    borderRadius: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    width: 80,
    height: 16,
  },
  addButton: {
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
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  titleCol: {
    flex: 1,
    gap: 6,
  },
  textLine: {
    height: 12,
  },
  reorder: {
    width: 66,
    height: 30,
    borderRadius: 8,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: 10,
    borderWidth: 1,
  },
  inputBox: {
    flex: 1,
    height: 40,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  actionButton: {
    width: 90,
    height: 28,
    borderRadius: 8,
  },
  button: {
    height: 48,
    borderRadius: 12,
  },
});
