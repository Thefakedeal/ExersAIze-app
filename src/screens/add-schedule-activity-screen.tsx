import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format, isValid, parse } from 'date-fns';
import { Fragment, useMemo, useState } from 'react';
import {
  type AccessibilityRole,
  type AccessibilityState,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
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
  RepeatIcon,
} from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useRoutines } from '@/hooks/use-routines';
import { useTheme } from '@/hooks/use-theme';
import { saveScheduledOccurrence } from '@/services/schedule-storage';
import { Recurrence } from '@/types/schedule';
import { RoutineItem } from '@/types/routine';

import { SelectRoutineScreen } from './select-routine-screen';

const RECURRENCE_OPTIONS: {
  label: string;
  shortLabel: string;
  value: Recurrence;
}[] = [
  { label: 'Does not repeat', shortLabel: 'Never', value: 'none' },
  { label: 'Weekly', shortLabel: 'Weekly', value: 'weekly' },
  { label: 'Monthly', shortLabel: 'Monthly', value: 'monthly' },
];

function parseDateParam(rawDate: string | undefined): Date {
  if (!rawDate) {
    return new Date();
  }
  const parsed = parse(rawDate, 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : new Date();
}

function createTimeDate(hours: number, minutes: number): Date {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  );
}

function formatTimeDisplay(date: Date): string {
  return format(date, 'h:mm a');
}

type FormRowProps = {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  placeholder?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
};

