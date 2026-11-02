import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCalorie } from '@/hooks/use-calorie';
import { useDistance } from '@/hooks/use-distance';
import { useSteps } from '@/hooks/use-steps';
import { useTheme } from '@/hooks/use-theme';
import { compactFormat } from '@/services/number-formatter';
import { endOfWeek, startOfWeek } from 'date-fns';
import { useMemo } from 'react';
export interface WeekSummaryCardProps {
  weekOffset?: number;
}

export function WeekSummaryCard({
  weekOffset = 0,
}: WeekSummaryCardProps) {
  const theme = useTheme();
 
  const [sunday,saturday] = useMemo(() => {
    const sunday = startOfWeek(new Date(), { weekStartsOn: 0 });
    const saturday = endOfWeek(new Date(), { weekStartsOn: 0});
    sunday.setDate(sunday.getDate() + weekOffset * 7);
    saturday.setDate(saturday.getDate() + weekOffset * 7);
    return [sunday,saturday];
  },[weekOffset])

  

  const {loading,steps,isAvailable,error,granted} = useSteps({
    dateStart: sunday,
    dateEnd: saturday,
  });
 
  const {loading:loadingDistance,distance} = useDistance({
    dateStart: sunday,
    dateEnd: saturday,
  })

  const {loading:loadingCalories,calories} = useCalorie({
    dateStart: sunday,
    dateEnd: saturday,
  })
  

  if(loading || loadingDistance  || loadingCalories ) {
    return (
      <ThemedView
      type="backgroundElement"
      style={[styles.card, { borderColor: theme.border }]}>
        <ActivityIndicator size="small" color={theme.primary} />
      </ThemedView>
    )
  }
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.card, { borderColor: theme.border }]}>
      <ThemedText type="subtitle">Week Summary</ThemedText>
      <View style={styles.row}>
        <View style={styles.col}>
          <ThemedText type="small" themeColor="textSecondary">
            Total Steps
          </ThemedText>
          <ThemedText type="default" style={{ fontWeight: '600' }}>
            {compactFormat(steps)}
          </ThemedText>
        </View>


        <View style={styles.col}>
          <ThemedText type="small" themeColor="textSecondary">
            Total Burned
          </ThemedText>
          <ThemedText type="default" style={{ fontWeight: '600' }}>
            {compactFormat(calories)} kcal
          </ThemedText>
        </View>

        <View style={styles.col}>
          <ThemedText type="small" themeColor="textSecondary">
            Distance
          </ThemedText>
          <ThemedText type="default" style={{ fontWeight: '600' }}>
            {compactFormat(distance)}m
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  col: {
    alignItems: 'center',
    gap: 2,
  },
});
