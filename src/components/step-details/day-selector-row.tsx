import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { format, isAfter, isSameDay } from 'date-fns';
import { useMemo } from 'react';

export interface DaySelectorRowProps {
  days: Date[];
  selectedIndex: number;
  onSelectDay: (index: number) => void;
}

export function DaySelectorRow({
  days,
  selectedIndex,
  onSelectDay,
}: DaySelectorRowProps) {
  const theme = useTheme();

  if (!days || days.length === 0) {
    return null;
  }

  const selectedDay = useMemo(() => {
    return days[selectedIndex];
  }, [days, selectedIndex]);

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.container, { borderColor: theme.border }]}>
      {/* Active Day Header */}
     

      {/* Tab / Button Selector Row */}
      <View
        style={styles.tabRow}
        accessibilityRole="tablist"
        accessibilityLabel="Select active day">
        {days.map((day, index) => {
          const isSelected = index === selectedIndex;
          const isDisabled = isAfter(day, new Date());

          return (
            <TouchableOpacity
              key={day.toISOString()}
              onPress={() => !isDisabled && onSelectDay(index)}
              disabled={isDisabled}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected, disabled: isDisabled }}
              accessibilityLabel={`Select ${format(day, 'EEEE, MMMM d')}`}
              style={[
                styles.tabButton,
                isSelected
                  ? [
                      styles.tabButtonActive,
                      {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]
                  : [
                      styles.tabButtonInactive,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        borderColor: 'transparent',
                      },
                    ],
                isDisabled && styles.tabButtonDisabled,
              ]}>
              <ThemedText
                type="small"
                style={[
                  styles.dayNameText,
                  {
                    color: isSelected
                      ? theme.textOnPrimary
                      : isDisabled
                        ? theme.textDisabled
                        : theme.textSecondary,
                  },
                ]}>
                {format(day, 'EEE')}
              </ThemedText>

              <ThemedText
                type="smallBold"
                style={[
                  styles.dayNumberText,
                  {
                    color: isSelected
                      ? theme.textOnPrimary
                      : isDisabled
                        ? theme.textDisabled
                        : theme.text,
                  },
                ]}>
                {format(day, 'd')}
              </ThemedText>

              <View style={styles.dotContainer}>
                {isSameDay(day, new Date()) && (
                  <View
                    style={[
                      styles.todayDot,
                      {
                        backgroundColor: isSelected
                          ? theme.textOnPrimary
                          : theme.primary,
                      },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.three,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  headerTitleGroup: {
    gap: Spacing.half,
  },
  activeDayTitle: {
    fontSize: 15,
  },
  todayBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: 2,
    borderRadius: Spacing.two,
    borderWidth: 1,
    minHeight: 58,
  },
  tabButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonInactive: {},
  tabButtonDisabled: {
    opacity: 0.35,
  },
  dayNameText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dayNumberText: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: 2,
  },
  dotContainer: {
    height: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
