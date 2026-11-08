import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { deleteCustomRoutine, updateCustomRoutine } from '@/services/routine-storage';
import { RoutineExercise, RoutineItem } from '@/types/routine';
import { EditRoutineForm } from './edit-routine-form';

type Props = {
  routine: RoutineItem;
};

export function EditRoutineScreen({ routine }: Props) {
  const router = useRouter();

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    exercises: RoutineExercise[];
  }) => {
    await updateCustomRoutine(routine.id, {
      name: data.name,
      description: data.description,
      exercises: data.exercises,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${routine.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomRoutine(routine.id);
              router.back();
            } catch {
              Alert.alert('Error', 'Failed to delete routine. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <EditRoutineForm
      routine={routine}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}
