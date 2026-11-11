import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function StartWorkoutCard() {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => router.push('/session/exercise-session')}
      style={({ pressed }) => [pressed && styles.pressed]}>
      <ThemedView
        type="backgroundElement"
        style={[styles.container, { borderColor: theme.border }]}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
            <SymbolView
              tintColor={theme.primary}
              name={{
                ios: 'dumbbell.fill',
                android: 'fitness_center',
                web: 'fitness_center',
              }}
              size={24}
            />
          </View>

          <View style={styles.info}>
            <ThemedText type="default" style={styles.title}>
              Start Workout
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Log your exercises, sets and reps.
            </ThemedText>
          </View>

          <View style={[styles.action, { backgroundColor: theme.primary }]}>
            <ThemedText type="smallBold" style={{ color: theme.textOnPrimary }}>
              Start
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  container: {
    borderRadius: Spacing.four,
    borderWidth: 1,
    padding: Spacing.three,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontWeight: '600',
  },
  action: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
  },
});
