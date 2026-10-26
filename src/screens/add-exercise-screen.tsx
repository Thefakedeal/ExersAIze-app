import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  CheckIcon,
  SearchIcon,
  PlusIcon,
  CloseIcon,
} from '@/components/ui/icons';
import {
  ExerciseType,
  TrackMetric,
  DEFAULT_EXERCISE_CATEGORIES,
} from '@/types/exercise';
import { saveCustomExercise } from '@/services/exercise-storage';

const EXERCISE_TYPES: ExerciseType[] = ['BodyWeight', 'Strength'];

const TRACK_METRICS: { key: TrackMetric; label: string; desc: string }[] = [
  { key: 'Reps', label: 'Reps', desc: 'Track number of repetitions' },
  { key: 'Time', label: 'Time', desc: 'Track duration in seconds or minutes' },
  { key: 'Distance', label: 'Distance', desc: 'Track distance (km, mi, meters)' },
];

export function AddExerciseScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Form State
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [type, setType] = useState<ExerciseType>('Strength');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // Categories
  const [allCategories, setAllCategories] = useState<string[]>(DEFAULT_EXERCISE_CATEGORIES);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Chest']);
  const [categorySearch, setCategorySearch] = useState('');

  // Track Metrics
  const [selectedMetrics, setSelectedMetrics] = useState<TrackMetric[]>(['Reps']);

  // Note
  const [note, setNote] = useState('');

  // Saving state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return allCategories;
    return allCategories.filter((cat) => cat.toLowerCase().includes(q));
  }, [allCategories, categorySearch]);

  const canAddCustomCategory = useMemo(() => {
    const q = categorySearch.trim();
    if (!q) return false;
    return !allCategories.some((cat) => cat.toLowerCase() === q.toLowerCase());
  }, [allCategories, categorySearch]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]
    );
  };

  const handleAddCustomCategory = () => {
    const trimmed = categorySearch.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    setAllCategories((prev) => [formatted, ...prev]);
    setSelectedCategories((prev) => [...prev, formatted]);
    setCategorySearch('');
  };

  const toggleTrackMetric = (metric: TrackMetric) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(metric)) {
        // Keep at least one metric or allow none? Better to allow toggling
        return prev.filter((m) => m !== metric);
      } else {
        return [...prev, metric];
      }
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError('Please enter an exercise name');
      return;
    }
    setNameError('');

    if (selectedMetrics.length === 0) {
      Alert.alert(
        'Missing Track Option',
        'Please select at least one tracking metric (Reps, Time, or Distance).'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await saveCustomExercise({
        name: name.trim(),
        type,
        categories: selectedCategories,
        trackMetrics: selectedMetrics,
        note: note.trim() || undefined,
      });

      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save exercise. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: Math.max(insets.top, Spacing.two),
            borderBottomColor: theme.separator,
          },
        ]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <ChevronLeftIcon size={24} color={theme.text} />
        </TouchableOpacity>

        <ThemedText type="smallBold" style={styles.headerTitle}>
          Add Exercise
        </ThemedText>

        <View style={styles.headerRightPlaceholder} />
      </View>

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
            {/* 1. Name Input */}
            <View style={styles.fieldSection}>
              <View style={styles.labelRow}>
                <ThemedText type="smallBold">Exercise Name</ThemedText>
                <Text style={{ color: theme.error, marginLeft: 4 }}>*</Text>
              </View>
              <TextInput
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) setNameError('');
                }}
                placeholder="e.g. Incline Dumbbell Press"
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
                <Text style={[styles.errorText, { color: theme.error }]}>
                  {nameError}
                </Text>
              ) : null}
            </View>

            {/* 2. Type Dropdown */}
            <View style={styles.fieldSection}>
              <ThemedText type="smallBold" style={styles.sectionLabel}>
                Exercise Type
              </ThemedText>
              <TouchableOpacity
                onPress={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                activeOpacity={0.7}
                style={[
                  styles.dropdownButton,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: isTypeDropdownOpen ? theme.primary : theme.border,
                  },
                ]}>
                <View style={styles.dropdownValueRow}>
                  <View
                    style={[
                      styles.typeIndicator,
                      {
                        backgroundColor:
                          type === 'BodyWeight' ? theme.accent : theme.primary,
                      },
                    ]}
                  />
                  <ThemedText>{type}</ThemedText>
                </View>
                <ChevronDownIcon size={20} color={theme.textSecondary} />
              </TouchableOpacity>

              {isTypeDropdownOpen && (
                <View
                  style={[
                    styles.dropdownMenu,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                    },
                  ]}>
                  {EXERCISE_TYPES.map((t) => {
                    const isSelected = type === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        onPress={() => {
                          setType(t);
                          setIsTypeDropdownOpen(false);
                        }}
                        style={[
                          styles.dropdownItem,
                          isSelected && {
                            backgroundColor: theme.backgroundSelected,
                          },
                        ]}>
                        <View style={styles.dropdownValueRow}>
                          <View
                            style={[
                              styles.typeIndicator,
                              {
                                backgroundColor:
                                  t === 'BodyWeight' ? theme.accent : theme.primary,
                              },
                            ]}
                          />
                          <ThemedText
                            style={isSelected ? { fontWeight: '700' } : undefined}>
                            {t}
                          </ThemedText>
                        </View>
                        {isSelected && (
                          <CheckIcon size={18} color={theme.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* 3. Multiselect Searchable Badges for Categories */}
            <View style={styles.fieldSection}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText type="smallBold">Categories</ThemedText>
                {selectedCategories.length > 0 && (
                  <View
                    style={[
                      styles.countBadge,
                      { backgroundColor: theme.backgroundSelected },
                    ]}>
                    <ThemedText type="code" themeColor="primary">
                      {selectedCategories.length} selected
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Search input for categories */}
              <View
                style={[
                  styles.searchContainer,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.border,
                  },
                ]}>
                <SearchIcon size={18} color={theme.textSecondary} />
                <TextInput
                  value={categorySearch}
                  onChangeText={setCategorySearch}
                  placeholder="Search or add category..."
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.searchInput,
                    { color: theme.text },
                  ]}
                />
                {categorySearch.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setCategorySearch('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <CloseIcon size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Add Custom Category button if search term doesn't exist */}
              {canAddCustomCategory && (
                <TouchableOpacity
                  onPress={handleAddCustomCategory}
                  style={[
                    styles.addCustomBadgeRow,
                    {
                      backgroundColor: theme.primaryLight,
                      borderColor: theme.primary,
                    },
                  ]}>
                  <PlusIcon size={16} color={theme.primary} />
                  <ThemedText type="smallBold" themeColor="primary" style={{ marginLeft: 6 }}>
                    Add &quot;{categorySearch.trim()}&quot; as custom category
                  </ThemedText>
                </TouchableOpacity>
              )}

              {/* Badges Grid */}
              <View style={styles.badgesWrapper}>
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => toggleCategory(cat)}
                      activeOpacity={0.7}
                      style={[
                        styles.badge,
                        {
                          backgroundColor: isSelected
                            ? theme.primary
                            : theme.backgroundElement,
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border,
                        },
                      ]}>
                      {isSelected && (
                        <View style={{ marginRight: 6 }}>
                          <CheckIcon size={13} color={theme.textOnPrimary} />
                        </View>
                      )}
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color: isSelected
                              ? theme.textOnPrimary
                              : theme.text,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. Multi Checkbox for Track: Reps, Time, Distance */}
            <View style={styles.fieldSection}>
              <ThemedText type="smallBold" style={styles.sectionLabel}>
                Track Options
              </ThemedText>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.sectionSubtext}>
                Select what to measure for each set or workout.
              </ThemedText>

              <View style={styles.checkboxGroup}>
                {TRACK_METRICS.map(({ key, label, desc }) => {
                  const isChecked = selectedMetrics.includes(key);
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => toggleTrackMetric(key)}
                      activeOpacity={0.7}
                      style={[
                        styles.checkboxRow,
                        {
                          backgroundColor: theme.backgroundElement,
                          borderColor: isChecked ? theme.primary : theme.border,
                        },
                      ]}>
                      <View
                        style={[
                          styles.checkboxSquare,
                          {
                            backgroundColor: isChecked
                              ? theme.primary
                              : 'transparent',
                            borderColor: isChecked
                              ? theme.primary
                              : theme.border,
                          },
                        ]}>
                        {isChecked && (
                          <CheckIcon size={14} color={theme.textOnPrimary} />
                        )}
                      </View>
                      <View style={styles.checkboxTextContainer}>
                        <ThemedText
                          type="smallBold"
                          style={isChecked ? { color: theme.primary } : undefined}>
                          {label}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {desc}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 5. Note Input */}
            <View style={styles.fieldSection}>
              <ThemedText type="smallBold" style={styles.sectionLabel}>
                Note (Optional)
              </ThemedText>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Form cues, equipment adjustment, or reminders..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={[
                  styles.noteInput,
                  {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
              />
            </View>

            {/* 6. Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSubmitting}
              activeOpacity={0.8}
              style={[
                styles.saveButton,
                {
                  backgroundColor: theme.primary,
                  opacity: isSubmitting ? 0.7 : 1,
                },
              ]}>
              <ThemedText
                type="smallBold"
                style={[styles.saveButtonText, { color: theme.textOnPrimary }]}>
                {isSubmitting ? 'Saving Exercise...' : 'Add Exercise'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: Spacing.one,
    marginLeft: -Spacing.one,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 32,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  innerContainer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  fieldSection: {
    marginBottom: Spacing.four,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  sectionLabel: {
    marginBottom: Spacing.two,
  },
  sectionSubtext: {
    marginTop: -Spacing.one,
    marginBottom: Spacing.two,
    fontSize: 13,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  countBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    fontSize: 16,
  },
  errorText: {
    marginTop: Spacing.one,
    fontSize: 12,
  },
  dropdownButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  typeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dropdownMenu: {
    marginTop: Spacing.one,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150,150,150,0.15)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 10, default: 8 }),
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  addCustomBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    marginBottom: Spacing.two,
  },
  badgesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    fontSize: 13,
  },
  checkboxGroup: {
    gap: Spacing.two,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxTextContainer: {
    flex: 1,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 88,
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
