import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { addHours, format, parseISO } from 'date-fns';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
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
import { ClockIcon, ListCheckIcon, PlusIcon } from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SelectExerciseScreen } from '@/screens/select-exercise-screen';
import {
  findDefaultExerciseByName,
  getDefaultExerciseById,
  getDefaultRoutines,
} from '@/services/default-data';
import { getCustomExercises } from '@/services/exercise-storage';
import { getCustomRoutines, saveCustomRoutine } from '@/services/routine-storage';
import {
  getScheduledOccurrenceById,
  updateScheduledOccurrence,
} from '@/services/schedule-storage';
import {
  getWorkoutSessions,
  saveWorkoutSession,
  updateWorkoutSession,
} from '@/services/session-storage';
import { ExerciseItem } from '@/types/exercise';
import { RoutineExercise } from '@/types/routine';
import { ScheduledOccurrence } from '@/types/schedule';
import {
  ReferenceMode,
  SessionExercise,
  SessionSet,
  WorkoutSession,
} from '@/types/session';
import { ExerciseReference, findExerciseReference } from '@/utils/exercise-history';

interface ExerciseSessionScreenProps {
  routineId?: string;
  sessionId?: string;
  scheduledOccurrenceId?: string;
}

const DEFAULT_REFERENCE_MODE: ReferenceMode = 'last';

const REFERENCE_MODE_OPTIONS: {
  value: ReferenceMode;
  label: string;
  accessibilityLabel: string;
}[] = [
  { value: 'last', label: 'Last', accessibilityLabel: 'Last Performance' },
  { value: 'pr', label: 'PR', accessibilityLabel: 'Personal Record' },
];

