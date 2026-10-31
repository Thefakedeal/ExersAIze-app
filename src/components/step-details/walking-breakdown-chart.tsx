import { useState } from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DayStepData, useWeeklySteps } from '@/hooks/use-weekly-steps';

export interface WalkingBreakdownChartProps {
  day?: DayStepData;
}

export function WalkingBreakdownChart({ day: propDay }: WalkingBreakdownChartProps) {
  const theme = useTheme();
  const fallbackWeeklyData = useWeeklySteps();
  const fallbackDay =
    fallbackWeeklyData.days.find((d) => d.isToday) ?? fallbackWeeklyData.days[0];
  const day = propDay ?? fallbackDay;

  const [containerWidth, setContainerWidth] = useState(340);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) {
      setContainerWidth(Math.min(width - Spacing.four * 2, MaxContentWidth));
    }
  };

  const chartHeight = 160;
  const bottomPadding = 30;
  const topPadding = 20;
  const usableHeight = chartHeight - bottomPadding - topPadding;

  const hourlyData = day.hourlyBreakdown;
  const maxHourlySteps = Math.max(...hourlyData.map((h) => h.steps), 100);

  const points = hourlyData.map((item, index) => {
    const x = (index / (hourlyData.length - 1)) * (containerWidth - 40) + 20;
    const y = topPadding + usableHeight * (1 - item.steps / (maxHourlySteps * 1.15));
    return { x, y, steps: item.steps, label: item.timeLabel };
  });

  let linePathD = '';
  let areaPathD = '';
  if (points.length > 0) {
    linePathD = `M ${points[0].x} ${points[0].y}`;
    areaPathD = `M ${points[0].x} ${chartHeight - bottomPadding} L ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;

      linePathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      areaPathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    const lastPoint = points[points.length - 1];
    areaPathD += ` L ${lastPoint.x} ${chartHeight - bottomPadding} Z`;
  }

  const peakHour = hourlyData.reduce(
    (max, cur) => (cur.steps > max.steps ? cur : max),
    hourlyData[0]
  );

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.card, { borderColor: theme.border }]}
      onLayout={onLayout}>
      <View style={styles.cardHeader}>
        <View>
          <ThemedText type="subtitle">Walking Breakdown</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {day.isToday
              ? "Today's hourly walking activity"
              : `Hourly walking on ${day.dayName}, ${day.dayNumber}`}
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

      <View style={styles.chartWrapper}>
        <Svg width={containerWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="walkingGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={theme.primary} stopOpacity={0.4} />
              <Stop offset="90%" stopColor={theme.primary} stopOpacity={0.02} />
            </LinearGradient>
          </Defs>

          {/* Reference guide lines */}
          <Line
            x1={20}
            y1={topPadding}
            x2={containerWidth - 20}
            y2={topPadding}
            stroke={theme.separator}
            strokeDasharray="2 3"
            strokeWidth={1}
          />
          <Line
            x1={20}
            y1={topPadding + usableHeight / 2}
            x2={containerWidth - 20}
            y2={topPadding + usableHeight / 2}
            stroke={theme.separator}
            strokeDasharray="2 3"
            strokeWidth={1}
          />
          <Line
            x1={20}
            y1={chartHeight - bottomPadding}
            x2={containerWidth - 20}
            y2={chartHeight - bottomPadding}
            stroke={theme.border}
            strokeWidth={1}
          />

          {/* Gradient area */}
          {areaPathD ? <Path d={areaPathD} fill="url(#walkingGradient)" /> : null}

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

          {/* Points & Labels */}
          {points.map((pt, i) => {
            const isPeak = pt.steps === peakHour.steps && pt.steps > 0;
            return (
              <G key={`pt-${i}`}>
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isPeak ? 4.5 : 3}
                  fill={isPeak ? theme.primary : theme.backgroundElement}
                  stroke={theme.primary}
                  strokeWidth={2}
                />
                <SvgText
                  x={pt.x}
                  y={chartHeight - 10}
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

      <View style={[styles.breakdownFooter, { borderTopColor: theme.separator }]}>
        <ThemedText type="small" themeColor="textSecondary">
          Most active period:{' '}
          <ThemedText type="smallBold" style={{ color: theme.primary }}>
            {peakHour.timeLabel} ({peakHour.steps.toLocaleString()} steps)
          </ThemedText>
        </ThemedText>
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
  breakdownFooter: {
    borderTopWidth: 1,
    paddingTop: Spacing.two,
    alignItems: 'center',
  },
});
