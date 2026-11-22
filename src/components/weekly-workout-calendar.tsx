import { format } from 'date-fns';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { CalendarIcon } from '@/components/ui/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWeeklyWorkoutStatus } from '@/hooks/use-weekly-workout-status';
import { DayWorkoutStatus } from '@/types/schedule';

export interface WeeklyWorkoutCalendarProps {
  /** Called with the selected date whenever the user taps a day. */
  onDateSelect?: (date: Date) => void;
}

export function WeeklyWorkoutCalendar({ onDateSelect }: WeeklyWorkoutCalendarProps) {
  const theme = useTheme();
  const { days, statuses, todayIndex } = useWeeklyWorkoutStatus();
  const [selectedIndex, setSelectedIndex] = useState(() => Math.max(0, todayIndex));

  if (days.length === 0) {
    return null;
  }

  const handleSelectDay = (index: number) => {
    setSelectedIndex(index);
    onDateSelect?.(days[index]);
  };

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.container, { borderColor: theme.border }]}>
      <View style={styles.header}>
        <ThemedText type="default" style={styles.headerTitle}>
          This Week
        </ThemedText>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/schedule')}
          accessibilityRole="button"
          accessibilityLabel="View schedule"
          style={[styles.viewScheduleButton, { backgroundColor: theme.backgroundSelected }]}>
          <CalendarIcon size={14} color={theme.primary} />
          <ThemedText type="smallBold" style={[styles.viewScheduleText, { color: theme.primary }]}>
            View Schedule
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        {days.map((day, index) => {
          const { dot, text } = getDayStatusColors(statuses[index] ?? 'none', theme);
          const isSelected = index === selectedIndex;
          const isToday = index === todayIndex;

          return (
            <TouchableOpacity
              key={day.toISOString()}
              activeOpacity={0.7}
              onPress={() => handleSelectDay(index)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={format(day, 'EEEE, MMMM d')}
              style={[
                styles.dayColumn,
                { backgroundColor: 'transparent', borderColor: 'transparent' }
                
              ]}>
              <ThemedText
                type="small"
                style={[
                  styles.dayLabel,
                  { color: isSelected ? theme.primary : theme.textSecondary },
                ]}>
                {format(day, 'EEE')}
              </ThemedText>

              <View style={[styles.dayCircle, isSelected
                  ? { backgroundColor: theme.backgroundSecondary, borderColor: theme.primary }
                  : { backgroundColor: 'transparent', borderColor: 'transparent' },]}>
                <ThemedText type="smallBold" style={[{ color: text}]}>
                  {format(day, 'd')}
                </ThemedText>
              </View>

              <View style={styles.dotContainer}>
                {isToday && <View style={[styles.todayDot, { backgroundColor: theme.textOnPrimary }]} />}
                {!isToday && <View style={[styles.todayDot, dot]} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ThemedView>
  );
}

function getDayStatusColors(status: DayWorkoutStatus, theme: ReturnType<typeof useTheme>) {
  switch (status) {
    case 'completed':
      return {
        dot: { backgroundColor: theme.primary },
        text: theme.textSecondary,
      };
    case 'scheduled':
      return { dot: { backgroundColor: theme.accent }, text: theme.textSecondary };
    case 'skipped':
      return { dot: { borderColor: theme.error, borderWidth: 1.5, backgroundColor: 'transparent' }, text: theme.error };
    case 'none':
    default:
      return { dot: { backgroundColor: 'transparent' }, text: theme.textSecondary };
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: Spacing.three,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headerTitle: {
    fontWeight: '600',
  },
  viewScheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  viewScheduleText: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: 2,
    borderRadius: Spacing.two,
    borderWidth: 1,
    gap: Spacing.two,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dotContainer: {
    height: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
