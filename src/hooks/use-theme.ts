/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemePreference } from '@/providers/theme-provider';

export function useTheme() {
  const { preference } = useThemePreference();
  const scheme = useColorScheme();
  const theme = preference ?? (scheme === 'dark' ? 'dark' : 'light');

  return Colors[theme];
}