function FormRow({
  icon,
  label,
  value,
  placeholder,
  onPress,
  children,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
}: FormRowProps) {
  const theme = useTheme();

  const content = (
    <View style={styles.rowInner}>
      <View style={styles.rowIcon}>{icon ?? null}</View>
      <ThemedText type="default" style={styles.rowLabel}>
        {label}
      </ThemedText>
      <View style={styles.rowValueContainer}>
        {children ?? (
          <ThemedText
            type="default"
            numberOfLines={1}
            themeColor={value ? 'text' : 'textTertiary'}
            style={styles.rowValue}>
            {value || placeholder || ''}
          </ThemedText>
        )}
      </View>
      {onPress && !children && (
        <ChevronRightIcon size={18} color={theme.textSecondary} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        accessibilityRole={accessibilityRole ?? 'button'}
        accessibilityState={accessibilityState}
        accessibilityLabel={accessibilityLabel ?? label}
        style={styles.row}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

type OptionRowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  isLast?: boolean;
};

function OptionRow({ label, selected, onPress, isLast }: OptionRowProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      style={[
        styles.optionRow,
        !isLast && {
          borderBottomColor: theme.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}>
      <ThemedText type="default" style={styles.optionLabel}>
        {label}
      </ThemedText>
      {selected && (
        <View style={[styles.checkBadge, { backgroundColor: theme.primary }]}>
          <CheckIcon size={14} color={theme.textOnPrimary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export function AddScheduleActivityScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ date?: string }>();

  const [date, setDate] = useState(() => parseDateParam(params.date));
  const [allDay, setAllDay] = useState(false);
  const [startTime, setStartTime] = useState(() => createTimeDate(9, 0));
  const [endTime, setEndTime] = useState(() => createTimeDate(10, 0));
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(
    null
  );
  const [title, setTitle] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [isRoutinePickerVisible, setIsRoutinePickerVisible] = useState(false);
  const [isRepeatPickerVisible, setIsRepeatPickerVisible] = useState(false);

  const [pickerTarget, setPickerTarget] = useState<
    'date' | 'startTime' | 'endTime' | null
  >(null);
  const [pickerValue, setPickerValue] = useState<number>(() => date.getTime());
  const [draftValue, setDraftValue] = useState<number>(() => date.getTime());

  const { customRoutines, defaultRoutines } = useRoutines();

  const allRoutines = useMemo(
    () => [...customRoutines, ...defaultRoutines],
    [customRoutines, defaultRoutines]
  );

  const selectedRoutine = useMemo(
    () => allRoutines.find((routine) => routine.id === selectedRoutineId) ?? null,
    [allRoutines, selectedRoutineId]
  );

  const timeInvalid = !allDay && endTime.getTime() <= startTime.getTime();
  const canSave =
    (selectedRoutine !== null || title.trim().length > 0) && !timeInvalid;

  const recurrenceShortLabel = useMemo(
    () =>
      RECURRENCE_OPTIONS.find((option) => option.value === recurrence)
        ?.shortLabel ?? '',
    [recurrence]
  );

  const handleRoutineSelect = (routine: RoutineItem | null) => {
    setSelectedRoutineId(routine?.id ?? null);
    if (routine) {
      setTitle(routine.name);
    }
    setIsRoutinePickerVisible(false);
  };

  const openPicker = (
    target: 'date' | 'startTime' | 'endTime',
    value: number
  ) => {
    setPickerValue(value);
    setDraftValue(value);
    setPickerTarget(target);
  };

  const openDatePicker = () => openPicker('date', date.getTime());
  const openStartTimePicker = () => openPicker('startTime', startTime.getTime());
  const openEndTimePicker = () => openPicker('endTime', endTime.getTime());

  const closePicker = () => setPickerTarget(null);

  const commitPickerValue = (selected: Date) => {
    if (pickerTarget === 'date') {
      setDate(selected);
    } else if (pickerTarget === 'startTime') {
      setStartTime(selected);
      if (endTime.getTime() <= selected.getTime()) {
        setEndTime(new Date(selected.getTime() + 60 * 60 * 1000));
      }
    } else if (pickerTarget === 'endTime') {
      setEndTime(selected);
    }
    closePicker();
  };

  const handlePickerValueChange = (_event: unknown, selectedDate?: Date) => {
    if (!selectedDate) {
      return;
    }
    if (Platform.OS === 'android') {
      commitPickerValue(selectedDate);
    } else {
      setDraftValue(selectedDate.getTime());
    }
  };

  const handlePickerDone = () => {
    commitPickerValue(new Date(draftValue));
  };

  const handleSave = async () => {
    if (!canSave || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await saveScheduledOccurrence({
        scheduledDate: format(date, 'yyyy-MM-dd'),
        title: title.trim() || (selectedRoutine?.name ?? 'Activity'),
        routineId: selectedRoutine?.id,
        startTime: allDay ? undefined : format(startTime, 'HH:mm'),
        endTime: allDay ? undefined : format(endTime, 'HH:mm'),
        allDay,
        recurrence,
        notes: notes.trim() || undefined,
      });

      router.back();
    } catch {
      Alert.alert('Error', 'Failed to schedule activity. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const switchProps = {
    trackColor: { false: theme.backgroundSecondary, true: theme.primary },
    ios_backgroundColor: theme.backgroundSecondary,
  };

  const formRows: React.ReactNode[] = [
    <FormRow
      key="routine"
      icon={<DumbbellIcon size={20} color={theme.primary} />}
      label="Routine"
      value={selectedRoutine?.name}
      placeholder="Add routine"
      onPress={() => setIsRoutinePickerVisible(true)}
    />,
    <FormRow
      key="date"
      icon={<CalendarIcon size={20} color={theme.textSecondary} />}
      label="Date"
      value={format(date, 'EEE, MMM d, yyyy')}
      onPress={openDatePicker}
    />,
    <FormRow
      key="allDay"
      icon={null}
      label="All day"
      onPress={() => setAllDay((value) => !value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: allDay }}
      accessibilityLabel="All day">
      <Switch
        pointerEvents="none"
        value={allDay}
        onValueChange={setAllDay}
        {...switchProps}
      />
    </FormRow>,
    ...(!allDay
      ? [
          <FormRow
            key="startTime"
            icon={<ClockIcon size={20} color={theme.textSecondary} />}
            label="Starts"
            value={formatTimeDisplay(startTime)}
            onPress={openStartTimePicker}
          />,
          <FormRow
            key="endTime"
            icon={null}
            label="Ends"
            value={formatTimeDisplay(endTime)}
            onPress={openEndTimePicker}
          />,
          ...(timeInvalid
            ? [
                <View key="timeHint" style={styles.timeHint}>
                  <ThemedText type="small" themeColor="error">
                    End time must be after start time.
                  </ThemedText>
                </View>,
              ]
            : []),
        ]
      : []),
    <FormRow
      key="repeat"
      icon={<RepeatIcon size={20} color={theme.textSecondary} />}
      label="Repeat"
      value={recurrenceShortLabel}
      onPress={() => setIsRepeatPickerVisible(true)}
    />,
  ];

  return (
    <ThemedView style={styles.container}>
      <Header
        onBackPress={router.back}
        title="Add Activity"
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSave}
            disabled={!canSave || isSaving}
            accessibilityRole="button"
            accessibilityLabel="Save activity"
            accessibilityState={{
              disabled: !canSave || isSaving,
              busy: isSaving,
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.saveButton}>
            {isSaving ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <CheckIcon
                size={22}
                color={canSave ? theme.primary : theme.textTertiary}
              />
            )}
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <View style={styles.innerContainer}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Add title"
              placeholderTextColor={theme.textTertiary}
              selectionColor={theme.primary}
              style={[styles.titleInput, { color: theme.text }]}
              maxLength={120}
              accessibilityLabel="Activity title"
            />

            <ThemedView
              type="backgroundElement"
              style={[styles.card, { borderColor: theme.border }]}>
              {formRows.map((row, index) => (
                <Fragment key={index}>
                  {row}
                  {index < formRows.length - 1 && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: theme.border },
                      ]}
                    />
                  )}
                </Fragment>
              ))}
            </ThemedView>

            <ThemedView
              type="backgroundElement"
              style={[
                styles.card,
                styles.notesCard,
                { borderColor: theme.border },
              ]}>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes or instructions"
                placeholderTextColor={theme.textTertiary}
                selectionColor={theme.primary}
                multiline
                textAlignVertical="top"
                style={[styles.notesInput, { color: theme.text }]}
                maxLength={500}
                accessibilityLabel="Activity notes"
              />
            </ThemedView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectRoutineScreen
        visible={isRoutinePickerVisible}
        onClose={() => setIsRoutinePickerVisible(false)}
        onSelect={handleRoutineSelect}
        selectedRoutineId={selectedRoutineId}
      />

      {/* Repeat picker */}
      <Modal
        visible={isRepeatPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRepeatPickerVisible(false)}>
        <Pressable
          style={[
            styles.pickerBackdrop,
            { backgroundColor: theme.backgroundOverlay },
          ]}
          onPress={() => setIsRepeatPickerVisible(false)}>
          <Pressable
            style={[
              styles.pickerSheet,
              {
                backgroundColor: theme.backgroundElement,
                paddingBottom: insets.bottom + Spacing.four,
              },
            ]}
            onPress={() => {}}>
            <ThemedText type="smallBold" style={styles.pickerTitle}>
              Repeat
            </ThemedText>
            <View
              accessibilityRole="radiogroup"
              style={[styles.optionsCard, { borderColor: theme.border }]}>
              {RECURRENCE_OPTIONS.map((option, index) => (
                <OptionRow
                  key={option.value}
                  label={option.label}
                  selected={option.value === recurrence}
                  onPress={() => {
                    setRecurrence(option.value);
                    setIsRepeatPickerVisible(false);
                  }}
                  isLast={index === RECURRENCE_OPTIONS.length - 1}
                />
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Android date/time dialogs */}
      {Platform.OS === 'android' && pickerTarget === 'date' && (
        <DateTimePicker
          mode="date"
          presentation="dialog"
          value={new Date(pickerValue)}
          accentColor={theme.primary}
          onValueChange={handlePickerValueChange}
          onDismiss={closePicker}
        />
      )}
      {Platform.OS === 'android' && pickerTarget === 'startTime' && (
        <DateTimePicker
          mode="time"
          presentation="dialog"
          value={new Date(pickerValue)}
          accentColor={theme.primary}
          onValueChange={handlePickerValueChange}
          onDismiss={closePicker}
        />
      )}
      {Platform.OS === 'android' && pickerTarget === 'endTime' && (
        <DateTimePicker
          mode="time"
          presentation="dialog"
          value={new Date(pickerValue)}
          accentColor={theme.primary}
          onValueChange={handlePickerValueChange}
          onDismiss={closePicker}
        />
      )}

      {/* iOS date/time picker */}
      <Modal
        visible={Platform.OS === 'ios' && pickerTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={closePicker}>
        <Pressable
          style={[
            styles.pickerBackdrop,
            { backgroundColor: theme.backgroundOverlay },
          ]}
          onPress={closePicker}>
          <Pressable
            style={[
              styles.pickerSheet,
              { backgroundColor: theme.backgroundElement },
            ]}
            onPress={() => {}}>
            <DateTimePicker
              mode={pickerTarget === 'date' ? 'date' : 'time'}
              display="spinner"
              value={new Date(pickerValue)}
              accentColor={theme.primary}
              onValueChange={handlePickerValueChange}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePickerDone}
              style={[styles.doneButton, { backgroundColor: theme.primary }]}>
              <ThemedText type="smallBold" themeColor="textOnPrimary">
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
  flex: {
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
  titleInput: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
    paddingHorizontal: 0,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.three,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  notesCard: {
    marginTop: Spacing.four,
  },
  row: {
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowIcon: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
  },
  rowValueContainer: {
    flexShrink: 1,
    alignItems: 'flex-end',
  },
  rowValue: {
    textAlign: 'right',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.three,
  },
  timeHint: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  notesInput: {
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    minHeight: 96,
  },
  saveButton: {
    padding: Spacing.one,
    marginRight: -Spacing.one,
    justifyContent: 'center',
    alignItems: 'center',
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
  pickerTitle: {
    textAlign: 'center',
  },
  optionsCard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  optionLabel: {
    flex: 1,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
