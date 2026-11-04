import { addWeeks, endOfWeek, isSameDay, startOfWeek } from 'date-fns';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDailyStepRecord } from '@/hooks/use-daily-step-record';
import { useTheme } from '@/hooks/use-theme';

export interface WeeklyStepsBarChartProps {
  weeklyOffset?: number;
  goalSteps?: number;
}

const formatSteps = (steps: number) => {
  if (steps >= 1000) return `${(steps / 1000).toFixed(1)}K`;
  return Math.round(steps).toString();
};

export function WeeklyStepsBarChart({
  weeklyOffset = 0,
  goalSteps = 10000,
}: WeeklyStepsBarChartProps) {
  const theme = useTheme();
  const [containerWidth, setContainerWidth] = useState(340);

  const [sunday, saturday] = useMemo(() => {
    const reference = addWeeks(new Date(), weeklyOffset);

    return [
      startOfWeek(reference, { weekStartsOn: 0 }),
      endOfWeek(reference, { weekStartsOn: 0 }),
    ];
  }, [weeklyOffset]);

  const weeklyReport = useDailyStepRecord({
    startDate: sunday,
    endDate: saturday,
  });

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;

    if (width > 0) {
      setContainerWidth(width);
    }
  };

  const records = weeklyReport.records ?? [];
  const isLoading = weeklyReport.loading;

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + index);

      const record = records.find((item) =>
        isSameDay(item.date, date)
      );

      return {
        date,
        steps: record?.steps ?? 0,
      };
    });
  }, [records, sunday]);

  const totalSteps = days.reduce((sum, day) => sum + day.steps, 0);
  const averageSteps = Math.round(totalSteps / 7);
  const completedDays = days.filter(
    (day) => day.steps >= goalSteps
  ).length;

  const chartMaxSteps = Math.max(
    goalSteps * 1.2,
    ...days.map((day) => day.steps * 1.15),
    1000
  );

  const barWidth = Math.max(
    18,
    Math.min(32, (containerWidth - 64) / 7 - 8)
  );

  const chartData = days.map((day) => ({
    value: day.steps,
    label: day.date.toLocaleDateString('en-US', {
      weekday: 'short',
    }),
    frontColor:
      day.steps >= goalSteps
        ? theme.primary
        : theme.accent,
    topLabelComponent: () =>
      day.steps > 0 ? (
        <ThemedText type="small">
          {formatSteps(day.steps)}
        </ThemedText>
      ) : null,
  }));

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.card, { borderColor: theme.border }]}
      onLayout={onLayout}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="subtitle">
            Weekly Steps
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Sunday – Saturday
          </ThemedText>
        </View>

        <View
          style={[
            styles.goalBadge,
            {
              backgroundColor: theme.primary + '15',
              borderColor: theme.primary + '40',
            },
          ]}
        >
          <ThemedText
            type="small"
            style={{ color: theme.primary }}
          >
            {formatSteps(goalSteps)} goal
          </ThemedText>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsRow}>
        <View>
          <ThemedText type="title">
            {formatSteps(totalSteps)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Total steps
          </ThemedText>
        </View>

        <View>
          <ThemedText type="title">
            {formatSteps(averageSteps)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Daily average
          </ThemedText>
        </View>

        <View>
          <ThemedText type="title">
            {completedDays}/7
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Goals reached
          </ThemedText>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator
              size="large"
              color={theme.primary}
            />
            <ThemedText
              type="small"
              themeColor="textSecondary"
            >
              Loading weekly activity...
            </ThemedText>
          </View>
        ) : (
          <BarChart
            data={chartData}
            width={containerWidth - Spacing.four * 2}
            height={180}
            barWidth={barWidth}
            maxValue={chartMaxSteps}
            noOfSections={4}
            yAxisLabelTexts={[]}
            hideYAxisText
            hideRules={false}
            rulesColor={theme.border}
            xAxisColor={theme.border}
            yAxisColor="transparent"
            xAxisLabelTextStyle={{
              color: theme.textSecondary,
              fontSize: 11,
            }}
            barBorderTopLeftRadius={6}
            barBorderTopRightRadius={6}
            initialSpacing={8}
            endSpacing={8}
            spacing={Math.max(
              4,
              (containerWidth - 64 - barWidth * 7) / 6
            )}
            isAnimated
            animationDuration={400}
          />
        )}
      </View>

      {/* Footer */}
      {!isLoading && (
        <View
          style={[
            styles.footer,
            { borderTopColor: theme.border },
          ]}
        >
          <View
            style={[
              styles.legendDot,
              { backgroundColor: theme.primary },
            ]}
          /> 
          <ThemedText type="small" themeColor="textSecondary">
            Daily goal achieved
          </ThemedText>

          <View
            style={[
              styles.legendDot,
              { backgroundColor: theme.accent },
            ]}
          />
          <ThemedText type="small" themeColor="textSecondary">
            Below goal
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    gap: 2,
  },
  goalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 210,
  },
  stateContainer: {
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.three,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});