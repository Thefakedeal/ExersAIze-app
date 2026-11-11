import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MinusIcon,
  PlusIcon,
  ReplaceIcon,
  TrashIcon,
} from '@/components/ui/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RoutineExercise } from '@/types/routine';

export type RoutineExerciseCardProps = {
  item: RoutineExercise;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdateSets: (delta: number) => void;
  onUpdateRepRange: (text: string) => void;
  onReplace: () => void;
  onRemove: () => void;
};

export function RoutineExerciseCard({
  item,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onUpdateSets,
  onUpdateRepRange,
  onReplace,
  onRemove,
}: RoutineExerciseCardProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.exerciseCard, { borderColor: theme.border }]}>
      {/* Top Header: Index Badge, Exercise Name & Categories, Reorder Controls */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderLeft}>
          <View
            style={[
              styles.indexBadge,
              { backgroundColor: theme.backgroundSelected },
            ]}>
            <ThemedText type="smallBold" themeColor="primary">
              {index + 1}
            </ThemedText>
          </View>
          <View style={styles.exerciseTitleCol}>
            <ThemedText type="smallBold" style={styles.exerciseNameText}>
              {item.name}
            </ThemedText>
            {item.type && (
              <ThemedText type="code" themeColor="textSecondary">
                {item.type}
                {item.categories && item.categories.length > 0
                  ? ` • ${item.categories[0]}`
                  : ''}
              </ThemedText>
            )}
          </View>
        </View>

        {/* Up / Down Reorder Controls */}
        <View style={styles.reorderControls}>
          <TouchableOpacity
            onPress={onMoveUp}
            disabled={isFirst}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={[
              styles.reorderBtn,
              {
                borderColor: theme.border,
                opacity: isFirst ? 0.3 : 1,
              },
            ]}>
            <ChevronUpIcon size={16} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onMoveDown}
            disabled={isLast}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={[
              styles.reorderBtn,
              {
                borderColor: theme.border,
                opacity: isLast ? 0.3 : 1,
              },
            ]}>
            <ChevronDownIcon size={16} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Middle Row: Sets Stepper and Rep Range Input */}
      <View
        style={[
          styles.inputsContainer,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}>
        {/* Sets Stepper */}
        <View style={styles.inputCol}>
          <ThemedText type="code" themeColor="textSecondary">
            Sets
          </ThemedText>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={() => onUpdateSets(-1)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              style={[
                styles.stepperBtn,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <MinusIcon size={14} color={theme.text} />
            </TouchableOpacity>

            <ThemedText type="smallBold" style={styles.stepperValue}>
              {item.sets}
            </ThemedText>

            <TouchableOpacity
              onPress={() => onUpdateSets(1)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              style={[
                styles.stepperBtn,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <PlusIcon size={14} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Rep Range Input */}
        <View style={[styles.inputCol, { flex: 1 }]}>
          <ThemedText type="code" themeColor="textSecondary">
            Rep Range
          </ThemedText>
          <TextInput
            value={item.repRange}
            onChangeText={onUpdateRepRange}
            placeholder="e.g. 8-12"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.compactInput,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          />
        </View>
      </View>

      {/* Bottom Actions Row: Replace & Remove */}
      <View style={styles.cardActionsRow}>
        <TouchableOpacity
          onPress={onReplace}
          activeOpacity={0.7}
          style={[
            styles.actionBtn,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
            },
          ]}>
          <ReplaceIcon size={14} color={theme.text} />
          <ThemedText
            type="code"
            style={{ color: theme.text, marginLeft: 6 }}>
            Replace
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRemove}
          activeOpacity={0.7}
          style={[
            styles.actionBtn,
            {
              backgroundColor: theme.errorLight,
              borderColor: theme.errorBorder,
            },
          ]}>
          <TrashIcon size={14} color={theme.error} />
          <ThemedText
            type="code"
            style={{ color: theme.error, marginLeft: 6 }}>
            Remove
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.two,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseTitleCol: {
    flex: 1,
    gap: 2,
  },
  exerciseNameText: {
    fontSize: 15,
  },
  reorderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reorderBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: 10,
    borderWidth: 1,
  },
  inputCol: {
    gap: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 20,
    textAlign: 'center',
    fontSize: 15,
  },
  compactInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 13,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});
