import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/header';
import { RoutineEmptyExercises } from '@/components/routine/routine-empty-exercises';
import { RoutineExerciseCard } from '@/components/routine/routine-exercise-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PlusIcon } from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SelectExerciseScreen } from '@/screens/select-exercise-screen';
import { ExerciseItem } from '@/types/exercise';
import { RoutineExercise } from '@/types/routine';

type Props = {
  onSubmit: (data: {
    name: string;
    description?: string;
    exercises: RoutineExercise[];
  }) => Promise<void>;
};

export function AddRoutineForm({ onSubmit }: Props) {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectorVisible, setSelectorVisible] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const handleOpenAddExercise = () => {
    setReplacingIndex(null);
    setSelectorVisible(true);
  };

  const handleOpenReplaceExercise = (index: number) => {
    setReplacingIndex(index);
    setSelectorVisible(true);
  };

  const handleExerciseSelected = (exercise: ExerciseItem) => {
    if (replacingIndex !== null && replacingIndex >= 0 && replacingIndex < exercises.length) {
      setExercises((prev) =>
        prev.map((item, idx) =>
          idx === replacingIndex
            ? {
                ...item,
                exerciseId: exercise.id,
                name: exercise.name,
                type: exercise.type,
                categories: exercise.categories,
              }
            : item
        )
      );
    } else {
      const newRoutineEx: RoutineExercise = {
        id: `rex_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        exerciseId: exercise.id,
        name: exercise.name,
        type: exercise.type,
        categories: exercise.categories,
        sets: 3,
        repRange: '8-12',
      };
      setExercises((prev) => [...prev, newRoutineEx]);
    }
  };

  const handleRemoveExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
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

  const handleUpdateSets = (index: number, delta: number) => {
    setExercises((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const newSets = Math.max(1, Math.min(50, item.sets + delta));
        return { ...item, sets: newSets };
      })
    );
  };

  const handleUpdateRepRange = (index: number, text: string) => {
    setExercises((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, repRange: text } : item))
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError('Please enter a routine name');
      return;
    }
    setNameError('');

    if (exercises.length === 0) {
      Alert.alert(
        'Add Exercises',
        'Please add at least one exercise to your routine before saving.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        exercises,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save routine. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Header onBackPress={router.back} title="New Routine" />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.innerContainer}>
            {/* 1. Name */}
            <View style={styles.fieldSection}>
              <View style={styles.labelRow}>
                <ThemedText type="smallBold">Routine Name</ThemedText>
                <Text style={{ color: theme.error, marginLeft: 4 }}>*</Text>
              </View>
              <TextInput
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) setNameError('');
                }}
                placeholder="e.g. Upper Body Hypertrophy"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    borderColor: nameError ? theme.error : theme.border,
                  },
                ]}
              />
              {nameError ? (
                <ThemedText type="code" style={[styles.errorText, { color: theme.error }]}>
                  {nameError}
                </ThemedText>
              ) : null}
            </View>

            {/* 2. Description */}
            <View style={styles.fieldSection}>
              <ThemedText type="smallBold">Description (Optional)</ThemedText>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. Compound lifts targeting chest, back, and shoulders"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={[
                  styles.descriptionInput,
                  {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
              />
            </View>

            {/* 3. Exercises */}
            <View style={styles.fieldSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <ThemedText type="smallBold">Exercises</ThemedText>
                  <ThemedText type="code" themeColor="textSecondary">
                    {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
                  </ThemedText>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleOpenAddExercise}
                  style={[styles.addExerciseBtn, { backgroundColor: theme.primary }]}>
                  <PlusIcon size={16} color={theme.textOnPrimary} />
                  <ThemedText
                    type="smallBold"
                    style={{ color: theme.textOnPrimary, marginLeft: 6 }}>
                    Add Exercise
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {exercises.length === 0 ? (
                <RoutineEmptyExercises onAddExercise={handleOpenAddExercise} />
              ) : (
                <View style={styles.exerciseList}>
                  {exercises.map((item, index) => (
                    <RoutineExerciseCard
                      key={item.id}
                      item={item}
                      index={index}
                      isFirst={index === 0}
                      isLast={index === exercises.length - 1}
                      onMoveUp={() => handleMoveUp(index)}
                      onMoveDown={() => handleMoveDown(index)}
                      onUpdateSets={(delta) => handleUpdateSets(index, delta)}
                      onUpdateRepRange={(text) => handleUpdateRepRange(index, text)}
                      onReplace={() => handleOpenReplaceExercise(index)}
                      onRemove={() => handleRemoveExercise(index)}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
              style={[
                styles.saveButton,
                {
                  backgroundColor: isSubmitting
                    ? theme.primaryDisabled
                    : theme.primary,
                },
              ]}>
              <ThemedText
                type="smallBold"
                style={[styles.saveButtonText, { color: theme.textOnPrimary }]}>
                {isSubmitting ? 'Saving Routine...' : 'Save Routine'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Exercise Selector Modal */}
      <SelectExerciseScreen
        visible={selectorVisible}
        onClose={() => {
          setSelectorVisible(false);
          setReplacingIndex(null);
        }}
        onSelect={handleExerciseSelected}
        title={replacingIndex !== null ? 'Replace Exercise' : 'Add Exercise'}
        selectedExerciseId={
          replacingIndex !== null && exercises[replacingIndex]
            ? exercises[replacingIndex].exerciseId
            : undefined
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
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
  fieldSection: {
    gap: Spacing.two,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    fontSize: 16,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 80,
  },
  errorText: {
    marginTop: 2,
    fontSize: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleCol: {
    gap: 2,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 18,
  },
  exerciseList: {
    gap: Spacing.three,
  },
  saveButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  saveButtonText: {
    fontSize: 16,
  },
});
