import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const theme = useTheme();

  return (
    <NativeTabs
      backgroundColor={theme.background}
      indicatorColor={theme.backgroundElement}
      labelStyle={{ selected: { color: theme.text } }}>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="session">
        <NativeTabs.Trigger.Label>Sessions</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="target" md="track_changes" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
