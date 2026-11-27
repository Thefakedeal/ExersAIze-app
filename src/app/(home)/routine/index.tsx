import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Header } from '@/components/header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChevronRightIcon, PlayIcon, PlusIcon } from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useRoutines } from '@/hooks/use-routines';
import { useTheme } from '@/hooks/use-theme';

export default function RoutineScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { customRoutines, defaultRoutines } = useRoutines();
  const [startingRoutineId, setStartingRoutineId] = useState<string | null>(null);

  // Reset the loading state when the user returns from the session screen.
  useFocusEffect(
    useCallback(() => {
      setStartingRoutineId(null);
    }, [])
  );

  const handleStartRoutine = (routineId: string) => {
    // Guard against repeated taps creating duplicate sessions.
    if (startingRoutineId) return;

    setStartingRoutineId(routineId);

    try {
      router.push(`/session/exercise-session?routineId=${routineId}`);
    } catch {
      setStartingRoutineId(null);
    }
  };

  return (
    <ThemedView style={[styles.container]}>
      <Header
        title="Routines"
        onBackPress={() => router.push("/")}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.startButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/routine/add-routine')}>
            <PlusIcon size={18} color={theme.textOnPrimary} />
          </TouchableOpacity>
        }
      />
      <View style={[styles.safeArea]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent
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
                const isStarting = startingRoutineId === routine.id;
                const startDisabled = startingRoutineId !== null;

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

                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          activeOpacity={isStarting ? 1 : 0.7}
                          onPress={() => handleStartRoutine(routine.id)}
                          disabled={startDisabled}
                          accessibilityRole="button"
                          accessibilityLabel={`Start ${routine.name}`}
                          accessibilityState={{ disabled: startDisabled, busy: isStarting }}
                          style={[
                            styles.startButton,
                            { backgroundColor: isStarting ? theme.primaryDisabled : theme.primary },
                          ]}>
                          {isStarting ? (
                            <ActivityIndicator size="small" color={theme.textOnPrimary} />
                          ) : (
                            <PlayIcon size={12} color={theme.textOnPrimary} />
                          )}
                          <ThemedText type="smallBold" style={{ color: theme.textOnPrimary, fontSize: 12 }}>
                            Start
                          </ThemedText>
                        </TouchableOpacity>
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

            {defaultRoutines.map((routine) => {
              const isStarting = startingRoutineId === routine.id;
              const startDisabled = startingRoutineId !== null;

              return (
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
                      activeOpacity={isStarting ? 1 : 0.7}
                      onPress={() => handleStartRoutine(routine.id)}
                      disabled={startDisabled}
                      accessibilityRole="button"
                      accessibilityLabel={`Start ${routine.name}`}
                      accessibilityState={{ disabled: startDisabled, busy: isStarting }}
                      style={[
                        styles.startButton,
                        { backgroundColor: isStarting ? theme.primaryDisabled : theme.primary },
                      ]}>
                      {isStarting ? (
                        <ActivityIndicator size="small" color={theme.textOnPrimary} />
                      ) : (
                        <PlayIcon size={12} color={theme.textOnPrimary} />
                      )}
                      <ThemedText type="smallBold" style={{ color: theme.textOnPrimary, fontSize: 12 }}>
                        Start
                      </ThemedText>
                    </TouchableOpacity>
                    <ChevronRightIcon size={20} color={theme.textSecondary} />
                  </View>
                </ThemedView>
              </TouchableOpacity>
              );
            })}
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',


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
