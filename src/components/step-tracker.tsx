import { Colors, Spacing } from '@/constants/theme';
import { StyleSheet, useColorScheme, View } from 'react-native';

import Svg, { Circle, Path } from 'react-native-svg';

import { useTodaySteps } from '@/hooks/use-today-steps';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface StepTrackerProps {
  currentSteps?: number;
  goalSteps?: number;
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  const d = [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ');

  return d;
}

export function StepTracker({ goalSteps = 10000 }: StepTrackerProps) {
  const scheme = useColorScheme();
  const actualColors = scheme === 'dark' ? Colors.dark : Colors.light;
  const { steps: currentSteps = 50 } = useTodaySteps();
  const size = 220;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const clamped = Math.min(Math.max(currentSteps, 0), goalSteps || 1);
  const progress = (clamped / (goalSteps || 1)) * 100;

  const startAngle = -120;
  const endAngle = startAngle + (progress * 240) / 100;

  const trackPath = describeArc(center, center, radius, startAngle, -120 + 240);
  const progressPath = describeArc(center, center, radius, startAngle, endAngle);

  const formatNumber = (n: number) => n.toLocaleString();

  return (
    <ThemedView type="backgroundElement" style={[styles.container, { borderColor: actualColors.border }]}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Steps</ThemedText>
        <ThemedText type="small" style={{ color: actualColors.textSecondary }}>
          Today
        </ThemedText>
      </View>

      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          <Path
            d={trackPath}
            stroke={actualColors.separator}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={progressPath}
            stroke={actualColors.primary}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={center} cy={center} r={radius - strokeWidth / 2 - 4} fill="transparent" />
        </Svg>

        <View style={styles.centerContent}>
          <ThemedText type="title" style={styles.stepsText}>
            {formatNumber(currentSteps)}
          </ThemedText>
          <ThemedText type="small" style={{ color: actualColors.textSecondary, marginTop: Spacing.one }}>
            / {formatNumber(goalSteps)} steps
          </ThemedText>
        </View>
      </View>

      <View style={styles.footer}>
        <ThemedText type="small" style={{ color: actualColors.textSecondary }}>
          Goal for the day
        </ThemedText>
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
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsText: {
    fontSize: 36,
    fontWeight: '700',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
});