function toRoutineExercises(exercises: SessionExercise[]): RoutineExercise[] {
  return exercises.map((exercise) => {
    const reps = exercise.sets
      .map((set) => set.reps)
      .filter((value): value is number => typeof value === 'number' && value > 0);

    let repRange = '8-12';
    if (reps.length > 0) {
      const min = Math.min(...reps);
      const max = Math.max(...reps);
      repRange = min === max ? `${min}` : `${min}-${max}`;
    }

    return {
      id: `rex_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      type: exercise.type,
      categories: exercise.categories,
      sets: Math.max(1, exercise.sets.length),
      repRange,
    };
  });
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

function resolveScheduledSessionTimes(occurrence: ScheduledOccurrence): {
  startTime: number;
  endTime: number;
} {
  const date = occurrence.scheduledDate;
  const startTimeStr = occurrence.allDay || !occurrence.startTime ? '10:00' : occurrence.startTime;

  const startDate = parseISO(`${date}T${startTimeStr}:00`);
  const endDate =
    occurrence.allDay || !occurrence.endTime
      ? addHours(startDate, 1)
      : parseISO(`${date}T${occurrence.endTime}:00`);

  return {
    startTime: startDate.getTime(),
    endTime: endDate.getTime() <= startDate.getTime() ? addHours(startDate, 1).getTime() : endDate.getTime(),
  };
}

export function ExerciseSessionScreen({
  routineId,
  sessionId,
  scheduledOccurrenceId,
}: ExerciseSessionScreenProps) {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [now, setNow] = useState<number>(startTime);
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [referenceMode, setReferenceMode] = useState<ReferenceMode>(DEFAULT_REFERENCE_MODE);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // The persisted session ID — set once on first save, then used for all updates
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionId ?? null);

  // Exercise Selector modal
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // Set when navigating away to create an exercise; reopens the selector on return
  const pendingSelectorReopen = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (pendingSelectorReopen.current) {
        pendingSelectorReopen.current = false;
        setSelectorVisible(true);
      }
    }, [])
  );

  // Time picker
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);
  const [pickerValue, setPickerValue] = useState<number>(startTime);

  // Routine origin and "Save as Routine" modal state
  const [originRoutineId, setOriginRoutineId] = useState<string | undefined>(routineId);
  const [routineModalVisible, setRoutineModalVisible] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [routineNameError, setRoutineNameError] = useState('');
  const [isSavingRoutine, setIsSavingRoutine] = useState(false);
  const [savedRoutineId, setSavedRoutineId] = useState<string | null>(null);

  // Initialize from existing session or routine, then auto-save
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const sessionsPromise = getWorkoutSessions();

      if (sessionId) {
        const sessions = await sessionsPromise;
        const existing = sessions.find((item) => item.id === sessionId);
        if (!isMounted) return;

        setHistory(sessions);

        if (existing) {
          setTitle(existing.title);
          setDescription(existing.description ?? '');
          setStartTime(existing.startTime ?? existing.createdAt);
          setEndTime(existing.endTime ?? null);
          setExercises(existing.exercises ?? []);
          setReferenceMode(existing.referenceMode ?? DEFAULT_REFERENCE_MODE);
          setActiveSessionId(sessionId);
          setOriginRoutineId(existing.routineId);
          setIsInitialized(true);
          return;
        }

        setActiveSessionId(null);
      }

      let resolvedTitle = '';
      let resolvedDescription = '';
      let resolvedStartTime = Date.now();
      let resolvedEndTime: number | null = null;
      let resolvedExercises: SessionExercise[] = [];
      let scheduledOccurrence: ScheduledOccurrence | null = null;

      if (scheduledOccurrenceId && !sessionId) {
        scheduledOccurrence = await getScheduledOccurrenceById(scheduledOccurrenceId);
      }

      if (routineId) {
        const customRoutines = await getCustomRoutines();
        const routine =
          customRoutines.find((r) => r.id === routineId) ??
          getDefaultRoutines().find((r) => r.id === routineId);

        if (routine && isMounted) {
          resolvedTitle = routine.name;
          resolvedDescription = routine.description ?? '';

          const customExercises = await getCustomExercises();
          resolvedExercises = (routine.exercises ?? []).map((rEx, idx) => {
            let matched = customExercises.find(
              (libEx) => libEx.id === rEx.exerciseId || libEx.name === rEx.name
            );
            if (!matched && rEx.exerciseId) {
              matched = getDefaultExerciseById(rEx.exerciseId);
            }
            if (!matched && rEx.name) {
              matched = findDefaultExerciseByName(rEx.name);
            }

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

      if (scheduledOccurrence) {
        const times = resolveScheduledSessionTimes(scheduledOccurrence);
        resolvedStartTime = times.startTime;
        resolvedEndTime = times.endTime;
      }

      if (!resolvedTitle) {
        resolvedTitle = `${format(new Date(resolvedStartTime), 'MMMM d, yyyy')} Workout`;
      }

      // Render the workout immediately; persistence happens in the background.
      setTitle(resolvedTitle);
      setDescription(resolvedDescription);
      setStartTime(resolvedStartTime);
      setEndTime(resolvedEndTime);
      setExercises(resolvedExercises);
      setIsInitialized(true);

      const sessions = await sessionsPromise;
      if (!isMounted) return;
      setHistory(sessions);

      try {
        const created = await saveWorkoutSession({
          title: resolvedTitle,
          description: resolvedDescription || undefined,
          routineId,
          startTime: resolvedStartTime,
          endTime: resolvedEndTime,
          exercises: resolvedExercises,
          referenceMode: DEFAULT_REFERENCE_MODE,
        });

        if (!isMounted) return;
        setActiveSessionId(created.id);

        if (scheduledOccurrenceId && isMounted) {
          try {
            await updateScheduledOccurrence(scheduledOccurrenceId, {
              workoutSessionId: created.id,
            });
          } catch {
            // Best effort — the session is usable even if the link fails.
          }
        }
      } catch {
        // The form is already usable; persistence is best effort.
      }
    }

    void init();

    return () => {
      isMounted = false;
    };
  }, [sessionId, routineId, scheduledOccurrenceId]);

  // Keep the ongoing duration updating while the workout has no end time
  useEffect(() => {
    if (endTime) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  // Auto-persist changes: immediately once finished, debounced while ongoing
  useEffect(() => {
    if (!isInitialized || !activeSessionId) return;

    const persist = () =>
      void updateWorkoutSession(activeSessionId, {
        title: title.trim() || 'Workout Session',
        description: description.trim() || undefined,
        startTime,
        endTime,
        exercises,
        referenceMode,
      }).catch(() => {/* silent */});

    if (endTime) {
      persist();
      return;
    }

    const timer = setTimeout(persist, 800);
    return () => clearTimeout(timer);
  }, [
    exercises,
    title,
    description,
    startTime,
    endTime,
    referenceMode,
    isInitialized,
    activeSessionId,
  ]);

  // Exercise operations
  const handleOpenAddExercise = () => {
    setReplacingIndex(null);
    setSelectorVisible(true);
  };

  const handleOpenReplaceExercise = (index: number) => {
    setReplacingIndex(index);
    setSelectorVisible(true);
  };

  const handleCreateExercise = () => {
    // Hide the modal before navigating so it doesn't cover the form,
    // then reopen it (with fresh data) when we come back.
    pendingSelectorReopen.current = true;
    setSelectorVisible(false);
    router.push('/session/add-exercise');
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
      if (!activeSessionId) return;
      try {
        await updateWorkoutSession(activeSessionId, {
          title: title.trim() || 'Workout Session',
          description: description.trim() || undefined,
          startTime,
          endTime: overrides?.endTime !== undefined ? overrides.endTime : endTime,
          exercises: overrides?.exercises ?? exercises,
          referenceMode,
        });
      } catch {
        // silent — best effort
      }
    },
    [title, description, startTime, endTime, exercises, referenceMode, activeSessionId]
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

  const handleOpenSaveAsRoutine = () => {
    // Make sure a keyboard from the workout form is not left open behind the modal.
    Keyboard.dismiss();
    setRoutineName(title.trim());
    setRoutineNameError('');
    setRoutineModalVisible(true);
  };

  const handleCloseSaveAsRoutine = () => {
    setRoutineModalVisible(false);
    setRoutineNameError('');
  };

  const handleSaveAsRoutine = async () => {
    if (isSavingRoutine || savedRoutineId) return;

    const name = routineName.trim();
    if (!name) {
      setRoutineNameError('Please enter a routine name');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert(
        'Add Exercises',
        'Add at least one exercise before saving this workout as a routine.'
      );
      return;
    }

    const customRoutines = await getCustomRoutines();
    if (
      customRoutines.some((routine) => routine.name.toLowerCase() === name.toLowerCase())
    ) {
      setRoutineNameError('A routine with this name already exists');
      return;
    }

    try {
      setIsSavingRoutine(true);
      const routine = await saveCustomRoutine({
        name,
        exercises: toRoutineExercises(exercises),
      });
      setSavedRoutineId(routine.id);
      setRoutineModalVisible(false);
      Alert.alert('Routine Saved', `"${routine.name}" is now available in your routines.`);
    } catch {
      Alert.alert('Error', 'Failed to save routine. Please try again.');
    } finally {
      setIsSavingRoutine(false);
    }
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

  // Memo key on the exercise ids only; the exercises array changes identity on every set edit.
  const exerciseIdsKey = exercises.map((item) => item.exerciseId).join('|');

  const references = useMemo(() => {
    const map = new Map<string, ExerciseReference | null>();

    for (const exerciseId of exerciseIdsKey.split('|')) {
      if (map.has(exerciseId)) continue;
      map.set(
        exerciseId,
        findExerciseReference(history, exerciseId, referenceMode, sessionId)
      );
    }

    return map;
  }, [exerciseIdsKey, history, referenceMode, sessionId]);

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
            disabled={!!endTime || !isInitialized}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ThemedText
              type="smallBold"
              themeColor={endTime || !isInitialized ? 'textTertiary' : 'primary'}>
              Finish Workout
            </ThemedText>
          </TouchableOpacity>
        }
      />

      {!isInitialized ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : (
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
                    placeholderTextColor={theme.textTertiary}
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
                    placeholderTextColor={theme.textTertiary}
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

              {endTime && !originRoutineId && exercises.length > 0 && (
                <View style={styles.section}>
                  <TouchableOpacity
                    onPress={handleOpenSaveAsRoutine}
                    disabled={!!savedRoutineId}
                    activeOpacity={0.7}
                    style={[
                      styles.saveRoutineBtn,
                      {
                        borderColor: theme.primary,
                        backgroundColor: theme.primaryLight,
                        opacity: savedRoutineId ? 0.6 : 1,
                      },
                    ]}>
                    <ListCheckIcon size={18} color={theme.primary} />
                    <ThemedText type="smallBold" themeColor="primary" style={{ marginLeft: 6 }}>
                      {savedRoutineId ? 'Saved as Routine' : 'Save as Routine'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

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

                <View style={styles.referenceModeRow}>
                  <ThemedText type="code" themeColor="textSecondary">
                    Reference
                  </ThemedText>
                  {REFERENCE_MODE_OPTIONS.map((option) => {
                    const isSelected = referenceMode === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setReferenceMode(option.value)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={option.accessibilityLabel}
                        accessibilityState={{ selected: isSelected }}
                        style={[
                          styles.referenceModePill,
                          {
                            backgroundColor: isSelected
                              ? theme.backgroundSelected
                              : theme.backgroundElement,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}>
                        <ThemedText
                          type="code"
                          style={{
                            color: isSelected ? theme.primary : theme.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          }}>
                          {option.label}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
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
                        reference={references.get(item.exerciseId) ?? null}
                        referenceMode={referenceMode}
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
      )}

      {/* Select Exercise Modal */}
      {selectorVisible && (
        <SelectExerciseScreen
          visible
          onClose={() => {
            setSelectorVisible(false);
            setReplacingIndex(null);
          }}
          onSelect={handleExerciseSelected}
          title={replacingIndex !== null ? 'Replace Exercise' : 'Add Exercise'}
          onCreateExercise={handleCreateExercise}
        />
      )}

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
        <Pressable
          style={[styles.pickerBackdrop, { backgroundColor: theme.backgroundOverlay }]}
          onPress={handleCloseTimePicker}>
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

      <Modal
        visible={routineModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseSaveAsRoutine}>
        <KeyboardAvoidingView
          style={styles.routineModalContainer}
          behavior="padding">
          <Pressable
            style={[styles.pickerBackdrop, { backgroundColor: theme.backgroundOverlay }]}
            onPress={handleCloseSaveAsRoutine}>
            <Pressable
              style={[styles.pickerSheet, { backgroundColor: theme.backgroundElement }]}
              onPress={() => {}}>
              <View style={styles.routineModalHeader}>
                <ThemedText type="smallBold" style={styles.routineModalTitle}>
                  Save as Routine
                </ThemedText>
                <ThemedText type="code" themeColor="textSecondary">
                  {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'} will be
                  copied into a new routine.
                </ThemedText>
              </View>

              <TextInput
                value={routineName}
                onChangeText={(text) => {
                  setRoutineName(text);
                  if (routineNameError) setRoutineNameError('');
                }}
                placeholder="e.g. Upper Body Strength"
                placeholderTextColor={theme.textSecondary}
                autoFocus
                style={[
                  styles.routineNameInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: routineNameError ? theme.error : theme.border,
                  },
                ]}
              />
              {routineNameError ? (
                <ThemedText type="code" style={{ color: theme.error }}>
                  {routineNameError}
                </ThemedText>
              ) : null}

              <View style={styles.routineModalActions}>
                <TouchableOpacity
                  onPress={handleCloseSaveAsRoutine}
                  disabled={isSavingRoutine}
                  activeOpacity={0.7}
                  style={[styles.routineModalCancel, { borderColor: theme.border }]}>
                  <ThemedText type="smallBold" themeColor="textSecondary">
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveAsRoutine}
                  disabled={isSavingRoutine}
                  activeOpacity={0.8}
                  style={[
                    styles.routineModalSave,
                    { backgroundColor: theme.primary, opacity: isSavingRoutine ? 0.7 : 1 },
                  ]}>
                  <ThemedText type="smallBold" style={{ color: theme.textOnPrimary }}>
                    {isSavingRoutine ? 'Saving...' : 'Save Routine'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  referenceModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  referenceModePill: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
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
  saveRoutineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  routineModalContainer: {
    flex: 1,
  },
  routineModalHeader: {
    gap: 2,
  },
  routineModalTitle: {
    fontSize: 17,
  },
  routineNameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 16,
  },
  routineModalActions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  routineModalCancel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  routineModalSave: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
});
