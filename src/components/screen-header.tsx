import { ReactNode } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenHeaderAction = {
  label?: string;
  icon?: ReactNode;
  onPress: () => void;
};

type Props = {
  title: string;
  action?: ScreenHeaderAction;
  style?: StyleProp<ViewStyle>;
};

export function ScreenHeader({ title, action, style }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {action ? (
        <TouchableOpacity
          onPress={action.onPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={[styles.actionButton, { backgroundColor: theme.primary }]}>
          {action.icon}
          {action.label ? (
            <ThemedText
              type="smallBold"
              style={{ color: theme.textOnPrimary, marginLeft: action.icon ? 6 : 0 }}>
              {action.label}
            </ThemedText>
          ) : null}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  title: {
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
