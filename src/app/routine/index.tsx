import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChevronRightIcon, PlayIcon, PlusIcon } from '@/components/ui/icons';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useRoutines } from '@/hooks/use-routines';
import { useTheme } from '@/hooks/use-theme';

export default function RoutineScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { customRoutines, defaultRoutines } = useRoutines();

  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ThemedView style={[styles.container, contentPlatformStyle]}>
      <View style={[styles.safeArea]}>
        <ScreenHeader
          title="Routines"
          action={{
            label: 'Add Routine',
            icon: <PlusIcon size={18} color={theme.textOnPrimary} />,
            onPress: () => router.push('/routine/add-routine'),
          }}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.four },
          ]}>
          {/* Custom / Saved Routines Section if any exist */}
          {customRoutines.length > 0 && (
            <View style={styles.sectionGroup}>
              <View style={styles.sectionTitleRow}>
                <ThemedText type="smallBold" themeColor="primary">
                  Saved Routines
                </ThemedText>
                <ThemedText type="code" themeColor="textSecondary">
                  {customRoutines.length}
                </ThemedText>
              </View>

              {customRoutines.map((routine) => {
                const count = routine.exercises?.length ?? routine.exerciseCount ?? 0;
                return (
                  <TouchableOpacity
                    key={routine.id}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/routine/edit-routine?id=${routine.id}`)}
                    style={styles.routineTouchable}>
                    <ThemedView
                      type="backgroundElement"
                      style={[styles.routineCard, { borderColor: theme.border }]}>
                      <View style={styles.routineInfo}>
                        <View style={styles.nameRow}>
                          <ThemedText type="default" style={styles.routineName}>
                            {routine.name}
                          </ThemedText>
                         
                        </View>
                        {routine.description ? (
                          <ThemedText
                            type="small"
                            themeColor="textSecondary"
                            style={styles.routineDescription}>
                            {routine.description}
                          </ThemedText>
                        ) : null}
                        <View style={styles.badgeRow}>
                          <View
                            style={[
                              styles.countBadge,
                              { backgroundColor: theme.backgroundSecondary },
                            ]}>
                          <ThemedText type="code" themeColor="primary">
                              {`${count} ${count === 1 ? 'exercise' : 'exercises'}`}
                          </ThemedText>
                          </View>
                        </View>
                      </View>

                      <View style={styles.arrowContainer}>
                        <ChevronRightIcon size={20} color={theme.textSecondary} />
                      </View>
                    </ThemedView>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Routine Library Section */}
          <View style={styles.sectionGroup}>
            {customRoutines.length > 0 && (
              <View style={styles.sectionTitleRow}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  Routine Library
                </ThemedText>
                <ThemedText type="code" themeColor="textSecondary">
                  {defaultRoutines.length}
                </ThemedText>
              </View>
            )}

            {defaultRoutines.map((routine) => (
              <TouchableOpacity
                key={routine.id}
                activeOpacity={0.7}
                onPress={() => router.push(`/routine/view-routine?id=${routine.id}`)}
                style={styles.routineTouchable}>
                <ThemedView
                  type="backgroundElement"
                  style={[styles.routineCard, { borderColor: theme.border }]}>
                  <View style={styles.routineInfo}>
                    <ThemedText type="default" style={styles.routineName}>
                      {routine.name}
                    </ThemedText>
                    {routine.description ? (
                      <ThemedText
                        type="small"
                        themeColor="textSecondary"
                        style={styles.routineDescription}>
                        {routine.description}
                      </ThemedText>
                    ) : null}
                      <View style={styles.badgeRow}>
                        <View
                          style={[
                            styles.countBadge,
                            { backgroundColor: theme.backgroundSelected },
                          ]}>
                          <ThemedText type="code" themeColor="primary">
                            {`${routine.exercises?.length || 0} exercises`}
                          </ThemedText>
                        </View>
                      </View>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => router.push(`/session/exercise-session?routineId=${routine.id}`)}
                      style={[styles.startButton, { backgroundColor: theme.primary }]}>
                      <PlayIcon size={12} color={theme.textOnPrimary} />
                      <ThemedText type="smallBold" style={{ color: theme.textOnPrimary, fontSize: 12 }}>
                        Start
                      </ThemedText>
                    </TouchableOpacity>
                    <ChevronRightIcon size={20} color={theme.textSecondary} />
                  </View>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Spacing.four,
  },
  scrollContent: {
    paddingTop: Spacing.two,
    gap: Spacing.four,
  },
  sectionGroup: {
    gap: Spacing.three,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.one,
  },
  routineTouchable: {
    borderRadius: Spacing.three,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  routineInfo: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  savedBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  routineName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  routineDescription: {
    marginTop: 4,
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: Spacing.two,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: Spacing.one,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
