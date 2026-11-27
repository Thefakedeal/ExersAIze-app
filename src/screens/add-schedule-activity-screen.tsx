import { useLocalSearchParams, useRouter } from 'expo-router';
import { isValid, parse } from 'date-fns';
import { useState } from 'react';
import { Alert } from 'react-native';

import {
  ScheduleActivityForm,
  ScheduleActivityFormData,
} from '@/components/schedule/schedule-activity-form';
import { saveScheduledOccurrence } from '@/services/schedule-storage';

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

export function AddScheduleActivityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();

  const [initialDate] = useState(() => parseDateParam(params.date));

  const handleSave = async (data: ScheduleActivityFormData) => {
    try {
      await saveScheduledOccurrence(data);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to schedule activity. Please try again.');
      throw new Error('Failed to schedule activity');
    }
  };

  return (
    <ScheduleActivityForm
      title="Add Activity"
      submitLabel="Save activity"
      initialDate={initialDate}
      initialAllDay={false}
      initialStartTime={createTimeDate(9, 0)}
      initialEndTime={createTimeDate(10, 0)}
      initialRoutineId={null}
      initialTitle=""
      initialRecurrence="none"
      initialNotes=""
      onSave={handleSave}
      onBack={router.back}
    />
  );
}
