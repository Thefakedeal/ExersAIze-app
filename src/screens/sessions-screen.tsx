import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SafeArea } from '@/components/safe-area';
import { ScreenHeader } from '@/components/screen-header';
import { SessionCard } from '@/components/session/session-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PlusIcon } from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWorkoutSessions } from '@/hooks/use-workout-sessions';

export function SessionsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { sessions } = useWorkoutSessions();

  return (
    <ThemedView style={styles.container}>
      {/* <Header
        onBackPress={router.back}
        title="Workout Sessions"
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/session/exercise-session')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <PlusIcon size={22} color={theme.primary} />
          </TouchableOpacity>
        }
      /> */}
      <SafeArea>
        <ScreenHeader
          style={{ paddingBottom: Spacing.two, paddingHorizontal: Spacing.four }}
        title="Sessions"
          action={
            {
              onPress: () => router.push('/session/exercise-session'),
              icon: <PlusIcon size={22} color={theme.textOnPrimary} />,
              label: 'New Session',
            }
          }
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.innerContainer}>
            {sessions.length === 0 ? (
              <ThemedView
                type="backgroundElement"
                style={[styles.emptyCard, { borderColor: theme.border }]}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                  No workout sessions yet.{'\n'}Start a workout to log your first session.
                </ThemedText>
                <TouchableOpacity
                  onPress={() => router.push('/session/exercise-session')}
                  style={[styles.startBtn, { backgroundColor: theme.primary }]}>
                  <PlusIcon size={16} color={theme.textOnPrimary} />
                  <ThemedText type="smallBold" style={{ color: theme.textOnPrimary, marginLeft: 6 }}>
                    Start Workout
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            ) : (
              <View style={styles.list}>
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onPress={() =>
                      router.push(`/session/view-session?id=${session.id}`)
                    }
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeArea>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.three,
  },
  innerContainer: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  list: {
    gap: Spacing.three,
  },
});
