import { Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuoteCard } from '@/components/quote-card';
import { StartWorkoutCard } from '@/components/start-workout-card';
import { StepTracker } from '@/components/step-tracker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TodaysWorkout } from '@/components/todays-workout';
import { WebBadge } from '@/components/web-badge';
import { WeeklyWorkoutCalendar } from '@/components/weekly-workout-calendar';
import { ChevronRightIcon } from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  const safeAreaInsets = useSafeAreaInsets();
    const insets = {
      ...safeAreaInsets,
      bottom: safeAreaInsets.bottom  + Spacing.three,
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
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.safeArea, contentPlatformStyle]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="title" style={styles.welcomeTitle}>
            Welcome
          </ThemedText>
          <StepTracker />

          <StartWorkoutCard />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/session')}
            style={[styles.sessionsRow, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="default" style={styles.sessionsRowTitle}>Past Sessions</ThemedText>
            <ChevronRightIcon size={18} color={theme.textSecondary} />
          </TouchableOpacity>

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
      </ThemedView>
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
