import { Href, useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { QuoteCard } from '@/components/quote-card';
import { SafeArea } from '@/components/safe-area';
import { StartWorkoutCard } from '@/components/start-workout-card';
import { StepTracker } from '@/components/step-tracker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TodaysWorkout } from '@/components/todays-workout';
import { ChevronRightIcon } from '@/components/ui/icons';
import { WebBadge } from '@/components/web-badge';
import { WeeklyWorkoutCalendar } from '@/components/weekly-workout-calendar';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const NAV_ROWS: { label: string; href: Href }[] = [
  { label: 'View Routines', href: '/routine' },
  { label: 'View Exercises', href: '/exercise' },
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

          {NAV_ROWS.map((row) => (
            <NavRow key={row.label} label={row.label} href={row.href} />
          ))}

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

function NavRow({ label, href }: { label: string; href: Href }) {
  const router = useRouter();
  const theme = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(href)}
      style={[styles.sessionsRow, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="default" style={styles.sessionsRowTitle}>{label}</ThemedText>
      <ChevronRightIcon size={18} color={theme.textSecondary} />
    </TouchableOpacity>
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
  sessionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  sessionsRowTitle: {
    fontWeight: '600',
  },
});
