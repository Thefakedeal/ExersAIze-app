import { useRouter } from 'expo-router';
import { format, startOfDay, startOfMonth } from 'date-fns';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/header';
import { MonthlyCalendar } from '@/components/monthly-calendar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CalendarIcon, PlusIcon } from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useScheduledOccurrences } from '@/hooks/use-scheduled-occurrences';
import { useTheme } from '@/hooks/use-theme';

export function ScheduleScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(selectedDate));
  const { occurrences: dayOccurrences } = useScheduledOccurrences({
    startDate: selectedDate,
    endDate: selectedDate,
  });

  const handleAddActivity = () => {
    router.push(`/schedule/add-activity?date=${format(selectedDate, 'yyyy-MM-dd')}`);
  };

  return (
    <ThemedView style={styles.container}>
      <Header
        onBackPress={router.back}
        title="Schedule"
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleAddActivity}
            accessibilityRole="button"
            accessibilityLabel="Add activity"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.headerAction}>
            <PlusIcon size={22} color={theme.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}>
        <View style={styles.contentWrapper}>
          {/* Intro Card */}
          <ThemedView
            type="backgroundElement"
            style={[styles.introCard, { borderColor: theme.border }]}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.primaryLight },
              ]}>
              <CalendarIcon size={28} color={theme.primary} />
            </View>
            <ThemedText type="subtitle" style={styles.introTitle}>
              Schedule
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.introDescription}>
              Plan and manage your upcoming workouts in one place.
            </ThemedText>
          </ThemedView>

          {/* Calendar */}
          <MonthlyCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />

          {/* Selected-day activities */}
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {format(selectedDate, 'EEEE, MMMM d')}
            </ThemedText>
          </View>

          {dayOccurrences.length === 0 ? (
            <ThemedView
              type="backgroundElement"
              style={[styles.emptyCard, { borderColor: theme.border }]}>
              <ThemedText type="default" style={styles.emptyTitle}>
                No activities scheduled
              </ThemedText>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.emptyDescription}>
                Tap + to add an activity for this day.
              </ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.activityList}>
              {dayOccurrences.map((occurrence) => (
                <ThemedView
                  key={occurrence.id}
                  type="backgroundElement"
                  style={[styles.activityCard, { borderColor: theme.border }]}>
                  <ThemedText type="smallBold">
                    {occurrence.title ?? 'Activity'}
                  </ThemedText>
                  {occurrence.startTime && (
                    <ThemedText type="small" themeColor="textSecondary">
                      {format(
                        new Date(
                          `${occurrence.scheduledDate}T${occurrence.startTime}`
                        ),
                        'h:mm a'
                      )}
                    </ThemedText>
                  )}
                </ThemedView>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.three,
  },
  contentWrapper: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  introCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.two,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  introTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  introDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.one,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  headerAction: {
    padding: Spacing.one,
    marginRight: -Spacing.one,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityList: {
    gap: Spacing.two,
  },
  activityCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
    gap: 2,
  },
});
