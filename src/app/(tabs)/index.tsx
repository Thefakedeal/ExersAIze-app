import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuoteCard } from '@/components/quote-card';
import { StepTracker } from '@/components/step-tracker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TodaysWorkout } from '@/components/todays-workout';
import { WebBadge } from '@/components/web-badge';
import { WeeklyWorkoutCalendar } from '@/components/weekly-workout-calendar';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {

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
});
