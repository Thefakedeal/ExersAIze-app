import { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DaySelectorRow,
  WalkingBreakdownChart,
  WeeklyStepsBarChart,
  WeekNavigator
} from '@/components/step-details';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChevronLeftIcon } from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useDatesBetween } from '@/hooks/use-dates-between';
import { useTheme } from '@/hooks/use-theme';
import { addWeeks, endOfWeek, format, getDate, startOfWeek } from 'date-fns';

interface StepDetailsScreenProps {
  onBack: () => void;
  goalSteps?: number;
}

export function StepDetailsScreen({
  onBack,
  goalSteps = 10000,
}: StepDetailsScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [weekOffset, setWeekOffset] = useState(0);
  
  const [startDate, endDate] = useMemo(() => {
    const reference = addWeeks(new Date(), weekOffset);
    return [
      startOfWeek(reference, { weekStartsOn: 0 }),
      endOfWeek(reference, { weekStartsOn: 0 }),
    ];
  }, [weekOffset]);

  const days = useDatesBetween({ startDate, endDate });

  const todayIndex = days.findIndex((d) => d.toDateString() === new Date().toDateString());
  const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex >= 0 ? todayIndex : 0);

  const selectedDay = useMemo(() => {
    return days[selectedDayIndex];
  }, [selectedDayIndex]);

  
  return (
    <ThemedView style={styles.container}>
      {/* Top Header */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: Math.max(insets.top, Spacing.two),
            borderBottomColor: theme.separator,
          },
        ]}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <ChevronLeftIcon size={24} color={theme.text} />
        </TouchableOpacity>

        <ThemedText type="smallBold" style={styles.headerTitle}>
          Step Details
        </ThemedText>

        <View style={styles.headerRightPlaceholder} />
      </View>


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}>
        <View style={styles.contentWrapper}>
          {/* Week Navigation */}
          <WeekNavigator
            weekOffset={weekOffset}
            weekRangeLabel={`${format(startDate, 'MMM')} ${getDate(startDate)} - ${format(endDate, 'MMM')} ${getDate(endDate)}`}
            onPrevWeek={() => setWeekOffset((prev) => prev - 1)}
            onNextWeek={() => setWeekOffset((prev) => Math.min(prev + 1, 0))}
          />
          {/* Week Overview Summary Card */}
          {/* <WeekSummaryCard
            weekOffset={weekOffset}
          /> */}

          {/* Sunday - Saturday Daily Steps Bar Graph */}
          <WeeklyStepsBarChart
            weeklyOffset={weekOffset}
            goalSteps={goalSteps}
          />

          {/* Active Day Selector Tabs/Buttons Row */}
          <DaySelectorRow
            days={days}
            selectedIndex={selectedDayIndex}
            onSelectDay={setSelectedDayIndex}
          />


          {/* Walking Breakdown Line Graph */}
          <WalkingBreakdownChart day={selectedDay} />
        </View>
      </ScrollView>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 17,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
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
});
