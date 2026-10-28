import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { deleteCustomExercise, updateCustomExercise } from '@/services/exercise-storage';
import { ExerciseItem } from '@/types/exercise';
import { ExerciseForm, ExerciseFormValues } from './exercise-form';

type Props = {
  exercise: ExerciseItem;
};

export function EditExerciseScreen({ exercise }: Props) {
  const router = useRouter();

  const handleSubmit = async (values: ExerciseFormValues) => {
    await updateCustomExercise(exercise.id, {
      name: values.name,
      type: values.type,
      categories: values.categories,
      trackMetrics: values.trackMetrics,
      note: values.note || undefined,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exercise.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomExercise(exercise.id);
              router.back();
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'Failed to delete exercise. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <ExerciseForm
      title="Edit Exercise"
      initialValues={{
        name: exercise.name,
        type: exercise.type,
        categories: exercise.categories,
        trackMetrics: exercise.trackMetrics,
        note: exercise.note ?? '',
      }}
      submitLabel="Update Exercise"
      submittingLabel="Saving..."
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}
