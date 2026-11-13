import { Href, router } from 'expo-router';
import type { ComponentType } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { QuoteCard } from '@/components/quote-card';
import { SafeArea } from '@/components/safe-area';
import { StartWorkoutCard } from '@/components/start-workout-card';
import { StepTracker } from '@/components/step-tracker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TodaysWorkout } from '@/components/todays-workout';
import { DumbbellIcon, IconProps, ListCheckIcon } from '@/components/ui/icons';
import { WebBadge } from '@/components/web-badge';
import { WeeklyWorkoutCalendar } from '@/components/weekly-workout-calendar';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const NAV_TILES: { label: string; href: Href; icon: ComponentType<IconProps> }[] = [
  { label: 'Routines', href: '/routine', icon: ListCheckIcon },
  { label: 'Exercises', href: '/exercise', icon: DumbbellIcon },
];

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeArea>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="title" style={styles.welcomeTitle}>
            Welcome
          </ThemedText>
          <StepTracker />

          <StartWorkoutCard />

          <View style={styles.navRow}>
            {NAV_TILES.map((tile) => (
              <NavTile key={tile.label} {...tile} />
            ))}
          </View>

          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="subtitle">{"Today's Workout"}</ThemedText>
          </ThemedView>

          <TodaysWorkout type="strength" name="Full Body Strength" bodyPart="Full Body" />
          <TodaysWorkout type="cardio" name="Morning Run" duration="30 min" />

          <WeeklyWorkoutCalendar
            weekDays={[
              { day: 'Mon', status: 'worked', date: 2 },
              { day: 'Tue', status: 'worked', date: 3 },
              { day: 'Wed', status: 'missed', date: 4 },
              { day: 'Thu', status: 'worked', date: 5 },
              { day: 'Fri', status: 'rest', date: 6 },
              { day: 'Sat', status: 'upcoming', date: 7 },
              { day: 'Sun', status: 'rest', date: 8 },
            ]}
          />

          <QuoteCard />

          {Platform.OS === 'web' && <WebBadge />}
        </ScrollView>
      </SafeArea>
    </ThemedView>
  );
}

function NavTile({
  label,
  href,
  icon: Icon,
}: {
  label: string;
  href: Href;
  icon: ComponentType<IconProps>;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => router.push(href)}
      style={({ pressed }) => [
        styles.navTile,
        { borderColor: theme.border, backgroundColor: theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.navIconContainer, { backgroundColor: theme.primaryLight }]}>
        <Icon size={24} color={theme.primary} />
      </View>
      <ThemedText type="default" style={styles.navTileLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  welcomeTitle: {
    textAlign: 'left',
  },
  sectionHeader: {
    marginTop: Spacing.two,
  },
  navRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  navTile: {
    flex: 1,
    padding: Spacing.two,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  navIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTileLabel: {
    fontWeight: '600',
  },
});
