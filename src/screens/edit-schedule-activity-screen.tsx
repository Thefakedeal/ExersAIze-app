import { parse, isValid } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ScheduleActivityForm,
  ScheduleActivityFormData,
} from '@/components/schedule/schedule-activity-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  EditScope,
  getScheduledOccurrenceById,
  updateScheduledOccurrenceWithScope,
} from '@/services/schedule-storage';

function parseTime(time?: string): Date {
  if (!time) return new Date();
  const parsed = parse(time, 'HH:mm', new Date());
  return isValid(parsed) ? parsed : new Date();
}

const EDIT_SCOPE_OPTIONS: { label: string; value: EditScope }[] = [
  { label: 'Only this occurrence', value: 'this' },
  { label: 'This and future occurrences', value: 'future' },
  { label: 'Entire series', value: 'all' },
];

export function EditScheduleActivityScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id;

  const [occurrence, setOccurrence] = useState<Awaited<ReturnType<typeof getScheduledOccurrenceById>>>(null);
  const [loading, setLoading] = useState(true);
  const [pendingSaveData, setPendingSaveData] = useState<ScheduleActivityFormData | null>(null);
  const savePromiseRef = useRef<{
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!id) return;
      try {
        const data = await getScheduledOccurrenceById(id);
        if (isMounted) {
          setOccurrence(data);
        }
      } catch {
        if (isMounted) {
          Alert.alert('Error', 'Failed to load activity.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSave = (data: ScheduleActivityFormData): Promise<void> => {
    if (!id) {
      Alert.alert('Error', 'Activity ID is missing.');
      return Promise.reject(new Error('Activity ID is missing'));
    }

    if (!occurrence || occurrence.recurrence === 'none' || !occurrence.seriesId) {
      return commitSave(data, 'this');
    }

    // Recurring activity: show scope picker before saving
    setPendingSaveData(data);
    return new Promise((resolve, reject) => {
      savePromiseRef.current = { resolve, reject };
    });
  };

  const commitSave = async (data: ScheduleActivityFormData, scope: EditScope): Promise<void> => {
    if (!id) return;

    try {
      await updateScheduledOccurrenceWithScope(id, data, scope);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to update activity. Please try again.');
    }
  };

  const handleScopeSelect = (scope: EditScope) => {
    if (!pendingSaveData) return;
    const data = pendingSaveData;
    setPendingSaveData(null);
    void commitSave(data, scope).then(() => {
      savePromiseRef.current?.resolve();
      savePromiseRef.current = null;
    });
  };

  const handleScopeCancel = () => {
    setPendingSaveData(null);
    savePromiseRef.current?.reject(new Error('Cancelled'));
    savePromiseRef.current = null;
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator color={theme.primary} />
        <ThemedText type="default">Loading activity...</ThemedText>
      </ThemedView>
    );
  }

  if (!occurrence) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="default">Activity not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <ScheduleActivityForm
        title="Edit Activity"
        submitLabel="Save activity"
        initialDate={parse(occurrence.scheduledDate, 'yyyy-MM-dd', new Date())}
        initialAllDay={occurrence.allDay ?? false}
        initialStartTime={parseTime(occurrence.startTime)}
        initialEndTime={parseTime(occurrence.endTime)}
        initialRoutineId={occurrence.routineId ?? null}
        initialTitle={occurrence.title ?? ''}
        initialRecurrence={occurrence.recurrence ?? 'none'}
        initialNotes={occurrence.notes ?? ''}
        onSave={handleSave}
        onBack={router.back}
      />

      <Modal
        visible={pendingSaveData !== null}
        transparent
        animationType="fade"
        onRequestClose={handleScopeCancel}>
        <Pressable
          style={[
            styles.pickerBackdrop,
            { backgroundColor: theme.backgroundOverlay },
          ]}
          onPress={handleScopeCancel}>
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
              Apply changes to
            </ThemedText>
            <View
              accessibilityRole="radiogroup"
              style={[styles.optionsCard, { borderColor: theme.border }]}>
              {EDIT_SCOPE_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.7}
                  onPress={() => handleScopeSelect(option.value)}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  style={[
                    styles.optionRow,
                    index !== EDIT_SCOPE_OPTIONS.length - 1 && {
                      borderBottomColor: theme.border,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    },
                  ]}>
                  <ThemedText type="default" style={styles.optionLabel}>
                    {option.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleScopeCancel}
              style={[styles.cancelButton, { backgroundColor: theme.backgroundSecondary }]}>
              <ThemedText type="smallBold">Cancel</ThemedText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
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
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
