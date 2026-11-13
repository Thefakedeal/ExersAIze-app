import { saveCustomExercise } from '@/services/exercise-storage';
import { ExerciseForm, ExerciseFormValues } from './exercise-form';

export function AddExerciseScreen() {
  const handleSubmit = async (values: ExerciseFormValues) => {
    await saveCustomExercise({ ...values, note: values.note || undefined });
  };

  return (
    <ExerciseForm
      title="Add Exercise"
      submitLabel="Add Exercise"
      submittingLabel="Saving Exercise..."
      onSubmit={handleSubmit}
    />
  );
}
