import AppTabs from '@/components/app-tabs';
import { ThemeProvider } from '@/providers/theme-provider';
import { WeightUnitProvider } from '@/providers/weight-unit-provider';

export default function TabsLayout() {
  return (
    <ThemeProvider>
      <WeightUnitProvider>
        <AppTabs />
      </WeightUnitProvider>
    </ThemeProvider>
  );
}
