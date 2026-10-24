import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export type WorkoutType = 'strength' | 'cardio';

export interface TodaysWorkoutProps {
  type?: WorkoutType;
  name?: string;
  duration?: string; // for cardio
  bodyPart?: string; // for strength
  onPress?: () => void;
}

export function TodaysWorkout({
  type = 'strength',
  name = 'Full Body Strength',
  duration = '30 min',
  bodyPart = 'Full Body',
  onPress,
}: TodaysWorkoutProps) {
  const scheme = useColorScheme();
  const actualColors = scheme === 'dark' ? Colors.dark : Colors.light;
  const theme = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/exercise');
    }
  };

  const getIcon = () => {
    if (type === 'cardio') {
      return (
        <SymbolView
          tintColor={actualColors.primary}
          name={{ ios: 'figure.run', android: 'directions_run', web: 'directions_run' }}
          size={24}
        />
      );
    }
    // strength/weight training
    return (
      <SymbolView
        tintColor={actualColors.primary}
        name={{ ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' }}
        size={24}
      />
    );
  };

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [pressed && styles.pressed]}>
      <ThemedView type="backgroundElement" style={[styles.container, { borderColor: actualColors.border }]}>
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: actualColors.primaryLight }]}>
            {getIcon()}
          </View>
          <View style={styles.infoContainer}>
            <ThemedText type="default" style={styles.workoutName}>
              {name}
            </ThemedText>
            <View style={styles.detailsRow}>
              {type === 'cardio' && duration && (
                <ThemedText type="small" style={{ color: actualColors.textSecondary }}>
                  {duration}
                </ThemedText>
              )}
              {type === 'strength' && bodyPart && (
                <View style={[styles.badge, { backgroundColor: actualColors.primaryLight, borderColor: actualColors.primaryLight }]}>
                  <ThemedText type="smallBold" style={{ color: actualColors.primary, fontSize: 12 }}>
                    {bodyPart}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>
        <SymbolView
          tintColor={actualColors.textSecondary}
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={20}
        />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: Spacing.four,
    borderWidth: 1,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.7,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    gap: Spacing.one,
  },
  workoutName: {
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
    borderWidth: 1,
  },
});
