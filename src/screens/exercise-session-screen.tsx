import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/header';
import { SessionExerciseCard } from '@/components/session/session-exercise-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ClockIcon, PlusIcon } from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useExercises } from '@/hooks/use-exercises';
import { useRoutines } from '@/hooks/use-routines';
import { useTheme } from '@/hooks/use-theme';
import { SelectExerciseScreen } from '@/screens/select-exercise-screen';
import {
  getWorkoutSessionById,
  saveWorkoutSession,
  updateWorkoutSession,
} from '@/services/session-storage';
import { ExerciseItem } from '@/types/exercise';
import { SessionExercise, SessionSet } from '@/types/session';

interface ExerciseSessionScreenProps {
  routineId?: string;
  sessionId?: string;
}

function hasExerciseDetails(exercise: SessionExercise) {
  return exercise.sets.some(
    (set) =>
      set.weight !== undefined ||
      set.reps !== undefined ||
      set.timeInSeconds !== undefined ||
      set.distance !== undefined
  );
}

export function ExerciseSessionScreen({
  routineId,
  sessionId,
}: ExerciseSessionScreenProps) {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { defaultRoutines, customRoutines, loading: routinesLoading } = useRoutines();
  const { defaultExercises, customExercises } = useExercises();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [now, setNow] = useState<number>(startTime);
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // The persisted session ID — set once on first save, then used for all updates
  const activeSessionId = useRef<string | null>(sessionId ?? null);

  // Exercise Selector modal
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // Time picker
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);
  const [pickerValue, setPickerValue] = useState<number>(startTime);

  // Initialize from existing session or routine, then auto-save
  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (sessionId) {
        const existing = await getWorkoutSessionById(sessionId);
        if (existing && isMounted) {
          setTitle(existing.title);
          setDescription(existing.description ?? '');
          setStartTime(existing.startTime ?? existing.createdAt);
          setEndTime(existing.endTime ?? null);
          setExercises(existing.exercises ?? []);
          activeSessionId.current = sessionId;
          setIsInitialized(true);
          return;
        }
      }

      if (routineId && routinesLoading) return;

      let resolvedTitle = '';
      let resolvedDescription = '';
      let resolvedStartTime = Date.now();
      let resolvedExercises: SessionExercise[] = [];

      if (routineId) {
        const routine =
          customRoutines.find((r) => r.id === routineId) ??
          defaultRoutines.find((r) => r.id === routineId);

        if (routine && isMounted) {
          resolvedTitle = routine.name;
          resolvedDescription = routine.description ?? '';

          const allLibExercises = [...customExercises, ...defaultExercises];
          resolvedExercises = (routine.exercises ?? []).map((rEx, idx) => {
            const matched = allLibExercises.find(
              (libEx) => libEx.id === rEx.exerciseId || libEx.name === rEx.name
            );
            const setCount = Math.max(1, rEx.sets || 3);
            const repNumber = rEx.repRange
              ? parseInt(rEx.repRange.split('-')[0], 10) || undefined
              : undefined;

            const sets: SessionSet[] = Array.from({ length: setCount }).map(
              (_, sIdx) => ({
                id: `set_${Date.now()}_${idx}_${sIdx}`,
                setNumber: sIdx + 1,
                reps: repNumber,
                completed: false,
                note: '',
              })
            );

            return {
              id: `sex_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
              exerciseId: rEx.exerciseId,
              name: rEx.name,
              type: rEx.type ?? matched?.type ?? 'Strength',
              categories: rEx.categories ?? matched?.categories ?? [],
              trackMetrics: matched?.trackMetrics ?? ['Reps'],
              sets,
            };
          });
        }
      }

      if (!isMounted) return;

      if (!resolvedTitle) {
        resolvedTitle = `${format(new Date(resolvedStartTime), 'MMMM d, yyyy')} Workout`;
      }

      // Auto-create the session immediately on start
      try {
        const created = await saveWorkoutSession({
          title: resolvedTitle,
          description: resolvedDescription || undefined,
          routineId,
          startTime: resolvedStartTime,
          endTime: null,
          exercises: resolvedExercises,
        });
        if (isMounted) {
          activeSessionId.current = created.id;
          setTitle(resolvedTitle);
          setDescription(resolvedDescription);
          setStartTime(resolvedStartTime);
          setExercises(resolvedExercises);
          setIsInitialized(true);
        }
      } catch {
        if (isMounted) {
          setTitle(resolvedTitle);
          setDescription(resolvedDescription);
          setStartTime(resolvedStartTime);
          setExercises(resolvedExercises);
          setIsInitialized(true);
        }
      }
    }

    void init();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, routineId, routinesLoading]);

  // Keep the ongoing duration updating while the workout has no end time
  useEffect(() => {
    if (endTime) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  // Auto-persist changes: immediately once finished, debounced while ongoing
  useEffect(() => {
    if (!isInitialized || !activeSessionId.current) return;

    const persist = () =>
      void updateWorkoutSession(activeSessionId.current!, {
        title: title.trim() || 'Workout Session',
        description: description.trim() || undefined,
        startTime,
        endTime,
        exercises,
      }).catch(() => {/* silent */});

    if (endTime) {
      persist();
      return;
    }

    const timer = setTimeout(persist, 800);
    return () => clearTimeout(timer);
  }, [exercises, title, description, startTime, endTime, isInitialized]);

  // Exercise operations
  const handleOpenAddExercise = () => {
    setReplacingIndex(null);
    setSelectorVisible(true);
  };

  const handleOpenReplaceExercise = (index: number) => {
    setReplacingIndex(index);
    setSelectorVisible(true);
  };

  const handleExerciseSelected = (selectedEx: ExerciseItem) => {
    if (replacingIndex !== null && replacingIndex >= 0 && replacingIndex < exercises.length) {
      setExercises((prev) =>
        prev.map((item, idx) =>
          idx === replacingIndex
            ? {
                ...item,
                exerciseId: selectedEx.id,
                name: selectedEx.name,
                type: selectedEx.type,
                categories: selectedEx.categories,
                trackMetrics: selectedEx.trackMetrics,
              }
            : item
        )
      );
    } else {
      const newExercise: SessionExercise = {
        id: `sex_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        exerciseId: selectedEx.id,
        name: selectedEx.name,
        type: selectedEx.type,
        categories: selectedEx.categories,
        trackMetrics: selectedEx.trackMetrics ?? ['Reps'],
        sets: [
          {
            id: `set_${Date.now()}_1`,
            setNumber: 1,
            completed: false,
            note: '',
          },
        ],
      };
      setExercises((prev) => [...prev, newExercise]);
    }
    setSelectorVisible(false);
    setReplacingIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setExercises((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= exercises.length - 1) return;
    setExercises((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleRemoveExercise = (index: number) => {
    Alert.alert(
      'Remove Exercise',
      `Remove "${exercises[index].name}" from this workout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setExercises((prev) => prev.filter((_, idx) => idx !== index));
          },
        },
      ]
    );
  };

  const handleUpdateExercise = (index: number, updated: SessionExercise) => {
    setExercises((prev) => prev.map((ex, idx) => (idx === index ? updated : ex)));
  };

  // Persist current state to storage
  const persistUpdate = useCallback(
    async (overrides?: { endTime?: number | null; exercises?: SessionExercise[] }) => {
      const id = activeSessionId.current;
      if (!id) return;
      try {
        await updateWorkoutSession(id, {
          title: title.trim() || 'Workout Session',
          description: description.trim() || undefined,
          startTime,
          endTime: overrides?.endTime !== undefined ? overrides.endTime : endTime,
          exercises: overrides?.exercises ?? exercises,
        });
      } catch {
        // silent — best effort
      }
    },
    [title, description, startTime, endTime, exercises]
  );

  // Time handling
  const finishWorkout = async () => {
    const finishedAt = Date.now();
    setEndTime(finishedAt);
    setNow(finishedAt);
    await persistUpdate({ endTime: finishedAt });
  };

  const handleFinishWorkout = () => {
    if (exercises.length === 0) {
      Alert.alert(
        'No Exercises',
        'This workout has no exercises. Do you want to finish it anyway?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Finish Anyway', onPress: () => void finishWorkout() },
        ]
      );
      return;
    }

    const incomplete = exercises.filter((exercise) => !hasExerciseDetails(exercise));
    if (incomplete.length > 0) {
      const message =
        incomplete.length === 1
          ? `"${incomplete[0].name}" has no details filled in. Do you want to finish the workout anyway?`
          : `${incomplete.length} exercises have no details filled in. Do you want to finish the workout anyway?`;

      Alert.alert('Incomplete Exercises', message, [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Finish Anyway', onPress: () => void finishWorkout() },
      ]);
      return;
    }

    void finishWorkout();
  };

  const handleResetStartTime = () => {
    setStartTime(Date.now());
  };

  const handleOpenTimePicker = (target: 'start' | 'end') => {
    setPickerTarget(target);
    setPickerValue(target === 'start' ? startTime : endTime ?? Date.now());
  };

  const handleCloseTimePicker = () => {
    setPickerTarget(null);
  };

  const handleTimeSelected = (date: Date) => {
    const value = date.getTime();
    setPickerValue(value);

    if (pickerTarget === 'start') {
      setStartTime(value);
    } else if (pickerTarget === 'end') {
      setEndTime(value);
      setNow(value);
    }

    if (Platform.OS !== 'ios') {
      setPickerTarget(null);
    }
  };

  const elapsedMs = Math.max(0, (endTime ?? now) - startTime);
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const durationText = endTime
    ? `${Math.max(1, Math.round(elapsedMs / 60000))} min`
    : `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s (ongoing)`;

  return (
    <ThemedView style={styles.container}>
      <Header
        onBackPress={router.back}
        title={sessionId ? 'Edit Session' : 'Log Workout'}
        rightAction={
          <TouchableOpacity
            onPress={handleFinishWorkout}
            disabled={!!endTime}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ThemedText
              type="smallBold"
              themeColor={endTime ? 'textDisabled' : 'primary'}>
              Finish Workout
            </ThemedText>
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.innerContainer}>
            {/* Title & Description Section */}
            <View style={styles.section}>
              <ThemedText type="smallBold">Workout Title</ThemedText>
              <ThemedView
                type="backgroundElement"
                style={[styles.inputCard, { borderColor: theme.border }]}>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Upper Body Strength, Leg Day"
                  placeholderTextColor={theme.textDisabled}
                  style={[styles.titleInput, { color: theme.text }]}
                />
              </ThemedView>
            </View>

            <View style={styles.section}>
              <ThemedText type="smallBold">Description (Optional)</ThemedText>
              <ThemedView
                type="backgroundElement"
                style={[styles.inputCard, { borderColor: theme.border }]}>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="e.g. Focus on chest hypertrophy, good energy today"
                  placeholderTextColor={theme.textDisabled}
                  multiline
                  style={[styles.descriptionInput, { color: theme.text }]}
                />
              </ThemedView>
            </View>

            {/* Time Tracking Section */}
            <View style={styles.section}>
              <ThemedText type="smallBold">Workout Time & Duration</ThemedText>
              <ThemedView
                type="backgroundElement"
                style={[styles.timeCard, { borderColor: theme.border }]}>
                <View style={styles.timeFieldsRow}>
                  <View style={styles.timeField}>
                    <Pressable
                      onPress={() => handleOpenTimePicker('start')}
                      disabled={Platform.OS === 'web'}
                      style={styles.timeFieldPressable}>
                      <View style={styles.timeFieldHeader}>
                        <ClockIcon size={16} color={theme.primary} />
                        <ThemedText type="code" themeColor="textSecondary">
                          Start Time
                        </ThemedText>
                      </View>
                      <ThemedText type="smallBold">
                        {format(new Date(startTime), 'h:mm a')}
                      </ThemedText>
                      <ThemedText type="code" themeColor="textSecondary">
                        {format(new Date(startTime), 'MMM d')}
                      </ThemedText>
                    </Pressable>
                    <TouchableOpacity onPress={handleResetStartTime}>
                      <ThemedText type="code" themeColor="primary">
                        Reset Now
                      </ThemedText>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timeField}>
                    <Pressable
                      onPress={() => handleOpenTimePicker('end')}
                      disabled={Platform.OS === 'web'}
                      style={styles.timeFieldPressable}>
                      <View style={styles.timeFieldHeader}>
                        <ClockIcon size={16} color={theme.primary} />
                        <ThemedText type="code" themeColor="textSecondary">
                          End Time
                        </ThemedText>
                      </View>
                      <ThemedText type="smallBold">
                        {endTime ? format(new Date(endTime), 'h:mm a') : 'Ongoing'}
                      </ThemedText>
                      <ThemedText type="code" themeColor="textSecondary">
                        {endTime ? format(new Date(endTime), 'MMM d') : 'Not set'}
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.durationRow}>
                  <View
                    style={[
                      styles.durationPill,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}>
                    <ThemedText type="code" themeColor="primary">
                      Duration: {durationText}
                    </ThemedText>
                  </View>
                </View>
              </ThemedView>
            </View>

            {/* Exercises Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <ThemedText type="smallBold">Exercises</ThemedText>
                  <ThemedText type="code" themeColor="textSecondary">
                    {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
                  </ThemedText>
                </View>

                <TouchableOpacity
                  onPress={handleOpenAddExercise}
                  style={[styles.addExerciseHeaderBtn, { backgroundColor: theme.primary }]}>
                  <PlusIcon size={14} color={theme.textOnPrimary} />
                  <ThemedText
                    type="smallBold"
                    style={{ color: theme.textOnPrimary, fontSize: 13, marginLeft: 4 }}>
                    Add Exercise
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {exercises.length === 0 ? (
                <ThemedView
                  type="backgroundElement"
                  style={[styles.emptyCard, { borderColor: theme.border }]}>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                    No exercises added yet.
                  </ThemedText>
                  <TouchableOpacity
                    onPress={handleOpenAddExercise}
                    style={[styles.addFirstBtn, { backgroundColor: theme.primary }]}>
                    <PlusIcon size={16} color={theme.textOnPrimary} />
                    <ThemedText
                      type="smallBold"
                      style={{ color: theme.textOnPrimary, marginLeft: 6 }}>
                      Add Exercise
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              ) : (
                <View style={styles.exerciseList}>
                  {exercises.map((item, index) => (
                    <SessionExerciseCard
                      key={item.id}
                      exercise={item}
                      index={index}
                      isFirst={index === 0}
                      isLast={index === exercises.length - 1}
                      onMoveUp={() => handleMoveUp(index)}
                      onMoveDown={() => handleMoveDown(index)}
                      onReplace={() => handleOpenReplaceExercise(index)}
                      onRemove={() => handleRemoveExercise(index)}
                      onUpdateExercise={(updated) => handleUpdateExercise(index, updated)}
                    />
                  ))}

                  <TouchableOpacity
                    onPress={handleOpenAddExercise}
                    style={[
                      styles.bottomAddExerciseBtn,
                      { borderColor: theme.primary, backgroundColor: theme.primaryLight },
                    ]}>
                    <PlusIcon size={16} color={theme.primary} />
                    <ThemedText
                      type="smallBold"
                      themeColor="primary"
                      style={{ marginLeft: 6 }}>
                      Add Another Exercise
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Select Exercise Modal */}
      <SelectExerciseScreen
        visible={selectorVisible}
        onClose={() => {
          setSelectorVisible(false);
          setReplacingIndex(null);
        }}
        onSelect={handleExerciseSelected}
        title={replacingIndex !== null ? 'Replace Exercise' : 'Add Exercise'}
      />

      {pickerTarget !== null && Platform.OS === 'android' && (
        <DateTimePicker
          mode="time"
          presentation="dialog"
          value={new Date(pickerValue)}
          onValueChange={(_event, date) => handleTimeSelected(date)}
          onDismiss={handleCloseTimePicker}
        />
      )}

      <Modal
        visible={Platform.OS === 'ios' && pickerTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCloseTimePicker}>
        <Pressable style={styles.pickerBackdrop} onPress={handleCloseTimePicker}>
          <Pressable
            style={[styles.pickerSheet, { backgroundColor: theme.backgroundElement }]}
            onPress={() => {}}>
            <DateTimePicker
              mode="time"
              display="spinner"
              value={new Date(pickerValue)}
              accentColor={theme.primary}
              onValueChange={(_event, date) => handleTimeSelected(date)}
            />
            <TouchableOpacity
              onPress={handleCloseTimePicker}
              style={[styles.pickerDoneButton, { backgroundColor: theme.primary }]}>
              <ThemedText type="smallBold" style={{ color: theme.textOnPrimary }}>
                Done
              </ThemedText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
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
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  inputCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '600',
    padding: 0,
  },
  descriptionInput: {
    fontSize: 14,
    minHeight: 50,
    textAlignVertical: 'top',
    padding: 0,
  },
  timeCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  timeFieldsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  timeField: {
    flex: 1,
    gap: Spacing.one,
  },
  timeFieldPressable: {
    gap: Spacing.one,
  },
  timeFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleCol: {
    gap: 2,
  },
  addExerciseHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  emptyText: {
    textAlign: 'center',
  },
  addFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exerciseList: {
    gap: Spacing.three,
  },
  bottomAddExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  pickerBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  pickerSheet: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: Spacing.three,
  },
  pickerDoneButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
