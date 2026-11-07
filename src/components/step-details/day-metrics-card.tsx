import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DayStepData, useWeeklySteps } from '@/hooks/use-weekly-steps';
import { useEffect } from 'react';

export interface DayMetricsCardProps {
  day?: DayStepData;
  goalSteps?: number;
}

export function DayMetricsCard({ day: propDay, goalSteps = 10000 }: DayMetricsCardProps) {
  const theme = useTheme();
  const fallbackWeeklyData = useWeeklySteps(0, goalSteps);
  const fallbackDay =
    fallbackWeeklyData.days.find((d) => d.isToday) ?? fallbackWeeklyData.days[0];
  const day = propDay ?? fallbackDay;

  useEffect(() => {
      console.log('DayMetricsCard day updated:', JSON.stringify(day, null, 2));
  }, [day]);
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View>
          <ThemedText type="subtitle">
            {day.isToday ? "Today's Metrics" : `${day.dayName}'s Metrics`}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {day.fullDateStr}
            {day.isToday ? ' • Today' : ''}
          </ThemedText>
        </View>

        {day.metGoal && (
          <View
            style={[
              styles.goalAchievedBadge,
              { backgroundColor: theme.backgroundSelected },
            ]}>
            <ThemedText type="smallBold" style={{ color: theme.primary, fontSize: 11 }}>
              Goal Met 🎉
            </ThemedText>
          </View>
        )}
      </View>

      {/* 3 Metric Cards: Steps, Calories, Distance */}
      <View style={styles.metricsRow}>
        {/* Steps */}
        <View
          style={[
            styles.metricCard,
            { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
          ]}>
          <ThemedText type="small" themeColor="textSecondary">
            Steps
          </ThemedText>
          <ThemedText type="title" style={styles.metricValue}>
            {day.steps.toLocaleString()}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.metricSub}>
            {Math.round((day.steps / goalSteps) * 100)}% of goal
          </ThemedText>
        </View>

        {/* Calories Burnt */}
        <View
          style={[
            styles.metricCard,
            { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
          ]}>
          <ThemedText type="small" themeColor="textSecondary">
            Calories
          </ThemedText>
          <ThemedText type="title" style={styles.metricValue}>
            {day.calories.toLocaleString()}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.metricSub}>
            kcal burnt
          </ThemedText>
        </View>

        {/* Distance Taken */}
        <View
          style={[
            styles.metricCard,
            { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
          ]}>
          <ThemedText type="small" themeColor="textSecondary">
            Distance
          </ThemedText>
          <ThemedText type="title" style={styles.metricValue}>
            {day.distanceKm}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.metricSub}>
            kilometers
          </ThemedText>
        </View>
      </View>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalAchievedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metricCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  metricValue: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  metricSub: {
    fontSize: 11,
    textAlign: 'center',
  },
});
