import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format, isValid, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CheckIcon, ChevronRightIcon, ClockIcon } from '@/components/ui/icons';
import { SearchField } from '@/components/ui/search-field';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useRoutines } from '@/hooks/use-routines';
import { useTheme } from '@/hooks/use-theme';
import { saveScheduledOccurrence } from '@/services/schedule-storage';
import { RoutineItem } from '@/types/routine';

export function AddScheduleActivityScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ date?: string }>();

  const rawDate = Array.isArray(params.date) ? params.date[0] : params.date;
  const initialDateTime = useMemo(() => {
    if (!rawDate) {
      return new Date();
    }
    const parsed = parseISO(rawDate);
    return isValid(parsed) ? parsed : new Date();
  }, [rawDate]);

  const [dateTime, setDateTime] = useState(initialDateTime);
  const [pickerTarget, setPickerTarget] = useState<
    'datetime' | 'date' | 'time' | null
  >(null);
  const [pickerValue, setPickerValue] = useState<number>(() => dateTime.getTime());

  const { customRoutines, defaultRoutines, loading } = useRoutines();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const allRoutines = useMemo(
    () => [...customRoutines, ...defaultRoutines],
    [customRoutines, defaultRoutines]
  );

  const filteredRoutines = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return allRoutines;
    }
    return allRoutines.filter((routine) => routine.name.toLowerCase().includes(query));
  }, [allRoutines, searchQuery]);

  const selectedRoutine = useMemo(
    () => allRoutines.find((routine) => routine.id === selectedRoutineId) ?? null,
    [allRoutines, selectedRoutineId]
  );

  const canSave = selectedRoutine !== null || customTitle.trim().length > 0;

  const handleRoutinePress = (routine: RoutineItem) => {
    setSelectedRoutineId(routine.id);
    setCustomTitle('');
  };

  const handleCustomTitleChange = (text: string) => {
    setCustomTitle(text);
    if (text.length > 0) {
      setSelectedRoutineId(null);
    }
  };

  const handleOpenDateTimePicker = () => {
    setPickerValue(dateTime.getTime());
    setPickerTarget(Platform.OS === 'ios' ? 'datetime' : 'date');
  };

  const handlePickerDismiss = () => {
    setPickerTarget(null);
  };

  const handlePickerValueChange = (_event: unknown, date?: Date) => {
    if (!date) {
      return;
    }

    setPickerValue(date.getTime());
    setDateTime(date);

    if (pickerTarget === 'date') {
      // Android has no combined date-time picker, so the date step hands off to a time picker.
      setPickerTarget('time');
    } else if (pickerTarget === 'time' || pickerTarget === 'datetime') {
      setPickerTarget(null);
    }
  };

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setIsSaving(true);

    try {
      await saveScheduledOccurrence({
        scheduledDate: format(dateTime, 'yyyy-MM-dd'),
        routineId: selectedRoutine?.id,
        title: selectedRoutine ? selectedRoutine.name : customTitle.trim(),
        startTime: format(dateTime, 'HH:mm'),
      });

      router.back();
    } catch {
      Alert.alert('Error', 'Failed to schedule activity. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Header onBackPress={router.back} title="Add Activity" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.innerContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenDateTimePicker}
              accessibilityRole="button"
              accessibilityLabel="Change scheduled date and time"
              style={[
                styles.dateCard,
                { borderColor: theme.border, backgroundColor: theme.backgroundElement },
              ]}>
              <View style={[styles.dateTimeIcon, { backgroundColor: theme.primaryLight }]}>
                <ClockIcon size={18} color={theme.primary} />
              </View>
              <View style={styles.dateTimeContent}>
                <ThemedText type="small" themeColor="textSecondary">
                  Scheduled for
                </ThemedText>
                <ThemedText type="default" style={styles.dateText}>
                  {format(dateTime, "EEE, MMM d, yyyy 'at' h:mm a")}
                </ThemedText>
              </View>
              <ChevronRightIcon size={18} color={theme.textSecondary} />
            </TouchableOpacity>

            <View style={styles.section}>
              <ThemedText type="smallBold">Choose a routine</ThemedText>
              <SearchField
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search routines..."
                style={styles.searchField}
              />

              {loading ? (
                <ActivityIndicator color={theme.primary} style={styles.loader} />
              ) : filteredRoutines.length === 0 ? (
                <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
                  {searchQuery ? 'No routines match your search.' : 'No routines available.'}
                </ThemedText>
              ) : (
                <View style={styles.routineList}>
                  {filteredRoutines.map((routine) => {
                    const isSelected = routine.id === selectedRoutineId;

                    return (
                      <TouchableOpacity
                        key={routine.id}
                        activeOpacity={0.7}
                        onPress={() => handleRoutinePress(routine)}
                        style={styles.routineTouchable}>
                        <ThemedView
                          type="backgroundElement"
                          style={[
                            styles.routineCard,
                            {
                              borderColor: isSelected ? theme.primary : theme.border,
                              borderWidth: isSelected ? 1.5 : 1,
                            },
                          ]}>
                          <View style={styles.routineRow}>
                            <View style={styles.routineInfo}>
                              <ThemedText type="smallBold" style={styles.routineName}>
                                {routine.name}
                              </ThemedText>
                              {routine.description ? (
                                <ThemedText
                                  type="small"
                                  themeColor="textSecondary"
                                  numberOfLines={1}>
                                  {routine.description}
                                </ThemedText>
                              ) : null}
                            </View>

                            {isSelected && (
                              <View
                                style={[
                                  styles.checkBadge,
                                  { backgroundColor: theme.primary },
                                ]}>
                                <CheckIcon size={14} color={theme.textOnPrimary} />
                              </View>
                            )}
                          </View>
                        </ThemedView>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <ThemedText type="smallBold">Or create a custom activity</ThemedText>
              <TextInput
                value={customTitle}
                onChangeText={handleCustomTitleChange}
                placeholder="e.g. Morning run"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating schedule action */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSave}
        disabled={!canSave || isSaving}
        accessibilityRole="button"
        accessibilityLabel="Schedule activity"
        style={[
          styles.fab,
          {
            bottom: insets.bottom + Spacing.four,
            backgroundColor:
              canSave && !isSaving ? theme.primary : theme.primaryDisabled,
          },
        ]}>
        <CheckIcon size={24} color={theme.textOnPrimary} />
      </TouchableOpacity>

      {/* Android: date dialog followed by a time dialog */}
      {pickerTarget === 'date' && Platform.OS === 'android' && (
        <DateTimePicker
          mode="date"
          presentation="dialog"
          value={new Date(pickerValue)}
          accentColor={theme.primary}
          onValueChange={handlePickerValueChange}
          onDismiss={handlePickerDismiss}
        />
      )}

      {pickerTarget === 'time' && Platform.OS === 'android' && (
        <DateTimePicker
          mode="time"
          presentation="dialog"
          value={new Date(pickerValue)}
          accentColor={theme.primary}
          onValueChange={handlePickerValueChange}
          onDismiss={handlePickerDismiss}
        />
      )}

      {/* iOS: combined date-time picker */}
      <Modal
        visible={Platform.OS === 'ios' && pickerTarget === 'datetime'}
        transparent
        animationType="fade"
        onRequestClose={handlePickerDismiss}>
        <Pressable
          style={[styles.pickerBackdrop, { backgroundColor: theme.backgroundOverlay }]}
          onPress={handlePickerDismiss}>
          <Pressable
            style={[styles.pickerSheet, { backgroundColor: theme.backgroundElement }]}
            onPress={() => {}}>
            <DateTimePicker
              mode="datetime"
              display="spinner"
              value={new Date(pickerValue)}
              accentColor={theme.primary}
              onValueChange={handlePickerValueChange}
            />
            <TouchableOpacity
              onPress={handlePickerDismiss}
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
    gap: Spacing.four,
  },
  dateCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  dateTimeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTimeContent: {
    flex: 1,
    gap: 2,
  },
  dateText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  section: {
    gap: Spacing.two,
  },
  searchField: {
    marginBottom: Spacing.one,
  },
  loader: {
    marginVertical: Spacing.four,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: Spacing.four,
  },
  routineList: {
    gap: Spacing.two,
  },
  routineTouchable: {
    borderRadius: Spacing.three,
  },
  routineCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  routineInfo: {
    flex: 1,
    gap: 2,
  },
  routineName: {
    fontSize: 15,
    lineHeight: 20,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
});
