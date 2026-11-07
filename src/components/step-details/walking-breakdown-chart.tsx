import { format, getHours, isFuture, isToday } from 'date-fns';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useHourlyBreakdown } from '@/hooks/use-hourly-breakdown';
import { useTheme } from '@/hooks/use-theme';

export interface WalkingBreakdownChartProps {
  day?: Date;
}

const formatHour = (hour: number) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}`;
};

export function WalkingBreakdownChart({ day = new Date() }: WalkingBreakdownChartProps) {
  const theme = useTheme();
  const { error, loading, records } = useHourlyBreakdown({ day });

  const [containerWidth, setContainerWidth] = useState(340);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) {
      setContainerWidth(Math.min(width, MaxContentWidth));
    }
  };

  const isDayToday = isToday(day);
  const isDayFuture = isFuture(day) && !isDayToday;
  const currentHour = getHours(new Date());

  const visibleRecords = useMemo(() => {
    const safeRecords = records ?? [];
    if (isDayFuture) {
      return [];
    }
    // If it is today, don't show steps for future hours
    if (isDayToday) {
      return safeRecords.filter((r) => r.hour <= currentHour);
    }
    return safeRecords;
  }, [records, isDayToday, isDayFuture, currentHour]);

  const peakRecord = useMemo(() => {
    if (!visibleRecords.length) return null;
    const max = Math.max(...visibleRecords.map((r) => r.steps));
    if (max <= 0) return null;
    return visibleRecords.find((r) => r.steps === max) ?? null;
  }, [visibleRecords]);

  const totalSteps = useMemo(() => {
    return visibleRecords.reduce((sum, r) => sum + r.steps, 0);
  }, [visibleRecords]);

  const activeHours = useMemo(() => {
    return visibleRecords.filter((r) => r.steps > 0).length;
  }, [visibleRecords]);

  const formattedDate = useMemo(() => {
    if (isDayToday) {
      return "Today";
    }
    return format(day, 'EEEE, MMM d');
  }, [day, isDayToday]);

  const maxSteps = Math.max(...visibleRecords.map((r) => r.steps+200), 0);
  const chartMax = maxSteps > 0 ? Math.ceil(maxSteps * 1.25) : 100;

  const chartWidth = Math.max(containerWidth - Spacing.four * 2, 220);
  const numPoints = visibleRecords.length;
  const initialSpacing = 12;
  const endSpacing = 12;
  const spacing =
    numPoints > 1
      ? Math.max(8, (chartWidth - initialSpacing - endSpacing) / (numPoints - 1))
      : 24;

  const chartData = useMemo(() => {
    return visibleRecords.map((record) => {
      const isPeak =
        peakRecord !== null && record.hour === peakRecord.hour && record.steps > 0;
      const hasSteps = record.steps > 0;

      let label = '';
      if (numPoints <= 4) {
        label = formatHour(record.hour);
      } else if (numPoints <= 13) {
        label = record.hour % 3 === 0 ? formatHour(record.hour) : '';
      } else {
        label = record.hour % 6 === 0 ? formatHour(record.hour) : '';
      }

      return {
        value: record.steps,
        label,
        labelTextStyle: {
          color: theme.textSecondary,
          fontSize: 10,
        },
        dataPointText: hasSteps
          ? record.steps >= 1000
            ? `${(record.steps / 1000).toFixed(1)}k`
            : `${record.steps}`
          : undefined,
        textColor: isPeak ? theme.accent : theme.textSecondary,
        textFontSize: 9,
        textShiftY: -8,
        textShiftX: -2,
        dataPointColor: isPeak
          ? theme.accent
          : hasSteps
            ? theme.primary
            : theme.borderStrong,
        dataPointRadius: isPeak ? 5 : hasSteps ? 3.5 : 2,
        hour: record.hour,
      };
    });
  }, [visibleRecords, peakRecord, numPoints, theme]);

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.card, { borderColor: theme.border }]}
      onLayout={onLayout}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="subtitle">
            Hourly Activity
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formattedDate}
          </ThemedText>
        </View>

       
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View>
          <ThemedText type="smallBold">
            {totalSteps.toLocaleString()}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Total steps
          </ThemedText>
        </View>

        <View>
          <ThemedText type="smallBold">
            {peakRecord && peakRecord.steps > 0 ? formatHour(peakRecord.hour) : '—'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Peak time
          </ThemedText>
        </View>

        <View>
          <ThemedText type="smallBold">
            {activeHours} hrs
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Active hours
          </ThemedText>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText type="small" themeColor="textSecondary">
              Loading hourly breakdown...
            </ThemedText>
          </View>
        ) : error ? (
          <View style={styles.stateContainer}>
            <ThemedText type="small" themeColor="textSecondary">
              {error}
            </ThemedText>
          </View>
        ) : visibleRecords.length === 0 ? (
          <View style={styles.stateContainer}>
            <ThemedText type="small" themeColor="textSecondary">
              {isDayFuture
                ? 'No activity recorded yet for future date.'
                : 'No hourly activity recorded.'}
            </ThemedText>
          </View>
        ) : (
          <LineChart
            areaChart
            // curved
            overflowTop={25}
            overflowBottom={25}
            data={chartData}
            width={chartWidth}
            height={200}
            spacing={spacing}
            initialSpacing={initialSpacing}
            endSpacing={endSpacing}
            color={theme.primary}
            thickness={2.5}
            startFillColor={theme.primary}
            endFillColor={theme.backgroundElement}
            startOpacity={0.25}
            endOpacity={0.02}
            maxValue={chartMax}
            noOfSections={5}
            rulesColor={theme.border}
            rulesType="solid"
            hideYAxisText
            yAxisThickness={0}
            yAxisColor="transparent"
            xAxisColor={theme.border}
            xAxisThickness={1}
            xAxisLabelTextStyle={{
              color: theme.textSecondary,
              fontSize: 5,
            }}
            pointerConfig={{
              pointerColor: theme.primary,
              pointerStripColor: theme.border,
              pointerStripWidth: 1,
              radius: 5,
              pointerLabelWidth: 110,
              pointerLabelHeight: 52,
              activatePointersOnLongPress: false,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items: any) => {
                const item = items?.[0];
                if (!item) return null;
                const hour = item.hour ?? 0;
                const val = item.value ?? 0;
                return (
                  <View
                    style={[
                      styles.tooltipContainer,
                      {
                        backgroundColor: theme.backgroundElement,
                        borderColor: theme.border,
                      },
                    ]}>
                    <ThemedText
                      type="small"
                      style={{ fontSize: 10, color: theme.textSecondary }}>
                      {formatHour(hour)}
                    </ThemedText>
                    <ThemedText
                      type="smallBold"
                      style={{ fontSize: 12, color: theme.primary }}>
                      {Number(val).toLocaleString()} steps
                    </ThemedText>
                  </View>
                );
              },
            }}
          />
        )}
      </View>

      {/* Footer Peak Highlight */}
      {peakRecord && peakRecord.steps > 0 && (
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <ThemedText type="small" themeColor="textSecondary">
            Peak activity reached {peakRecord.steps.toLocaleString()} steps at{' '}
            {formatHour(peakRecord.hour)}
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
  peakBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
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
    minHeight: 180,
    overflow: 'visible',
  },
  stateContainer: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  tooltipContainer: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
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

