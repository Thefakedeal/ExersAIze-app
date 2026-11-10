import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CheckIcon, CloseIcon, NoteIcon } from '@/components/ui/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ExerciseType, TrackMetric } from '@/types/exercise';
import { SessionSet } from '@/types/session';
import { getMetricVisibility } from '@/utils/session-metrics';

interface SessionSetRowProps {
  set: SessionSet;
  index: number;
  exerciseType?: ExerciseType;
  trackMetrics?: TrackMetric[];
  onUpdateSet: (updated: Partial<SessionSet>) => void;
  onRemoveSet: () => void;
  canRemove: boolean;
}

interface MetricInputProps {
  value?: number;
  unit: string;
  decimal?: boolean;
  onChange: (value?: number) => void;
}

function MetricInput({ value, unit, decimal = false, onChange }: MetricInputProps) {
  const theme = useTheme();

  const handleChange = (text: string) => {
    const cleaned = text.replace(decimal ? /[^0-9.]/g : /[^0-9]/g, '');
    if (cleaned === '') return onChange(undefined);
    onChange(decimal ? Number(cleaned) : parseInt(cleaned, 10));
  };

  return (
    <View style={styles.inputGroup}>
      <TextInput
        value={String(value ?? '')}
        onChangeText={handleChange}
        keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
        placeholder="-"
        placeholderTextColor={theme.textDisabled}
        style={[
          styles.metricInput,
          {
            backgroundColor: theme.inputBackground,
            borderColor: theme.inputBorder,
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
  onUpdateSet,
  onRemoveSet,
  canRemove,
}: SessionSetRowProps) {
  const theme = useTheme();
  const [showNoteInput, setShowNoteInput] = useState(Boolean(set.note && set.note.length > 0));

  const { hasTime, hasDistance, hasReps, showWeight } = getMetricVisibility(
    trackMetrics,
    exerciseType
  );

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
                : theme.backgroundTertiary,
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
              value={set.weight}
              unit="kg"
              decimal
              onChange={(weight) => onUpdateSet({ weight })}
            />
          )}

          {hasReps && (
            <MetricInput
              value={set.reps}
              unit="reps"
              onChange={(reps) => onUpdateSet({ reps })}
            />
          )}

          {hasTime && (
            <MetricInput
              value={set.timeInSeconds}
              unit="sec"
              onChange={(timeInSeconds) => onUpdateSet({ timeInSeconds })}
            />
          )}

          {hasDistance && (
            <MetricInput
              value={set.distance}
              unit="km"
              decimal
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
              backgroundColor:
                set.note && set.note.trim().length > 0
                  ? theme.primaryLight
                  : theme.backgroundSecondary,
            },
          ]}>
          <NoteIcon
            size={15}
            color={
              set.note && set.note.trim().length > 0
                ? theme.primary
                : theme.textSecondary
            }
          />
        </TouchableOpacity>

        {/* Completion indicator — set automatically from the tracked values */}
        <View style={styles.checkIndicator}>
          {set.completed && <CheckIcon size={16} color={theme.primary} />}
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
            placeholderTextColor={theme.textDisabled}
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
