import AppTabs from '@/components/app-tabs';
import { DistanceUnitProvider } from '@/providers/distance-unit-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { WeightUnitProvider } from '@/providers/weight-unit-provider';

export default function TabsLayout() {
  return (
    <ThemeProvider>
      <WeightUnitProvider>
        <DistanceUnitProvider>
          <AppTabs />
        </DistanceUnitProvider>
      </WeightUnitProvider>
    </ThemeProvider>
  );
}
