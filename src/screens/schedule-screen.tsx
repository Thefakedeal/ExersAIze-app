import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CalendarIcon } from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ScheduleScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <Header onBackPress={router.back} title="Schedule" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}>
        <View style={styles.contentWrapper}>
          {/* Intro Card */}
          <ThemedView
            type="backgroundElement"
            style={[styles.introCard, { borderColor: theme.border }]}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.primaryLight },
              ]}>
              <CalendarIcon size={28} color={theme.primary} />
            </View>
            <ThemedText type="subtitle" style={styles.introTitle}>
              Schedule
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.introDescription}>
              Plan and manage your upcoming workouts in one place.
            </ThemedText>
          </ThemedView>

          {/* Upcoming Section */}
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Upcoming
            </ThemedText>
          </View>

          <ThemedView
            type="backgroundElement"
            style={[styles.emptyCard, { borderColor: theme.border }]}>
            <ThemedText type="default" style={styles.emptyTitle}>
              No upcoming workouts
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.emptyDescription}>
              Scheduled workouts will appear here once you add them.
            </ThemedText>
          </ThemedView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.three,
  },
  contentWrapper: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  introCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.two,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  introTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  introDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.one,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
