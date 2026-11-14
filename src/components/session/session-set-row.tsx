import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CheckIcon, CloseIcon, DumbbellIcon, NoteIcon } from '@/components/ui/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWeightUnit } from '@/providers/weight-unit-provider';
import { ExerciseType, TrackMetric } from '@/types/exercise';
import { SessionSet } from '@/types/session';
import { ReferenceSet } from '@/utils/exercise-history';
import { getMetricVisibility } from '@/utils/session-metrics';
import { toDisplayWeight, toStoredWeight } from '@/utils/weight';

interface SessionSetRowProps {
  set: SessionSet;
  index: number;
  exerciseType?: ExerciseType;
  trackMetrics?: TrackMetric[];
  referenceSet?: ReferenceSet | null;
  onUpdateSet: (updated: Partial<SessionSet>) => void;
  onRemoveSet: () => void;
  canRemove: boolean;
}

interface MetricInputProps {
  value?: number;
  unit: string;
  decimal?: boolean;
  referenceValue?: number;
  onChange: (value?: number) => void;
}

function parseMetricValue(text: string, decimal: boolean): number | undefined {
  if (text === '') return undefined;
  const parsed = decimal ? Number(text) : parseInt(text, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function MetricInput({
  value,
  unit,
  decimal = false,
  referenceValue,
  onChange,
}: MetricInputProps) {
  const theme = useTheme();
  const [text, setText] = useState(() => (value != null ? String(value) : ''));
  const [trackedValue, setTrackedValue] = useState(value);

  // Resync when the value changes externally (e.g. a unit switch) without
  // clobbering in-progress text such as "72.".
  if (value !== trackedValue) {
    setTrackedValue(value);
    if (value == null) {
      setText('');
    } else if (parseMetricValue(text, decimal) !== value) {
      setText(String(value));
    }
  }

  const handleChange = (next: string) => {
    const cleaned = next.replace(decimal ? /[^0-9.]/g : /[^0-9]/g, '');
    setText(cleaned);

    if (cleaned === '') {
      onChange(undefined);
      return;
    }

    const parsed = parseMetricValue(cleaned, decimal);
    if (parsed !== undefined) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setText(value != null ? String(value) : '');
  };

  return (
    <View style={styles.inputGroup}>
      <TextInput
        value={text}
        onChangeText={handleChange}
        onBlur={handleBlur}
        keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
        placeholder={referenceValue != null ? String(referenceValue) : '-'}
        placeholderTextColor={theme.textTertiary}
        style={[
          styles.metricInput,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
      />
      <ThemedText type="code" themeColor="textSecondary" style={styles.unitText}>
        {unit}
      </ThemedText>
    </View>
  );
}

export function SessionSetRow({
  set,
  index,
  exerciseType = 'Strength',
  trackMetrics,
  referenceSet,
  onUpdateSet,
  onRemoveSet,
  canRemove,
}: SessionSetRowProps) {
  const theme = useTheme();
  const { unit: weightUnit } = useWeightUnit();
  const [showNoteInput, setShowNoteInput] = useState(Boolean(set.note && set.note.length > 0));
  const hasNote = Boolean(set.note?.trim());

  const { hasTime, hasDistance, hasReps, showWeight } = getMetricVisibility(
    trackMetrics,
    exerciseType
  );

  const displayWeight =
    set.weight != null ? toDisplayWeight(set.weight, weightUnit) : undefined;
  const displayReference =
    referenceSet?.weight != null
      ? toDisplayWeight(referenceSet.weight, weightUnit)
      : undefined;

  return (
    <View style={[styles.container, set.completed && { opacity: 0.9 }]}>
      {/* Main Set Row */}
      <View style={styles.mainRow}>
        {/* Set Number */}
        <View
          style={[
            styles.setNumberBadge,
            {
              backgroundColor: set.completed
                ? theme.backgroundSelected
                : theme.backgroundSecondary,
            },
          ]}>
          <ThemedText
            type="smallBold"
            themeColor={set.completed ? 'primary' : 'textSecondary'}>
            {index + 1}
          </ThemedText>
        </View>

        {/* Inputs row */}
        <View style={styles.inputsRow}>
          {showWeight && (
            <MetricInput
              value={displayWeight}
              unit={weightUnit}
              decimal
              referenceValue={displayReference}
              onChange={(weight) =>
                onUpdateSet({
                  weight: weight != null ? toStoredWeight(weight, weightUnit) : undefined,
                })
              }
            />
          )}

          {hasReps && (
            <MetricInput
              value={set.reps}
              unit="reps"
              referenceValue={referenceSet?.reps}
              onChange={(reps) => onUpdateSet({ reps })}
            />
          )}

          {hasTime && (
            <MetricInput
              value={set.timeInSeconds}
              unit="sec"
              referenceValue={referenceSet?.timeInSeconds}
              onChange={(timeInSeconds) => onUpdateSet({ timeInSeconds })}
            />
          )}

          {hasDistance && (
            <MetricInput
              value={set.distance}
              unit="km"
              decimal
              referenceValue={referenceSet?.distance}
              onChange={(distance) => onUpdateSet({ distance })}
            />
          )}
        </View>

        {/* Note Toggle Button */}
        <TouchableOpacity
          onPress={() => setShowNoteInput((prev) => !prev)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[
            styles.iconButton,
            {
              backgroundColor: hasNote ? theme.primaryLight : theme.backgroundSecondary,
            },
          ]}>
          <NoteIcon size={15} color={hasNote ? theme.primary : theme.textSecondary} />
        </TouchableOpacity>

        {/* Completion indicator — set automatically from the tracked values */}
        <View style={styles.checkIndicator}>
          {set.completed && <CheckIcon size={16} color={theme.primary} />}
          {!set.completed && <DumbbellIcon size={16} color={theme.textSecondary} />}
        </View>

        {/* Remove Set Button */}
        {canRemove && (
          <TouchableOpacity
            onPress={onRemoveSet}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.removeButton}>
            <CloseIcon size={14} color={theme.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Note input row (how it felt) */}
      {showNoteInput && (
        <ThemedView
          type="backgroundElement"
          style={[styles.noteRow, { borderColor: theme.border }]}>
          <NoteIcon size={14} color={theme.textSecondary} />
          <TextInput
            value={set.note ?? ''}
            onChangeText={(text) => onUpdateSet({ note: text })}
            placeholder="How did this set feel? (e.g. easy, RPE 8, sore)"
            placeholderTextColor={theme.textTertiary}
            style={[styles.noteInput, { color: theme.text }]}
            multiline={false}
          />
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
    paddingVertical: Spacing.one,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  setNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  inputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  unitText: {
    fontSize: 11,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIndicator: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    width: 20,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    gap: Spacing.two,
    marginLeft: 34,
  },
  noteInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
});
