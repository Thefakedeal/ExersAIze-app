import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';

import { Header } from '@/components/header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CheckIcon, ClockIcon, EditIcon, NoteIcon, TrashIcon } from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { deleteWorkoutSession, getWorkoutSessionById, subscribeToSessionUpdates } from '@/services/session-storage';
import { WorkoutSession } from '@/types/session';
import { getMetricVisibility } from '@/utils/session-metrics';

interface ViewSessionScreenProps {
  id: string;
}

export function ViewSessionScreen({ id }: ViewSessionScreenProps) {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSession = () => {
      void getWorkoutSessionById(id).then((data) => {
        if (isMounted) {
          setSession(data);
          setLoading(false);
        }
      });
    };

    loadSession();
    const unsubscribe = subscribeToSessionUpdates(loadSession);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator color={theme.primary} />
      </ThemedView>
    );
  }

  if (!session) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="default">Session not found.</ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.primary }]}>
          <ThemedText type="smallBold" style={{ color: theme.textOnPrimary }}>
            Go Back
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete "${session.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkoutSession(session.id);
              router.back();
            } catch {
              Alert.alert('Error', 'Failed to delete session.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/session/exercise-session?sessionId=${session.id}`);
  };

  const totalExercises = session.exercises?.length ?? 0;
  const totalSets =
    session.exercises?.reduce((acc, ex) => acc + (ex.sets?.length ?? 0), 0) ?? 0;
  const completedSets =
    session.exercises?.reduce(
      (acc, ex) => acc + (ex.sets?.filter((s) => s.completed).length ?? 0),
      0
    ) ?? 0;

  // Duration
  let durationText = 'In Progress';
  if (session.startTime && session.endTime) {
    const diffMinutes = Math.max(
      1,
      Math.round((session.endTime - session.startTime) / 60000)
    );
    if (diffMinutes < 60) {
      durationText = `${diffMinutes} min`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      durationText = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Header
        onBackPress={router.back}
        title="Session Details"
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleEdit}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.headerActionBtn}>
              <EditIcon size={18} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.headerActionBtn}>
              <TrashIcon size={18} color={theme.error} />
            </TouchableOpacity>
          </View>
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
          {/* Header Card */}
          <ThemedView
            type="backgroundElement"
            style={[styles.summaryCard, { borderColor: theme.border }]}>
            <ThemedText type="subtitle" style={styles.titleText}>
              {session.title}
            </ThemedText>

            {session.description ? (
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.descriptionText}>
                {session.description}
              </ThemedText>
            ) : null}

            {/* Date & Time info */}
            <View style={styles.timeInfoRow}>
              <ClockIcon size={15} color={theme.primary} />
              <ThemedText type="code" themeColor="textSecondary">
                {session.startTime
                  ? format(new Date(session.startTime), 'EEEE, MMMM d, yyyy')
                  : ''}
              </ThemedText>
            </View>

            <View style={styles.timeInfoRow}>
              <ThemedText type="code" themeColor="textSecondary">
                {session.startTime
                  ? format(new Date(session.startTime), 'h:mm a')
                  : ''}{' '}
                -{' '}
                {session.endTime
                  ? format(new Date(session.endTime), 'h:mm a')
                  : 'Active'}
              </ThemedText>
              <View
                style={[
                  styles.durationBadge,
                  { backgroundColor: theme.backgroundSecondary },
                ]}>
                <ThemedText type="code" themeColor="primary">
                  {durationText}
                </ThemedText>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statBox,
                  { backgroundColor: theme.backgroundSecondary },
                ]}>
                <ThemedText type="title" themeColor="primary" style={styles.statNumber}>
                  {totalExercises}
                </ThemedText>
                <ThemedText type="code" themeColor="textSecondary">
                  Exercises
                </ThemedText>
              </View>

              <View
                style={[
                  styles.statBox,
                  { backgroundColor: theme.backgroundSecondary },
                ]}>
                <ThemedText type="title" themeColor="primary" style={styles.statNumber}>
                  {totalSets}
                </ThemedText>
                <ThemedText type="code" themeColor="textSecondary">
                  Total Sets
                </ThemedText>
              </View>

              <View
                style={[
                  styles.statBox,
                  { backgroundColor: theme.backgroundSecondary },
                ]}>
                <ThemedText type="title" themeColor="primary" style={styles.statNumber}>
                  {completedSets}
                </ThemedText>
                <ThemedText type="code" themeColor="textSecondary">
                  Completed
                </ThemedText>
              </View>
            </View>
          </ThemedView>

          {/* Exercises Breakdown */}
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold">Exercises & Sets</ThemedText>
            <ThemedText type="code" themeColor="textSecondary">
              {totalExercises} {totalExercises === 1 ? 'exercise' : 'exercises'}
            </ThemedText>
          </View>

          <View style={styles.exercisesList}>
            {session.exercises?.map((ex, eIdx) => {
              const { hasTime, hasDistance, showWeight } = getMetricVisibility(
                ex.trackMetrics,
                ex.type
              );

              return (
                <ThemedView
                  key={ex.id}
                  type="backgroundElement"
                  style={[styles.exerciseCard, { borderColor: theme.border }]}>
                  {/* Exercise Title */}
                  <View style={styles.exerciseCardHeader}>
                    <View
                      style={[
                        styles.indexBadge,
                        { backgroundColor: theme.backgroundSelected },
                      ]}>
                      <ThemedText type="smallBold" themeColor="primary">
                        {eIdx + 1}
                      </ThemedText>
                    </View>
                    <View style={styles.exerciseTitleCol}>
                      <ThemedText type="smallBold" style={styles.exerciseName}>
                        {ex.name}
                      </ThemedText>
                      <ThemedText type="code" themeColor="textSecondary">
                        {ex.type ?? 'Strength'}
                        {ex.categories && ex.categories.length > 0
                          ? ` • ${ex.categories[0]}`
                          : ''}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Sets Table */}
                  <View style={styles.setsTable}>
                    {ex.sets?.map((set, sIdx) => (
                      <View
                        key={set.id}
                        style={[styles.setRow, { borderBottomColor: theme.border }]}>
                        <View style={styles.setMainInfo}>
                          <View
                            style={[
                              styles.setNumBadge,
                              {
                                backgroundColor: set.completed
                                  ? theme.backgroundSelected
                                  : theme.backgroundSecondary,
                              },
                            ]}>
                            <ThemedText
                              type="code"
                              themeColor={set.completed ? 'primary' : 'textSecondary'}>
                              {sIdx + 1}
                            </ThemedText>
                          </View>

                          <View style={styles.metricsSummary}>
                            {showWeight && set.weight !== undefined ? (
                              <ThemedText type="smallBold">
                                {set.weight} <ThemedText type="code" themeColor="textSecondary">kg</ThemedText>
                              </ThemedText>
                            ) : null}

                            {set.reps !== undefined ? (
                              <ThemedText type="smallBold">
                                {set.reps} <ThemedText type="code" themeColor="textSecondary">reps</ThemedText>
                              </ThemedText>
                            ) : null}

                            {hasTime && set.timeInSeconds !== undefined ? (
                              <ThemedText type="smallBold">
                                {set.timeInSeconds} <ThemedText type="code" themeColor="textSecondary">s</ThemedText>
                              </ThemedText>
                            ) : null}

                            {hasDistance && set.distance !== undefined ? (
                              <ThemedText type="smallBold">
                                {set.distance} <ThemedText type="code" themeColor="textSecondary">km</ThemedText>
                              </ThemedText>
                            ) : null}
                          </View>

                          {set.completed && (
                            <View
                              style={[
                                styles.doneBadge,
                                { backgroundColor: theme.primary },
                              ]}>
                              <CheckIcon size={12} color={theme.textOnPrimary} />
                            </View>
                          )}
                        </View>

                        {/* Note */}
                        {set.note ? (
                          <View style={styles.noteBox}>
                            <NoteIcon size={12} color={theme.textSecondary} />
                            <ThemedText
                              type="code"
                              themeColor="textSecondary"
                              style={styles.noteText}>
                              {set.note}
                            </ThemedText>
                          </View>
                        ) : null}
                      </View>
                    ))}
                  </View>
                </ThemedView>
              );
            })}
          </View>

          {/* Edit Workout Button */}
          <TouchableOpacity
            onPress={handleEdit}
            style={[styles.editButton, { backgroundColor: theme.primary }]}>
            <EditIcon size={18} color={theme.textOnPrimary} />
            <ThemedText
              type="smallBold"
              style={{ color: theme.textOnPrimary, marginLeft: 8 }}>
              Edit Workout Session
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
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
    gap: Spacing.four,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerActionBtn: {
    padding: 4,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
  },
  descriptionText: {
    lineHeight: 20,
  },
  timeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  durationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  statBox: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exercisesList: {
    gap: Spacing.three,
  },
  exerciseCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  indexBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseTitleCol: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
  },
  setsTable: {
    gap: 6,
    paddingTop: 4,
  },
  setRow: {
    gap: 4,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  setMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  setNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsSummary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  doneBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 30,
  },
  noteText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: Spacing.two,
  },
  backBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
});
