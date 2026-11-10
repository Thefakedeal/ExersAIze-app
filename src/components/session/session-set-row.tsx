import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CheckIcon, CloseIcon, NoteIcon } from '@/components/ui/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ExerciseType, TrackMetric } from '@/types/exercise';
import { SessionSet } from '@/types/session';

interface SessionSetRowProps {
  set: SessionSet;
  index: number;
  exerciseType?: ExerciseType;
  trackMetrics?: TrackMetric[];
  onUpdateSet: (updated: Partial<SessionSet>) => void;
  onRemoveSet: () => void;
  canRemove: boolean;
}

export function SessionSetRow({
  set,
  index,
  exerciseType = 'Strength',
  trackMetrics = ['Reps'],
  onUpdateSet,
  onRemoveSet,
  canRemove,
}: SessionSetRowProps) {
  const theme = useTheme();
  const [showNoteInput, setShowNoteInput] = useState(Boolean(set.note && set.note.length > 0));

  const hasTime = trackMetrics.includes('Time');
  const hasDistance = trackMetrics.includes('Distance');
  const hasReps = trackMetrics.includes('Reps') || (!hasTime && !hasDistance);
  // Weight is relevant for Strength or if user wants to log load
  const showWeight = exerciseType === 'Strength' || (!hasDistance && !hasTime);

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
            <View style={styles.inputGroup}>
              <TextInput
                value={set.weight !== undefined && set.weight !== null ? String(set.weight) : ''}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  onUpdateSet({ weight: cleaned === '' ? undefined : Number(cleaned) });
                }}
                keyboardType="decimal-pad"
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
                kg
              </ThemedText>
            </View>
          )}

          {hasReps && (
            <View style={styles.inputGroup}>
              <TextInput
                value={set.reps !== undefined && set.reps !== null ? String(set.reps) : ''}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  onUpdateSet({ reps: cleaned === '' ? undefined : parseInt(cleaned, 10) });
                }}
                keyboardType="number-pad"
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
                reps
              </ThemedText>
            </View>
          )}

          {hasTime && (
            <View style={styles.inputGroup}>
              <TextInput
                value={
                  set.timeInSeconds !== undefined && set.timeInSeconds !== null
                    ? String(set.timeInSeconds)
                    : ''
                }
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  onUpdateSet({
                    timeInSeconds: cleaned === '' ? undefined : parseInt(cleaned, 10),
                  });
                }}
                keyboardType="number-pad"
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
                sec
              </ThemedText>
            </View>
          )}

          {hasDistance && (
            <View style={styles.inputGroup}>
              <TextInput
                value={
                  set.distance !== undefined && set.distance !== null ? String(set.distance) : ''
                }
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  onUpdateSet({ distance: cleaned === '' ? undefined : Number(cleaned) });
                }}
                keyboardType="decimal-pad"
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
                km
              </ThemedText>
            </View>
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
