import { format, isFuture, isSameDay, isToday, startOfDay, startOfMonth } from 'date-fns';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/header';
import { MonthlyCalendar } from '@/components/monthly-calendar';
import { ActivityCard } from '@/components/schedule/activity-card';
import { SessionCard } from '@/components/session/session-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PlusIcon } from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useDebounce } from '@/hooks/use-debounce';
import { useScheduledOccurrences } from '@/hooks/use-scheduled-occurrences';
import { useTheme } from '@/hooks/use-theme';
import { useWorkoutSessions } from '@/hooks/use-workout-sessions';
import { DeleteScope, deleteScheduledOccurrence } from '@/services/schedule-storage';


export function ScheduleScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(selectedDate));
  const { occurrences: dayOccurrences,  } = useScheduledOccurrences({
    startDate: selectedDate,
    endDate: selectedDate,
  });
  const { sessions } = useWorkoutSessions();

  const daySessions = useMemo(() => {
    return sessions.filter((session) => isSameDay(new Date(session.startTime), selectedDate));
  }, [sessions, selectedDate]);

  const canSchedule = useMemo(()=>{
    return isToday(selectedDate) || isFuture(selectedDate);
  },[selectedDate])

  const debouncedSchedule = useDebounce(canSchedule,50)

  const handleAddActivity = () => {
    router.push(`/schedule/add-activity?date=${format(selectedDate, 'yyyy-MM-dd')}`);
  };

  const handleSessionPress = (id: string) => {
    router.push(`/session/view-session?id=${id}`);
  };

  const handleActivityPress = (id: string) => {
    router.push(`/schedule/activity-detail?id=${id}`);
  };

  const handleEditActivity = (id: string) => {
    router.push(`/schedule/edit-activity?id=${id}`);
  };

  const handleDeleteActivity = async (id: string, scope: DeleteScope) => {
    try {
      await deleteScheduledOccurrence(id, scope);
    } catch {
      Alert.alert('Error', 'Failed to delete activity. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Header
        onBackPress={router.back}
        title="Schedule"
        rightAction={
          canSchedule ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleAddActivity}
              accessibilityRole="button"
              accessibilityLabel="Add activity"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.headerAction}>
              <PlusIcon size={22} color={theme.primary} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}>
        <View style={styles.contentWrapper}>
          {/* Calendar */}
          <MonthlyCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />

          {/* Selected day */}
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {format(selectedDate, 'EEEE, MMMM d')}
            </ThemedText>
          </View>

          {/* Workout sessions for the selected date */}
          {!isFuture(selectedDate) && daySessions.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <ThemedText type="smallBold">Workouts</ThemedText>
              </View>

              <View style={styles.sessionList}>
                {daySessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onPress={() => handleSessionPress(session.id)}
                  />
                ))}
              </View>
            </>
          )}

          {/* Scheduled activities for the selected date */}
          {(dayOccurrences.length > 0 || canSchedule) && (
            <>
              <View style={styles.sectionHeader}>
                <ThemedText type="smallBold">Scheduled Activities</ThemedText>
              </View>

              {(dayOccurrences.length === 0 && debouncedSchedule) ? (
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
                    Schedule your first activity for this day.
                  </ThemedText>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleAddActivity}
                    accessibilityRole="button"
                    accessibilityLabel="Add activity"
                    style={[styles.emptyActionButton, { backgroundColor: theme.primary }]}>
                    <PlusIcon size={16} color={theme.textOnPrimary} />
                    <ThemedText>Add Activity </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              ) : (
                <View style={styles.activityList}>
                  {dayOccurrences.map((occurrence) => (
                    <ActivityCard
                      key={occurrence.id}
                      occurrence={occurrence}
                      sessions={sessions}
                      onPress={() => handleActivityPress(occurrence.id)}
                      onEdit={handleEditActivity}
                      onDelete={handleDeleteActivity}
                    />
                  ))}
                </View>
              )}
            </>
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
    flexGrow: 1,
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
  emptyActionButton: {
    flexDirection: 'row',
    gap:2,
    alignItems: 'center',
    justifyContent:"center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
    borderRadius: 10,
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
  sessionList: {
    gap: Spacing.three,
  },
});
