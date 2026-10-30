import { useState } from 'react';
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DayStepData, useWeeklySteps } from '@/hooks/use-weekly-steps';

interface StepDetailsScreenProps {
  onBack: () => void;
  goalSteps?: number;
}

export function StepDetailsScreen({ onBack, goalSteps = 10000 }: StepDetailsScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week
  const [chartWidth, setChartWidth] = useState(340);

  const weeklyData = useWeeklySteps(weekOffset, goalSteps);

  // Default to today if current week, otherwise default to first day or Saturday
  const todayIndex = weeklyData.days.findIndex((d) => d.isToday);
  const initialIndex = todayIndex >= 0 ? todayIndex : 0;
  const [selectedDayIndex, setSelectedDayIndex] = useState(initialIndex);

  // Keep selection bounded to 0-6
  const activeDayIndex = Math.min(Math.max(selectedDayIndex, 0), 6);
  const selectedDay: DayStepData = weeklyData.days[activeDayIndex] || weeklyData.days[0];

  const handlePrevWeek = () => {
    setWeekOffset((prev) => prev - 1);
  };

  const handleNextWeek = () => {
    if (weekOffset < 0) {
      setWeekOffset((prev) => prev + 1);
    }
  };

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) {
      // Subtract card inner padding
      setChartWidth(Math.min(width - Spacing.four * 2, MaxContentWidth));
    }
  };

  // Bar Graph Calculations (Sunday to Saturday)
  const barChartHeight = 180;
  const barBottomPadding = 36;
  const barTopPadding = 24;
  const usableBarHeight = barChartHeight - barBottomPadding - barTopPadding;

  const maxRecordedSteps = Math.max(...weeklyData.days.map((d) => d.steps), goalSteps);
  const chartMaxSteps = Math.max(maxRecordedSteps * 1.15, goalSteps * 1.15);

  const goalY =
    barTopPadding + usableBarHeight * (1 - goalSteps / chartMaxSteps);

  const barCount = 7;
  const barWidth = Math.max(18, Math.min(32, (chartWidth - 40) / barCount - 12));
  const slotWidth = chartWidth / barCount;

  // Line Graph Calculations for Walking Breakdown
  const lineChartHeight = 160;
  const lineBottomPadding = 30;
  const lineTopPadding = 20;
  const usableLineHeight = lineChartHeight - lineBottomPadding - lineTopPadding;

  const hourlyData = selectedDay.hourlyBreakdown;
  const maxHourlySteps = Math.max(...hourlyData.map((h) => h.steps), 100);

  const linePoints = hourlyData.map((item, index) => {
    const x = (index / (hourlyData.length - 1)) * (chartWidth - 40) + 20;
    const y =
      lineTopPadding +
      usableLineHeight * (1 - item.steps / (maxHourlySteps * 1.15));
    return { x, y, steps: item.steps, label: item.timeLabel };
  });

  // Construct SVG path for line and gradient fill
  let linePathD = '';
  let areaPathD = '';
  if (linePoints.length > 0) {
    linePathD = `M ${linePoints[0].x} ${linePoints[0].y}`;
    areaPathD = `M ${linePoints[0].x} ${lineChartHeight - lineBottomPadding} L ${linePoints[0].x} ${linePoints[0].y}`;

    for (let i = 1; i < linePoints.length; i++) {
      const prev = linePoints[i - 1];
      const curr = linePoints[i];
      // Smooth cubic bezier curve
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;

      linePathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      areaPathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    const lastPoint = linePoints[linePoints.length - 1];
    areaPathD += ` L ${lastPoint.x} ${lineChartHeight - lineBottomPadding} Z`;
  }

  // Find peak walking hour
  const peakHour = hourlyData.reduce(
    (max, cur) => (cur.steps > max.steps ? cur : max),
    hourlyData[0]
  );

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
        <View style={styles.contentWrapper} onLayout={onContainerLayout}>
          {/* Week Navigation Header */}
          <View style={[styles.weekNavCard, { borderColor: theme.border }]}>
            <TouchableOpacity
              onPress={handlePrevWeek}
              style={[styles.weekNavArrow, { backgroundColor: theme.backgroundSecondary }]}
              activeOpacity={0.7}
              accessibilityLabel="Previous week">
              <ChevronLeftIcon size={18} color={theme.text} />
            </TouchableOpacity>

            <View style={styles.weekLabelContainer}>
              <ThemedText type="default" style={{ textAlign: 'center', fontWeight: '600' }}>
                {weeklyData.weekRangeLabel}
              </ThemedText>
              {weekOffset === 0 && (
                <View
                  style={[
                    styles.currentWeekBadge,
                    { backgroundColor: theme.backgroundSelected },
                  ]}>
                  <ThemedText type="small" style={{ color: theme.primary, fontSize: 11 }}>
                    Current Week
                  </ThemedText>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleNextWeek}
              disabled={weekOffset >= 0}
              style={[
                styles.weekNavArrow,
                {
                  backgroundColor: theme.backgroundSecondary,
                  opacity: weekOffset >= 0 ? 0.35 : 1,
                },
              ]}
              activeOpacity={0.7}
              accessibilityLabel="Next week">
              <ChevronRightIcon size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Weekly Bar Graph (Sunday - Saturday) */}
          <ThemedView
            type="backgroundElement"
            style={[styles.card, { borderColor: theme.border }]}>
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

            {/* SVG Bar Chart */}
            <View style={styles.chartWrapper}>
              <Svg width={chartWidth} height={barChartHeight}>
                {/* 10,000 Step Goal Line */}
                <Line
                  x1={8}
                  y1={goalY}
                  x2={chartWidth - 8}
                  y2={goalY}
                  stroke={theme.primary}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  opacity={0.8}
                />
                <SvgText
                  x={chartWidth - 12}
                  y={goalY - 6}
                  fill={theme.primary}
                  fontSize={10}
                  fontWeight="600"
                  textAnchor="end">
                  10k Goal
                </SvgText>

                {/* 7 Daily Bars */}
                {weeklyData.days.map((day, idx) => {
                  const isSelected = idx === activeDayIndex;
                  const centerX = idx * slotWidth + slotWidth / 2;
                  const barX = centerX - barWidth / 2;

                  const rawHeight =
                    (day.steps / chartMaxSteps) * usableBarHeight;
                  const height = Math.max(day.steps > 0 ? 6 : 2, rawHeight);
                  const barY =
                    barTopPadding + usableBarHeight - height;

                  const barColor = isSelected
                    ? theme.primary
                    : day.metGoal
                    ? theme.primary
                    : day.isFuture
                    ? theme.separator
                    : theme.chartGrid;

                  return (
                    <G key={day.dayName}>
                      {/* Selection background highlight */}
                      {isSelected && (
                        <Rect
                          x={centerX - slotWidth / 2 + 2}
                          y={8}
                          width={slotWidth - 4}
                          height={barChartHeight - 16}
                          rx={8}
                          fill={theme.backgroundSelected}
                          opacity={0.7}
                        />
                      )}

                      {/* Bar */}
                      <Rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={height}
                        rx={barWidth / 2}
                        fill={barColor}
                      />

                      {/* Day Label */}
                      <SvgText
                        x={centerX}
                        y={barChartHeight - 20}
                        fill={isSelected ? theme.primary : theme.text}
                        fontSize={11}
                        fontWeight={isSelected ? '700' : '500'}
                        textAnchor="middle">
                        {day.dayName}
                      </SvgText>

                      {/* Date number */}
                      <SvgText
                        x={centerX}
                        y={barChartHeight - 6}
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

                      {/* "Today" Indicator Dot */}
                      {day.isToday && (
                        <Circle
                          cx={centerX}
                          cy={barChartHeight - 32}
                          r={2.5}
                          fill={theme.primary}
                        />
                      )}
                    </G>
                  );
                })}
              </Svg>

              {/* Touch overlay for each bar column */}
              <View style={[StyleSheet.absoluteFill, styles.touchOverlayRow]}>
                {weeklyData.days.map((day, idx) => (
                  <TouchableOpacity
                    key={`touch-${day.dayName}`}
                    style={[styles.touchColumn, { width: slotWidth }]}
                    activeOpacity={0.6}
                    onPress={() => setSelectedDayIndex(idx)}
                    accessibilityLabel={`Select ${day.dayName}, ${day.steps} steps`}
                  />
                ))}
              </View>
            </View>

            {/* Quick Day Selector Pills */}
            <View style={styles.dayPillsRow}>
              {weeklyData.days.map((day, idx) => {
                const isSelected = idx === activeDayIndex;
                return (
                  <TouchableOpacity
                    key={`pill-${day.dayName}`}
                    onPress={() => setSelectedDayIndex(idx)}
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

          {/* Selected Day Stats & Metrics */}
          <ThemedView
            type="backgroundElement"
            style={[styles.card, { borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
              <View>
                <ThemedText type="subtitle">
                  {selectedDay.isToday ? "Today's Metrics" : `${selectedDay.dayName}'s Metrics`}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {selectedDay.fullDateStr}
                  {selectedDay.isToday ? ' • Today' : ''}
                </ThemedText>
              </View>

              {selectedDay.metGoal && (
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
                  {selectedDay.steps.toLocaleString()}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.metricSub}>
                  {Math.round((selectedDay.steps / goalSteps) * 100)}% of goal
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
                  {selectedDay.calories.toLocaleString()}
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
                  {selectedDay.distanceKm}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.metricSub}>
                  kilometers
                </ThemedText>
              </View>
            </View>
          </ThemedView>

          {/* Walking Breakdown Line Graph */}
          <ThemedView
            type="backgroundElement"
            style={[styles.card, { borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
              <View>
                <ThemedText type="subtitle">Walking Breakdown</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {selectedDay.isToday
                    ? "Today's hourly walking activity"
                    : `Hourly walking on ${selectedDay.dayName}, ${selectedDay.dayNumber}`}
                </ThemedText>
              </View>

              {peakHour.steps > 0 && (
                <View
                  style={[
                    styles.peakBadge,
                    { backgroundColor: theme.backgroundSelected },
                  ]}>
                  <ThemedText type="small" style={{ color: theme.primary, fontSize: 11 }}>
                    Peak: {peakHour.timeLabel}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* SVG Line Graph */}
            <View style={styles.chartWrapper}>
              <Svg width={chartWidth} height={lineChartHeight}>
                <Defs>
                  <LinearGradient id="walkingGradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={theme.primary} stopOpacity={0.4} />
                    <Stop offset="90%" stopColor={theme.primary} stopOpacity={0.02} />
                  </LinearGradient>
                </Defs>

                {/* Horizontal reference guide lines */}
                <Line
                  x1={20}
                  y1={lineTopPadding}
                  x2={chartWidth - 20}
                  y2={lineTopPadding}
                  stroke={theme.separator}
                  strokeDasharray="2 3"
                  strokeWidth={1}
                />
                <Line
                  x1={20}
                  y1={lineTopPadding + usableLineHeight / 2}
                  x2={chartWidth - 20}
                  y2={lineTopPadding + usableLineHeight / 2}
                  stroke={theme.separator}
                  strokeDasharray="2 3"
                  strokeWidth={1}
                />
                <Line
                  x1={20}
                  y1={lineChartHeight - lineBottomPadding}
                  x2={chartWidth - 20}
                  y2={lineChartHeight - lineBottomPadding}
                  stroke={theme.border}
                  strokeWidth={1}
                />

                {/* Shaded Area under the Line */}
                {areaPathD ? (
                  <Path d={areaPathD} fill="url(#walkingGradient)" />
                ) : null}

                {/* Activity Line */}
                {linePathD ? (
                  <Path
                    d={linePathD}
                    fill="none"
                    stroke={theme.primary}
                    strokeWidth={2.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null}

                {/* Data Points and X-Axis Labels */}
                {linePoints.map((pt, i) => {
                  const isPeak = pt.steps === peakHour.steps && pt.steps > 0;
                  return (
                    <G key={`pt-${i}`}>
                      {/* Circle dot on line */}
                      <Circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isPeak ? 4.5 : 3}
                        fill={isPeak ? theme.primary : theme.backgroundElement}
                        stroke={theme.primary}
                        strokeWidth={2}
                      />

                      {/* Time label below line */}
                      <SvgText
                        x={pt.x}
                        y={lineChartHeight - 10}
                        fill={isPeak ? theme.primary : theme.textSecondary}
                        fontSize={9}
                        fontWeight={isPeak ? '700' : '400'}
                        textAnchor="middle">
                        {pt.label}
                      </SvgText>
                    </G>
                  );
                })}
              </Svg>
            </View>

            {/* Peak Activity Footer */}
            <View style={[styles.breakdownFooter, { borderTopColor: theme.separator }]}>
              <ThemedText type="small" themeColor="textSecondary">
                Most active period:{' '}
                <ThemedText type="smallBold" style={{ color: theme.primary }}>
                  {peakHour.timeLabel} ({peakHour.steps.toLocaleString()} steps)
                </ThemedText>
              </ThemedText>
            </View>
          </ThemedView>

          {/* Week Overview Summary Card */}
          <ThemedView
            type="backgroundElement"
            style={[styles.card, { borderColor: theme.border }]}>
            <ThemedText type="subtitle">Week Summary</ThemedText>
            <View style={styles.weekOverviewRow}>
              <View style={styles.weekOverviewCol}>
                <ThemedText type="small" themeColor="textSecondary">
                  Total Steps
                </ThemedText>
                <ThemedText type="default" style={{ fontWeight: '600' }}>
                  {weeklyData.totalWeekSteps.toLocaleString()}
                </ThemedText>
              </View>

              <View style={styles.weekOverviewCol}>
                <ThemedText type="small" themeColor="textSecondary">
                  Daily Avg
                </ThemedText>
                <ThemedText type="default" style={{ fontWeight: '600' }}>
                  {weeklyData.averageDailySteps.toLocaleString()}
                </ThemedText>
              </View>

              <View style={styles.weekOverviewCol}>
                <ThemedText type="small" themeColor="textSecondary">
                  Total Burned
                </ThemedText>
                <ThemedText type="default" style={{ fontWeight: '600' }}>
                  {weeklyData.caloriesBurned.toLocaleString()} kcal
                </ThemedText>
              </View>

              <View style={styles.weekOverviewCol}>
                <ThemedText type="small" themeColor="textSecondary">
                  Distance
                </ThemedText>
                <ThemedText type="default" style={{ fontWeight: '600' }}>
                  {weeklyData.distanceKm} km
                </ThemedText>
              </View>
            </View>
          </ThemedView>
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
  weekNavCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  weekNavArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekLabelContainer: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  currentWeekBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
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
  goalAchievedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  peakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
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
  breakdownFooter: {
    borderTopWidth: 1,
    paddingTop: Spacing.two,
    alignItems: 'center',
  },
  weekOverviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  weekOverviewCol: {
    alignItems: 'center',
    gap: 2,
  },
});
