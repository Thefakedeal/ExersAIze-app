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

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

  const { weeks, gridStart, gridEnd } = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return { weeks, gridStart, gridEnd };
  }, [currentMonth]);

  const statuses = useMonthlyWorkoutStatus({ startDate: gridStart, endDate: gridEnd });

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
        {WEEKDAYS.map((weekday, index) => (
          <View key={index} style={styles.weekdayCell}>
            <ThemedText
              type="smallBold"
              themeColor="textSecondary"
              style={styles.weekdayText}>
              {weekday}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {weeks.map((week) => (
          <View key={week[0].toISOString()} style={styles.weekRow}>
            {week.map((day) => (
              <CalendarDay
                key={day.toISOString()}
                day={day}
                status={statuses[format(day, 'yyyy-MM-dd')] ?? 'none'}
                selectedDate={selectedDate}
                currentMonth={currentMonth}
                onSelect={handleSelectDate}
              />
            ))}
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

interface CalendarDayProps {
  day: Date;
  status: DayWorkoutStatus;
  selectedDate: Date;
  currentMonth: Date;
  onSelect: (date: Date) => void;
}

function CalendarDay({
  day,
  status,
  selectedDate,
  currentMonth,
  onSelect,
}: CalendarDayProps) {
  const theme = useTheme();

  const isSelected = isSameDay(day, selectedDate);
  const isTodayDate = isToday(day);
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const textTheme = isTodayDate
    ? 'primary'
    : isCurrentMonth
      ? 'text'
      : 'textTertiary';
  const dotStyle = getDotStyle(status, theme);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onSelect(day)}
      accessibilityRole="button"
      accessibilityLabel={format(day, 'EEEE, MMMM do, yyyy')}
      accessibilityState={{ selected: isSelected }}
      style={styles.dayCell}>
      <View
        style={[
          styles.dayCircle,
          isSelected && { borderColor: theme.primary, borderWidth: 1.5 },
        ]}>
        <ThemedText type="default" themeColor={textTheme} style={styles.dayText}>
          {format(day, 'd')}
        </ThemedText>
      </View>
      <View style={[styles.dot, dotStyle]} />

    </TouchableOpacity>
  );
}

function getDotStyle(status: DayWorkoutStatus, theme: ReturnType<typeof useTheme>) {
  switch (status) {
    case 'completed':
      return { backgroundColor: theme.primary };
    case 'scheduled':
      return { backgroundColor: theme.accent };
    case 'skipped':
      return { borderColor: theme.error};
    default:
      return {};
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
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2
  },
});
