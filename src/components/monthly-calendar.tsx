import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { Spacing } from '@/constants/theme';
import { useMonthlyWorkoutStatus } from '@/hooks/use-monthly-workout-status';
import { useTheme } from '@/hooks/use-theme';
import { DayWorkoutStatus } from '@/types/schedule';

export interface MonthlyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthlyCalendar({
  selectedDate,
  onDateSelect,
  currentMonth,
  onMonthChange,
}: MonthlyCalendarProps) {
  const theme = useTheme();
  const statuses = useMonthlyWorkoutStatus(currentMonth);

  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);
  const gridStart = useMemo(
    () => startOfWeek(monthStart, { weekStartsOn: 0 }),
    [monthStart]
  );
  const gridEnd = useMemo(
    () => endOfWeek(monthEnd, { weekStartsOn: 0 }),
    [monthEnd]
  );

  const calendarDays = useMemo(
    () => eachDayOfInterval({ start: gridStart, end: gridEnd }),
    [gridStart, gridEnd]
  );
  const weeks = useMemo(() => chunk(calendarDays, 7), [calendarDays]);

  const handlePreviousMonth = () => {
    onMonthChange(addMonths(currentMonth, -1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const handleSelectDate = (date: Date) => {
    onDateSelect(date);
    if (!isSameMonth(date, currentMonth)) {
      onMonthChange(startOfMonth(date));
    }
  };

  const weekdayLabels = useMemo(
    () => eachDayOfInterval({ start: gridStart, end: gridEnd }).slice(0, 7),
    [gridStart, gridEnd]
  );

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.container, { borderColor: theme.border }]}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePreviousMonth}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          style={[styles.navButton, { backgroundColor: theme.backgroundSelected }]}>
          <ChevronLeftIcon size={20} color={theme.primary} />
        </TouchableOpacity>

        <ThemedText type="default" style={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy')}
        </ThemedText>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleNextMonth}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          style={[styles.navButton, { backgroundColor: theme.backgroundSelected }]}>
          <ChevronRightIcon size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayRow}>
        {weekdayLabels.map((day) => (
          <View key={day.toISOString()} style={styles.weekdayCell}>
            <ThemedText
              type="smallBold"
              themeColor="textSecondary"
              style={styles.weekdayText}>
              {format(day, 'EEEEE')}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const status = statuses[dayKey] ?? 'none';
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const { dot } = getDayStatusColors(status, theme);

              const circleBackground = isSelected ? theme.primary : 'transparent';
              const circleBorderColor =
                isSelected && isTodayDate
                  ? theme.textOnPrimary
                  : isSelected || isTodayDate
                    ? theme.primary
                    : 'transparent';
              const textColor = isSelected
                ? theme.textOnPrimary
                : isTodayDate
                  ? theme.primary
                  : isCurrentMonth
                    ? theme.text
                    : theme.textTertiary;

              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  activeOpacity={0.7}
                  onPress={() => handleSelectDate(day)}
                  accessibilityRole="button"
                  accessibilityLabel={format(day, 'EEEE, MMMM do, yyyy')}
                  accessibilityState={{ selected: isSelected }}
                  style={styles.dayCell}>
                  <View
                    style={[
                      styles.dayCircle,
                      {
                        backgroundColor: circleBackground,
                        borderColor: circleBorderColor,
                        borderWidth: isSelected || isTodayDate ? 1.5 : 0,
                      },
                    ]}>
                    <ThemedText type="default" style={[styles.dayText, { color: textColor }]}>
                      {format(day, 'd')}
                    </ThemedText>
                  </View>

                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isSelected
                          ? theme.textOnPrimary
                          : dot.backgroundColor,
                        borderColor: isSelected ? theme.textOnPrimary : dot.borderColor,
                        borderWidth: isSelected ? 0 : dot.borderWidth,
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

function getDayStatusColors(
  status: DayWorkoutStatus,
  theme: ReturnType<typeof useTheme>
) {
  switch (status) {
    case 'completed':
      return { dot: { backgroundColor: theme.primary } };
    case 'scheduled':
      return { dot: { backgroundColor: theme.accent } };
    case 'skipped':
      return {
        dot: {
          backgroundColor: 'transparent',
          borderColor: theme.error,
          borderWidth: 1,
        },
      };
    case 'none':
    default:
      return { dot: { backgroundColor: 'transparent' } };
  }
}

function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
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
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  navButton: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  grid: {
    gap: Spacing.one,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
});
