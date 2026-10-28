import { saveCustomExercise } from '@/services/exercise-storage';
import { ExerciseForm, ExerciseFormValues } from './exercise-form';

export function AddExerciseScreen() {
  const handleSubmit = async (values: ExerciseFormValues) => {
    await saveCustomExercise({
      name: values.name,
      type: values.type,
      categories: values.categories,
      trackMetrics: values.trackMetrics,
      note: values.note || undefined,
    });
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
