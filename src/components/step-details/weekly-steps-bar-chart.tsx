import { useState } from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, G, Line, Rect, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DayStepData, useWeeklySteps } from '@/hooks/use-weekly-steps';

export interface WeeklyStepsBarChartProps {
  days?: DayStepData[];
  selectedDayIndex?: number;
  onSelectDay?: (index: number) => void;
  goalSteps?: number;
}

export function WeeklyStepsBarChart({
  days: propDays,
  selectedDayIndex: propSelectedIndex,
  onSelectDay,
  goalSteps = 10000,
}: WeeklyStepsBarChartProps) {
  const theme = useTheme();
  const fallbackWeeklyData = useWeeklySteps(0, goalSteps);
  const days = propDays ?? fallbackWeeklyData.days;

  const [internalSelectedIndex, setInternalSelectedIndex] = useState(() => {
    const todayIdx = days.findIndex((d) => d.isToday);
    return todayIdx >= 0 ? todayIdx : 0;
  });

  const activeIndex = propSelectedIndex ?? internalSelectedIndex;

  const handleSelect = (idx: number) => {
    if (onSelectDay) {
      onSelectDay(idx);
    } else {
      setInternalSelectedIndex(idx);
    }
  };

  const [containerWidth, setContainerWidth] = useState(340);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) {
      setContainerWidth(Math.min(width - Spacing.four * 2, MaxContentWidth));
    }
  };

  const chartHeight = 180;
  const bottomPadding = 36;
  const topPadding = 24;
  const usableHeight = chartHeight - bottomPadding - topPadding;

  const maxRecordedSteps = Math.max(...days.map((d) => d.steps), goalSteps);
  const chartMaxSteps = Math.max(maxRecordedSteps * 1.15, goalSteps * 1.15);

  const goalY = topPadding + usableHeight * (1 - goalSteps / chartMaxSteps);

  const barCount = 7;
  const barWidth = Math.max(18, Math.min(32, (containerWidth - 40) / barCount - 12));
  const slotWidth = containerWidth / barCount;

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.card, { borderColor: theme.border }]}
      onLayout={onLayout}>
      <View style={styles.cardHeader}>
        <View>
          <ThemedText type="subtitle">Weekly Steps</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Sunday – Saturday • Tap bar to inspect day
          </ThemedText>
        </View>

        <View
          style={[
            styles.goalBadge,
            { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
          ]}>
          <ThemedText type="small" themeColor="textSecondary">
            Goal: {goalSteps.toLocaleString()}
          </ThemedText>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <Svg width={containerWidth} height={chartHeight}>
          {/* Goal Line */}
          <Line
            x1={8}
            y1={goalY}
            x2={containerWidth - 8}
            y2={goalY}
            stroke={theme.primary}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            opacity={0.8}
          />
          <SvgText
            x={containerWidth - 12}
            y={goalY - 6}
            fill={theme.primary}
            fontSize={10}
            fontWeight="600"
            textAnchor="end">
            10k Goal
          </SvgText>

          {/* 7 Daily Bars */}
          {days.map((day, idx) => {
            const isSelected = idx === activeIndex;
            const centerX = idx * slotWidth + slotWidth / 2;
            const barX = centerX - barWidth / 2;

            const rawHeight = (day.steps / chartMaxSteps) * usableHeight;
            const height = Math.max(day.steps > 0 ? 6 : 2, rawHeight);
            const barY = topPadding + usableHeight - height;

            const barColor = isSelected
              ? theme.primary
              : day.metGoal
              ? theme.primary
              : day.isFuture
              ? theme.separator
              : theme.chartGrid;

            return (
              <G key={day.dayName}>
                {/* Highlight background pill */}
                {isSelected && (
                  <Rect
                    x={centerX - slotWidth / 2 + 2}
                    y={8}
                    width={slotWidth - 4}
                    height={chartHeight - 16}
                    rx={8}
                    fill={theme.backgroundSelected}
                    opacity={0.7}
                  />
                )}

                {/* Vertical Bar */}
                <Rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={height}
                  rx={barWidth / 2}
                  fill={barColor}
                />

                {/* Day Name */}
                <SvgText
                  x={centerX}
                  y={chartHeight - 20}
                  fill={isSelected ? theme.primary : theme.text}
                  fontSize={11}
                  fontWeight={isSelected ? '700' : '500'}
                  textAnchor="middle">
                  {day.dayName}
                </SvgText>

                {/* Day Date Number */}
                <SvgText
                  x={centerX}
                  y={chartHeight - 6}
                  fill={
                    isSelected
                      ? theme.primary
                      : day.isToday
                      ? theme.primary
                      : theme.textSecondary
                  }
                  fontSize={10}
                  fontWeight={day.isToday || isSelected ? '700' : '400'}
                  textAnchor="middle">
                  {day.dayNumber}
                </SvgText>

                {/* Today Dot */}
                {day.isToday && (
                  <Circle
                    cx={centerX}
                    cy={chartHeight - 32}
                    r={2.5}
                    fill={theme.primary}
                  />
                )}
              </G>
            );
          })}
        </Svg>

        {/* Touch overlay columns for each bar */}
        <View style={[StyleSheet.absoluteFill, styles.touchOverlayRow]}>
          {days.map((day, idx) => (
            <TouchableOpacity
              key={`touch-${day.dayName}`}
              style={[styles.touchColumn, { width: slotWidth }]}
              activeOpacity={0.6}
              onPress={() => handleSelect(idx)}
              accessibilityLabel={`Select ${day.dayName}, ${day.steps} steps`}
            />
          ))}
        </View>
      </View>

      {/* Quick Day Selector Pills */}
      <View style={styles.dayPillsRow}>
        {days.map((day, idx) => {
          const isSelected = idx === activeIndex;
          return (
            <TouchableOpacity
              key={`pill-${day.dayName}`}
              onPress={() => handleSelect(idx)}
              activeOpacity={0.7}
              style={[
                styles.dayPill,
                {
                  backgroundColor: isSelected
                    ? theme.primary
                    : theme.backgroundSecondary,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}>
              <ThemedText
                type="small"
                style={{
                  color: isSelected ? theme.textOnPrimary : theme.text,
                  fontWeight: isSelected ? '700' : '500',
                  fontSize: 12,
                }}>
                {day.dayName}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
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
  goalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: Spacing.one,
  },
  touchOverlayRow: {
    flexDirection: 'row',
  },
  touchColumn: {
    height: '100%',
  },
  dayPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: Spacing.two,
  },
  dayPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
    borderWidth: 1,
  },
});
