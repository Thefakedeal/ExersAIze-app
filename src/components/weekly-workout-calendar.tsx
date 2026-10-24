import { StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export type DayStatus = 'worked' | 'upcoming' | 'missed' | 'rest';

export interface WeekDay {
  day: string; // e.g., 'Mon', 'Tue'
  date: number; // e.g., '3', '4'
  status: DayStatus;
}

export interface WeeklyWorkoutCalendarProps {
  weekDays?: WeekDay[];
  workedOutCount?: number;
  totalWorkoutDays?: number;
}

const defaultWeekDays: WeekDay[] = [
  { day: 'Mon', status: 'worked', date: 2 },
  { day: 'Tue', status: 'worked', date: 3 },
  { day: 'Wed', status: 'missed', date: 4 },
  { day: 'Thu', status: 'upcoming', date: 5 },
  { day: 'Fri', status: 'rest', date: 6 },
  { day: 'Sat', status: 'upcoming', date: 7 },
  { day: 'Sun', status: 'rest', date: 8 },
];

export function WeeklyWorkoutCalendar({
  weekDays = defaultWeekDays,
  workedOutCount = weekDays.filter((d) => d.status === 'worked').length,
  totalWorkoutDays = weekDays.filter((d) => d.status === 'worked' || d.status === 'missed' || d.status === 'upcoming').length,
}: WeeklyWorkoutCalendarProps) {
  const scheme = useColorScheme();
  const actualColors = scheme === 'dark' ? Colors.dark : Colors.light;
  const theme = useTheme();
  const todaysdate = 4; // for now
  const getDayStyle = (status: DayStatus) => {
    switch (status) {
      case 'worked':
        return {
          backgroundColor: actualColors.primaryLight,
          borderColor: actualColors.primaryLight,
        };
      case 'upcoming':
        return {
          backgroundColor: 'transparent',
          borderColor: actualColors.primaryLight,
        };
      case 'missed':
        return {
          backgroundColor: 'transparent',
          borderColor: actualColors.error,
        };
      case 'rest':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
    }
  };

  const getDayTextColor = (status: DayStatus) => {
    switch (status) {
      case 'worked':
        return actualColors.primary;
      case 'upcoming':
        return actualColors.primary;
      case 'missed':
        return actualColors.error;
      case 'rest':
        return actualColors.textSecondary;
      default:
        return actualColors.text;
    }
  };

  return (
    <ThemedView type="backgroundElement" style={[styles.container, { borderColor: actualColors.border }]}>
      <View style={styles.header}>
        <ThemedText type="subtitle">This Week</ThemedText>
        <ThemedText type="small" style={{ color: actualColors.textSecondary }}>
          {workedOutCount} / {totalWorkoutDays} days worked out
        </ThemedText>
      </View>

      <View style={styles.daysContainer}>
        {weekDays.map((day, index) => {
          const dayStyle = getDayStyle(day.status);
          const textColor = getDayTextColor(day.status);
          return (
            <View key={index} style={styles.dayColumn}>
              
              <ThemedText type="small" style={[styles.dayLabel, {color: (day.date === todaysdate) ? actualColors.primary : actualColors.textSecondary,fontWeight: (day.date === todaysdate)? 'bold' : 'normal',}]}>
                {day.day}
              </ThemedText>
              <View style={[styles.dayCircle, dayStyle]}>
                <ThemedText type="smallBold" style={{ color: textColor }}>
                  {day.date|| "0"}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </View>
  
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: Spacing.four,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayColumn: {
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  dayLabel: {
    textTransform: 'uppercase',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
