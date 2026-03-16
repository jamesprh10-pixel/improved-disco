import type { Workout, WorkoutSet } from '../types';
import { ExerciseCard } from './ExerciseCard';

interface Props {
  workout: Workout;
  unit: string;
  onAddExercise: () => void;
  onAddSet: (exerciseId: string, reps: number, weight: number) => { set: WorkoutSet; isPR: boolean } | null;
  onDeleteSet: (exerciseId: string, setId: string) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onEndWorkout: () => void;
  onViewHistory: (exerciseName: string) => void;
}

export function ActiveWorkout({
  workout,
  unit,
  onAddExercise,
  onAddSet,
  onDeleteSet,
  onRemoveExercise,
  onEndWorkout,
  onViewHistory,
}: Props) {
  const elapsed = Math.floor((Date.now() - workout.startedAt) / 60000);
  const hours = Math.floor(elapsed / 60);
  const mins = elapsed % 60;

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h1 className="text-xl font-bold text-white">Workout</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
          </p>
        </div>
        <button
          onClick={onEndWorkout}
          className="px-4 py-2 rounded-lg bg-danger text-white text-sm font-medium
                     min-h-[44px] active:opacity-80 transition-opacity"
        >
          End Workout
        </button>
      </header>

      <div className="flex-1 px-4 pb-6 overflow-y-auto">
        {workout.exercises.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            unit={unit}
            onAddSet={onAddSet}
            onDeleteSet={onDeleteSet}
            onRemoveExercise={onRemoveExercise}
            onViewHistory={onViewHistory}
          />
        ))}

        <button
          onClick={onAddExercise}
          className="w-full py-4 rounded-xl border border-dashed border-border text-accent
                     font-medium min-h-[56px] active:bg-surface transition-colors mt-2"
        >
          + Add Exercise
        </button>
      </div>
    </div>
  );
}
