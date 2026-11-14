import AppTabs from '@/components/app-tabs';
import { ThemeProvider } from '@/providers/theme-provider';

export default function TabsLayout() {
  return (
    <ThemeProvider>
      <AppTabs />
    </ThemeProvider>
  );
}
