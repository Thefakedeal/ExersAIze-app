import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';
import { ChevronLeftIcon } from './ui/icons';

type Props = {
    onBackPress: () => void,
    title: string,
    rightAction?: React.ReactNode,
}

export function Header({onBackPress, title, rightAction}: Props) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
  return (
    <View
        style={[
          styles.headerContainer,
          {
            paddingTop: Math.max(insets.top, Spacing.two),
            borderBottomColor: theme.separator,
          },
        ]}>
        <TouchableOpacity
          onPress={() => onBackPress()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <ChevronLeftIcon size={24} color={theme.text} />
        </TouchableOpacity>

        <ThemedText type="smallBold" style={styles.headerTitle}>
          {title}
        </ThemedText>

        {rightAction ? (
          <View style={styles.headerRightAction}>{rightAction}</View>
        ) : (
          <View style={styles.headerRightPlaceholder} />
        )}
      </View>
  )
}

const styles = StyleSheet.create({
 headerContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between',
     paddingHorizontal: Spacing.four,
     paddingBottom: Spacing.three,
     borderBottomWidth: StyleSheet.hairlineWidth,
   },
  backButton: {
    padding: Spacing.one,
    marginLeft: -Spacing.one,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, textAlign: 'center', flex: 1, paddingHorizontal: Spacing.two },
  headerRightPlaceholder: { width: 32 },
  headerRightAction: { minWidth: 32, alignItems: 'flex-end', justifyContent: 'center' },
})