import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface WeekNavigatorProps {
  weekOffset?: number;
  weekRangeLabel?: string;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}

export function WeekNavigator({
  weekOffset = 0,
  weekRangeLabel = 'This Week',
  onPrevWeek,
  onNextWeek,
}: WeekNavigatorProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { borderColor: theme.border }]}>
      <TouchableOpacity
        onPress={onPrevWeek}
        style={[styles.arrowButton, { backgroundColor: theme.backgroundSecondary }]}
        activeOpacity={0.7}
        accessibilityLabel="Previous week">
        <ChevronLeftIcon size={18} color={theme.text} />
      </TouchableOpacity>

      <View style={styles.labelContainer}>
        <ThemedText type="default" style={{ textAlign: 'center', fontWeight: '600' }}>
          {weekRangeLabel}
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
        onPress={onNextWeek}
        disabled={weekOffset >= 0}
        style={[
          styles.arrowButton,
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
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  currentWeekBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
});
