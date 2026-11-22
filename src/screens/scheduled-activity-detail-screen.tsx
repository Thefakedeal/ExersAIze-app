import { format, isBefore, isSameDay, parseISO, startOfDay } from 'date-fns';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  DumbbellIcon,
  ListCheckIcon,
  NoteIcon,
  PlayIcon,
  CloseIcon,
} from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useRoutines } from '@/hooks/use-routines';
import { useScheduledActivityStatus } from '@/hooks/use-scheduled-activity-status';
import { useTheme } from '@/hooks/use-theme';
import { useWorkoutSessions } from '@/hooks/use-workout-sessions';
import { getCustomRoutineById } from '@/services/routine-storage';
import {
  getScheduledOccurrenceById,
  subscribeToScheduleUpdates,
} from '@/services/schedule-storage';
import { RoutineItem } from '@/types/routine';
import { ScheduledOccurrence } from '@/types/schedule';

interface ScheduledActivityDetailScreenProps {
  id: string;
}

export function ScheduledActivityDetailScreen({ id }: ScheduledActivityDetailScreenProps) {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { defaultRoutines, customRoutines } = useRoutines();
  const { sessions, loading: sessionsLoading } = useWorkoutSessions();

  const [occurrence, setOccurrence] = useState<ScheduledOccurrence | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [linkedRoutine, setLinkedRoutine] = useState<RoutineItem | null>(null);

  const allRoutines = useMemo(
    () => [...customRoutines, ...defaultRoutines],
    [customRoutines, defaultRoutines]
  );

  const linkedSession = useMemo(() => {
    if (!occurrence?.workoutSessionId) return null;
    return sessions.find((session) => session.id === occurrence.workoutSessionId) ?? null;
  }, [occurrence, sessions]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const data = await getScheduledOccurrenceById(id);
      if (!isMounted) return;

      setOccurrence(data);

      if (data?.routineId) {
        const fromStorage = await getCustomRoutineById(data.routineId);
        const routine =
          fromStorage ?? allRoutines.find((r) => r.id === data.routineId) ?? null;
        if (isMounted) setLinkedRoutine(routine);
      }

      if (isMounted) setLoading(false);
    };

    void load();

    const unsubscribe = subscribeToScheduleUpdates(() => {
      void getScheduledOccurrenceById(id).then((data) => {
        if (isMounted) setOccurrence(data);
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [id, allRoutines]);

  const scheduledDate = useMemo(() => {
    if (!occurrence) return null;
    return parseISO(occurrence.scheduledDate);
  }, [occurrence]);

  const isTodayOrPast = useMemo(() => {
    if (!scheduledDate) return false;
    const today = startOfDay(new Date());
    return isSameDay(startOfDay(scheduledDate), today) || isBefore(startOfDay(scheduledDate), today);
  }, [scheduledDate]);

  const dynamicStatus = useScheduledActivityStatus(occurrence);

  useFocusEffect(
    useCallback(() => {
      setIsStarting(false);
    }, [])
  );

  const handleViewRoutine = () => {
    if (!linkedRoutine) return;
    router.push(`/routine/view-routine?id=${linkedRoutine.id}`);
  };

  const handleStartRoutine = () => {
    if (!linkedRoutine || !occurrence || !isTodayOrPast || occurrence.workoutSessionId || isStarting) return;
    setIsStarting(true);
    router.push(
      `/session/exercise-session?routineId=${linkedRoutine.id}&scheduledOccurrenceId=${occurrence.id}`
    );
  };

  const handleContinueSession = () => {
    if (!linkedSession || !occurrence) return;
    router.push(`/session/exercise-session?sessionId=${linkedSession.id}&scheduledOccurrenceId=${occurrence.id}`);
  };

  const handleViewSession = () => {
    if (!linkedSession) return;
    router.push(`/session/view-session?id=${linkedSession.id}`);
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator color={theme.primary} />
      </ThemedView>
    );
  }

  if (!occurrence) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="default">Activity not found.</ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.primary }]}
          activeOpacity={0.8}>
          <ThemedText type="smallBold" style={{ color: theme.textOnPrimary }}>
            Go Back
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header onBackPress={router.back} title="Activity Details" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          {/* Title & status */}
          <ThemedView
            type="backgroundElement"
            style={[styles.summaryCard, { borderColor: theme.border }]}>
            <View style={styles.titleRow}>
              <ThemedText type="subtitle" style={styles.titleText}>
                {occurrence.title ?? 'Activity'}
              </ThemedText>
              <StatusBadge status={dynamicStatus} />
            </View>

            <View style={styles.infoRow}>
              <CalendarIcon size={16} color={theme.textSecondary} />
              <ThemedText type="code" themeColor="textSecondary">
                {scheduledDate ? format(scheduledDate, 'EEEE, MMMM d, yyyy') : occurrence.scheduledDate}
              </ThemedText>
            </View>

            {occurrence.startTime && (
              <View style={styles.infoRow}>
                <ClockIcon size={16} color={theme.textSecondary} />
                <ThemedText type="code" themeColor="textSecondary">
                  {format(
                    new Date(`${occurrence.scheduledDate}T${occurrence.startTime}`),
                    'h:mm a'
                  )}
                  {occurrence.endTime
                    ? ` - ${format(
                        new Date(`${occurrence.scheduledDate}T${occurrence.endTime}`),
                        'h:mm a'
                      )}`
                    : ''}
                </ThemedText>
              </View>
            )}

            {occurrence.recurrence && occurrence.recurrence !== 'none' && (
              <View style={styles.infoRow}>
                <ListCheckIcon size={16} color={theme.textSecondary} />
                <ThemedText type="code" themeColor="textSecondary">
                  Repeats {occurrence.recurrence}
                </ThemedText>
              </View>
            )}
          </ThemedView>

          {/* Linked routine */}
          {occurrence.routineId && (
            <View style={styles.section}>
              <ThemedText type="smallBold">Routine</ThemedText>
              {linkedRoutine ? (
                <>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleViewRoutine}
                    accessibilityRole="button"
                    accessibilityLabel="View routine">
                    <ThemedView
                      type="backgroundElement"
                      style={[styles.linkCard, { borderColor: theme.border }]}>
                      <View style={styles.linkIcon}>
                        <DumbbellIcon size={20} color={theme.primary} />
                      </View>
                      <View style={styles.linkContent}>
                        <ThemedText type="default" numberOfLines={1}>
                          {linkedRoutine.name}
                        </ThemedText>
                        <ThemedText type="code" themeColor="textSecondary">
                          {linkedRoutine.exerciseCount ?? linkedRoutine.exercises?.length ?? 0}{' '}
                          {(
                            linkedRoutine.exerciseCount ?? linkedRoutine.exercises?.length ?? 0
                          ) === 1
                            ? 'exercise'
                            : 'exercises'}
                        </ThemedText>
                      </View>
                      <ChevronRightIcon size={18} color={theme.textSecondary} />
                    </ThemedView>
                  </TouchableOpacity>

                  {isTodayOrPast &&
                    !sessionsLoading &&
                    (!occurrence.workoutSessionId || !linkedSession) && (
                    <TouchableOpacity
                      activeOpacity={isStarting ? 1 : 0.8}
                      onPress={handleStartRoutine}
                      accessibilityRole="button"
                      accessibilityLabel="Start routine"
                      accessibilityState={{ disabled: isStarting }}
                      style={[
                        styles.startRoutineButton,
                        {
                          backgroundColor: isStarting ? theme.primaryDisabled : theme.primary,
                        },
                      ]}
                      disabled={isStarting}>
                      {isStarting ? (
                        <ActivityIndicator size="small" color={theme.textOnPrimary} />
                      ) : (
                        <PlayIcon size={18} color={theme.textOnPrimary} />
                      )}
                      <ThemedText
                        type="smallBold"
                        style={{ color: theme.textOnPrimary, marginLeft: 8 }}>
                        Start Routine
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <ThemedView
                  type="backgroundElement"
                  style={[styles.linkCard, { borderColor: theme.border }]}>
                  <View style={styles.linkIcon}>
                    <CloseIcon size={20} color={theme.textSecondary} />
                  </View>
                  <View style={styles.linkContent}>
                    <ThemedText type="default" themeColor="textSecondary">
                      Routine unavailable
                    </ThemedText>
                    <ThemedText type="code" themeColor="textTertiary">
                      The linked routine could not be found.
                    </ThemedText>
                  </View>
                </ThemedView>
              )}
            </View>
          )}

          {/* Linked workout session */}
          {linkedSession && (
            <View style={styles.section}>
              <ThemedText type="smallBold">Workout Session</ThemedText>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={linkedSession.endTime ? handleViewSession : handleContinueSession}
                accessibilityRole="button"
                accessibilityLabel={
                  linkedSession.endTime ? 'View workout session' : 'Continue workout session'
                }>
                <ThemedView
                  type="backgroundElement"
                  style={[styles.linkCard, { borderColor: theme.border }]}>
                  <View style={styles.linkIcon}>
                    {linkedSession.endTime ? (
                      <CheckIcon size={20} color={theme.primary} />
                    ) : (
                      <PlayIcon size={20} color={theme.primary} />
                    )}
                  </View>
                  <View style={styles.linkContent}>
                    <ThemedText type="default" numberOfLines={1}>
                      {linkedSession.title}
                    </ThemedText>
                    <ThemedText type="code" themeColor="textSecondary">
                      {linkedSession.endTime
                        ? format(new Date(linkedSession.startTime), 'MMM d, yyyy')
                        : 'In progress'}
                    </ThemedText>
                  </View>
                  <ChevronRightIcon size={18} color={theme.textSecondary} />
                </ThemedView>
              </TouchableOpacity>
            </View>
          )}

          {/* Notes */}
          {occurrence.notes ? (
            <View style={styles.section}>
              <ThemedText type="smallBold">Notes</ThemedText>
              <ThemedView
                type="backgroundElement"
                style={[styles.notesCard, { borderColor: theme.border }]}>
                <View style={styles.notesHeader}>
                  <NoteIcon size={16} color={theme.textSecondary} />
                  <ThemedText type="small" themeColor="textSecondary">
                    Instructions
                  </ThemedText>
                </View>
                <ThemedText type="default" style={styles.notesText}>
                  {occurrence.notes}
                </ThemedText>
              </ThemedView>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function StatusBadge({ status }: { status: ReturnType<typeof useScheduledActivityStatus> }) {
  const theme = useTheme();

  const config = {
    scheduled: { backgroundColor: theme.backgroundSelected, color: theme.textSecondary, label: 'Scheduled' },
    completed: { backgroundColor: theme.backgroundSelected, color: theme.primary, label: 'Completed' },
    skipped: { backgroundColor: theme.errorLight, color: theme.error, label: 'Skipped' },
  };

  const { backgroundColor, color, label } = config[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor }]}>
      <ThemedText type="code" style={{ color }}>
        {label}
      </ThemedText>
    </View>
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
  summaryCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  titleText: {
    flex: 1,
    fontSize: 20,
    lineHeight: 28,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  linkCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  linkIcon: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkContent: {
    flex: 1,
    gap: 2,
  },
  notesCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  notesText: {
    lineHeight: 22,
  },
  backButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  startRoutineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: Spacing.two,
  },
});
