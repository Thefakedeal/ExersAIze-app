import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  ReplaceIcon,
  TrashIcon,
} from '@/components/ui/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TrackMetric } from '@/types/exercise';
import { ReferenceMode, SessionExercise, SessionSet } from '@/types/session';
import {
  ExerciseReference,
  describeReferenceSet,
  getReferenceSetForRow,
} from '@/utils/exercise-history';
import { getMetricVisibility } from '@/utils/session-metrics';
import { SessionSetRow } from './session-set-row';

function formatReferenceLabel(reference: ExerciseReference | null, mode: ReferenceMode) {
  if (!reference) {
    return mode === 'pr' ? 'No PR recorded' : 'No previous data';
  }

  const date = format(new Date(reference.date), 'MMM d');

  if (reference.mode === 'pr') {
    return `PR · ${describeReferenceSet(reference.sets[0])} · ${date}`;
  }

  return `Last · ${reference.sets.length} ${
    reference.sets.length === 1 ? 'set' : 'sets'
  } · ${date}`;
}

function isSetComplete(set: SessionSet, metrics: TrackMetric[]) {
  return metrics.every((metric) => {
    switch (metric) {
      case 'Time':
        return set.timeInSeconds != null;
      case 'Distance':
        return set.distance != null;
      case 'Reps':
      default:
        return set.reps != null;
    }
  });
}

interface SessionExerciseCardProps {
  exercise: SessionExercise;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  reference: ExerciseReference | null;
  referenceMode: ReferenceMode;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onReplace: () => void;
  onRemove: () => void;
  onUpdateExercise: (updated: SessionExercise) => void;
}

export function SessionExerciseCard({
  exercise,
  index,
  isFirst,
  isLast,
  reference,
  referenceMode,
  onMoveUp,
  onMoveDown,
  onReplace,
  onRemove,
  onUpdateExercise,
}: SessionExerciseCardProps) {
  const theme = useTheme();
  const { metrics, hasTime, hasDistance, hasReps, showWeight } = getMetricVisibility(
    exercise.trackMetrics,
    exercise.type
  );

  const updateSets = (sets: SessionSet[]) => onUpdateExercise({ ...exercise, sets });

  const handleUpdateSet = (setIndex: number, updatedFields: Partial<SessionSet>) => {
    updateSets(
      exercise.sets.map((set, idx) => {
        if (idx !== setIndex) return set;
        const updated = { ...set, ...updatedFields };
        return { ...updated, completed: isSetComplete(updated, metrics) };
      })
    );
  };

  const handleAddSet = () => {
    updateSets([
      ...exercise.sets,
      {
        id: `set_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        setNumber: exercise.sets.length + 1,
        completed: false,
        note: '',
      },
    ]);
  };

  const handleRemoveSet = (setIndex: number) => {
    updateSets(
      exercise.sets
        .filter((_, idx) => idx !== setIndex)
        .map((set, idx) => ({ ...set, setNumber: idx + 1 }))
    );
  };

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.container, { borderColor: theme.border }]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.indexBadge,
              { backgroundColor: theme.backgroundSelected },
            ]}>
            <ThemedText type="smallBold" themeColor="primary">
              {index + 1}
            </ThemedText>
          </View>
          <View style={styles.titleCol}>
            <ThemedText type="smallBold" style={styles.nameText}>
              {exercise.name}
            </ThemedText>
            <ThemedText type="code" themeColor="textSecondary">
              {exercise.type ?? 'Strength'}
              {exercise.categories && exercise.categories.length > 0
                ? ` • ${exercise.categories[0]}`
                : ''}
            </ThemedText>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={onMoveUp}
            disabled={isFirst}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={[
              styles.iconBtn,
              { borderColor: theme.border, opacity: isFirst ? 0.3 : 1 },
            ]}>
            <ChevronUpIcon size={14} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onMoveDown}
            disabled={isLast}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={[
              styles.iconBtn,
              { borderColor: theme.border, opacity: isLast ? 0.3 : 1 },
            ]}>
            <ChevronDownIcon size={14} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onReplace}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={[styles.iconBtn, { borderColor: theme.border }]}>
            <ReplaceIcon size={14} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onRemove}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={[styles.iconBtn, { borderColor: theme.border }]}>
            <TrashIcon size={14} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reference Hint */}
      <View style={styles.referenceRow}>
        <ThemedText
          type="code"
          themeColor="textSecondary"
          numberOfLines={1}
          style={styles.referenceText}>
          {formatReferenceLabel(reference, referenceMode)}
        </ThemedText>
      </View>

      {/* Sets Column Header */}
      <View style={[styles.tableHeaderRow, { borderBottomColor: theme.border }]}>
        <ThemedText type="code" themeColor="textSecondary" style={styles.colSet}>
          SET
        </ThemedText>
        <View style={styles.colInputs}>
          {showWeight && (
            <ThemedText type="code" themeColor="textSecondary" style={styles.colMetric}>
              LBS / KG
            </ThemedText>
          )}
          {hasReps && (
            <ThemedText type="code" themeColor="textSecondary" style={styles.colMetric}>
              REPS
            </ThemedText>
          )}
          {hasTime && (
            <ThemedText type="code" themeColor="textSecondary" style={styles.colMetric}>
              TIME
            </ThemedText>
          )}
          {hasDistance && (
            <ThemedText type="code" themeColor="textSecondary" style={styles.colMetric}>
              DIST
            </ThemedText>
          )}
        </View>
        <ThemedText type="code" themeColor="textSecondary" style={styles.colNote}>
          NOTE
        </ThemedText>
        <View style={styles.colDoneSpacer} />
      </View>

      {/* Sets List */}
      <View style={styles.setsContainer}>
        {exercise.sets.map((set, sIdx) => (
          <SessionSetRow
            key={set.id}
            set={set}
            index={sIdx}
            exerciseType={exercise.type}
            trackMetrics={exercise.trackMetrics}
            referenceSet={getReferenceSetForRow(reference, sIdx)}
            onUpdateSet={(updated) => handleUpdateSet(sIdx, updated)}
            onRemoveSet={() => handleRemoveSet(sIdx)}
            canRemove={exercise.sets.length > 1}
          />
        ))}
      </View>

      {/* Add Set Button */}
      <TouchableOpacity
        onPress={handleAddSet}
        style={[styles.addSetButton, { backgroundColor: theme.backgroundSecondary }]}>
        <PlusIcon size={14} color={theme.primary} />
        <ThemedText type="smallBold" themeColor="primary" style={styles.addSetText}>
          Add Set
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.two,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
  },
  nameText: {
    fontSize: 15,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referenceText: {
    flexShrink: 1,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.one,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colSet: {
    width: 26,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
  },
  colInputs: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: Spacing.two,
    gap: Spacing.two,
  },
  colMetric: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
  },
  colNote: {
    width: 32,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    marginRight: 4,
  },
  colDoneSpacer: {
    width: 32,
  },
  setsContainer: {
    gap: Spacing.one,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addSetText: {
    fontSize: 13,
  },
});
