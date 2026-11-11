import { saveCustomRoutine } from '@/services/routine-storage';
import { RoutineExercise } from '@/types/routine';
import { AddRoutineForm } from './add-routine-form';

export function AddRoutineScreen() {
  const handleSubmit = async (data: {
    name: string;
    description?: string;
    exercises: RoutineExercise[];
  }) => {
    await saveCustomRoutine({
      name: data.name,
      description: data.description,
      exercises: data.exercises,
    });
  };

  return <AddRoutineForm onSubmit={handleSubmit} />;
}
