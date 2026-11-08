import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChevronRightIcon, PlusIcon } from '@/components/ui/icons';
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
        <View style={styles.headerRow}>
          <ThemedText type="subtitle">Routines</ThemedText>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/routine/add-routine')}
            style={[styles.addRoutineButton, { backgroundColor: theme.primary }]}>
            <PlusIcon size={18} color={theme.textOnPrimary} />
            <ThemedText
              type="smallBold"
              style={{ color: theme.textOnPrimary, marginLeft: 6 }}>
              Add Routine
            </ThemedText>
          </TouchableOpacity>
        </View>

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
                          <View
                            style={[
                              styles.savedBadge,
                              { backgroundColor: theme.backgroundSelected },
                            ]}>
                            <ThemedText type="code" themeColor="primary">
                              Custom
                            </ThemedText>
                          </View>
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
                            <ThemedText type="code" themeColor="textSecondary">
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
                    {routine.exerciseCount ? (
                      <View style={styles.badgeRow}>
                        <View
                          style={[
                            styles.countBadge,
                            { backgroundColor: theme.backgroundSelected },
                          ]}>
                          <ThemedText type="code" themeColor="primary">
                            {`${routine.exerciseCount} exercises`}
                          </ThemedText>
                        </View>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.arrowContainer}>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  addRoutineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 20,
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
});
