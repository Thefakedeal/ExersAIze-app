import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChevronRightIcon, PlusIcon } from '@/components/ui/icons';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface RoutineItem {
  id: string;
  name: string;
  description?: string;
  exerciseCount?: number;
}

const DEFAULT_ROUTINES: RoutineItem[] = [
  {
    id: '1',
    name: 'Full Body Blast',
    description: 'Compound lifts targeting all major muscle groups',
    exerciseCount: 6,
  },
  {
    id: '2',
    name: 'Push Day (Chest, Shoulders, Triceps)',
    description: 'Focus on bench, overhead press, and dips',
    exerciseCount: 5,
  },
  {
    id: '3',
    name: 'Pull Day (Back & Biceps)',
    description: 'Deadlifts, rows, pull-ups, and curls',
    exerciseCount: 5,
  },
  {
    id: '4',
    name: 'Leg Day (Quads & Hamstrings)',
    description: 'Squats, lunges, leg press, and calves',
    exerciseCount: 6,
  },
  {
    id: '5',
    name: 'Upper Body Hypertrophy',
    description: 'High volume muscle building workout',
    exerciseCount: 7,
  },
  {
    id: '6',
    name: 'Core & HIIT Cardio',
    description: 'High intensity interval training with core work',
    exerciseCount: 4,
  },
  {
    id: '7',
    name: 'Morning Mobility & Stretching',
    description: 'Flexibility and active joint recovery',
    exerciseCount: 5,
  },
];

export default function RoutineScreen() {
  const theme = useTheme();

  const safeAreaInsets = useSafeAreaInsets();
    const insets = {
      ...safeAreaInsets,
      bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    };
  
    const contentPlatformStyle = Platform.select({
      android: {
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        // paddingBottom: insets.bottom,
      },
      web: {
        paddingTop: Spacing.six,
        paddingBottom: Spacing.four,
      },
    });

  return (
    <ThemedView style={[styles.container, contentPlatformStyle]}>
      <View style={[styles.safeArea]}>
        <View style={styles.headerRow}>
          <ThemedText type="subtitle">Routines</ThemedText>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              // Action to add routine will be implemented here
            }}
            style={[styles.addRoutineButton, { backgroundColor: theme.primary }]}>
            <PlusIcon size={18} color={theme.textOnPrimary} />
            <ThemedText
              type="smallBold"
              style={{ color: theme.textOnPrimary, marginLeft: 6 }}>
              Add Routine
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {DEFAULT_ROUTINES.map((routine) => (
            <TouchableOpacity
              key={routine.id}
              activeOpacity={0.7}
              onPress={() => {
                // Clicking routine item will navigate to routine details
              }}
              style={styles.routineTouchable}>
              <ThemedView
                type="backgroundElement"
                style={[styles.routineCard, { borderColor: theme.border }]}>
                <View style={styles.routineInfo}>
                  <ThemedText type="default" style={styles.routineName}>
                    {routine.name}
                  </ThemedText>
                  {routine.description ? (
                    <ThemedText
                      type="small"
                      themeColor="textSecondary"
                      style={styles.routineDescription}>
                      {routine.description}
                    </ThemedText>
                  ) : null}
                  {routine.exerciseCount ? (
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.countBadge,
                          { backgroundColor: theme.backgroundSelected },
                        ]}>
                        <ThemedText type="code" themeColor="primary">
                          {`${routine.exerciseCount} exercises`}
                        </ThemedText>
                      </View>
                    </View>
                  ) : null}
                </View>

                <View style={styles.arrowContainer}>
                  <ChevronRightIcon size={20} color={theme.textSecondary} />
                </View>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Spacing.four, 
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  addRoutineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scrollContent: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  routineTouchable: {
    borderRadius: Spacing.three,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  routineInfo: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  routineName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  routineDescription: {
    marginTop: 4,
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: Spacing.two,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: Spacing.one,
  },
});
