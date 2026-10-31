import { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { ChevronRightIcon } from '@/components/ui/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTodaySteps } from '@/hooks/use-today-steps';
import { StepDetailsScreen } from '@/screens/step-details-screen';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface StepTrackerProps {
  currentSteps?: number;
  goalSteps?: number;
}

export function StepTracker({
  currentSteps: initialSteps,
  goalSteps = 10000,
}: StepTrackerProps = {}) {
  const theme = useTheme();
  const actualColors = theme;
  const { steps } = useTodaySteps();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Use hook steps if available, fallback to initialSteps if provided
  const currentSteps = steps || initialSteps || 0;


  const clamped = Math.min(Math.max(currentSteps, 0), goalSteps || 1);
  const progress = (clamped / (goalSteps || 1)) * 100;

 
  const formatNumber = (n: number) => n.toLocaleString();

  return (
    <>
      <ThemedView
        type="backgroundElement"
        style={[styles.container, { borderColor: actualColors.border }]}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Steps</ThemedText>

          {/* Small button / link to open the weekly step details stack page */}
          <TouchableOpacity
            onPress={() => setIsDetailsOpen(true)}
            style={[
              styles.historyLink,
              { backgroundColor: actualColors.backgroundSelected },
            ]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="View weekly steps and breakdown">
            <ThemedText
              type="smallBold"
              style={{ color: actualColors.primary, fontSize: 13 }}>
              Weekly
            </ThemedText>
            <ChevronRightIcon size={14} color={actualColors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
          
          <Arch progress={progress} />
          <View style={styles.centerContent}>
            <ThemedText type="title" style={styles.stepsText}>
              {formatNumber(currentSteps)}
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: actualColors.textSecondary, marginTop: Spacing.one }}>
              / {formatNumber(goalSteps)} steps
            </ThemedText>
          </View>
        </View>

        <ThemedText type="small" style={{ color: actualColors.textSecondary }}>
            {/* Show Progress */}
            {progress.toFixed(1)}% of goal
        </ThemedText>
      </ThemedView>

      {/* Opens the new page that's like a stack */}
      <Modal
        visible={isDetailsOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsDetailsOpen(false)}>
        <StepDetailsScreen
          onBack={() => setIsDetailsOpen(false)}
          goalSteps={goalSteps}
        />
      </Modal>
    </>
  );
}


type ArchProps = {
  progress: number; 
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

export default function Arch({progress=0}: ArchProps) {
  const theme = useTheme();
  const actualColors = theme;
  const size = 220;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;


  const startAngle = -120;
  const endAngle = startAngle + (progress * 240) / 100;

  const trackPath = describeArc(center, center, radius, startAngle, -120 + 240);
  const progressPath = describeArc(center, center, radius, startAngle, endAngle);

  return (
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
  )
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
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
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
});
