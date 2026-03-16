import { useState } from 'react';
import type { WorkoutExercise, WorkoutSet } from '../types';
import { getLastSession } from '../store';
import { AddSetForm } from './AddSetForm';
import { PRBadge } from './PRBadge';

interface Props {
  exercise: WorkoutExercise;
  unit: string;
  onAddSet: (exerciseId: string, reps: number, weight: number) => { set: WorkoutSet; isPR: boolean } | null;
  onDeleteSet: (exerciseId: string, setId: string) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onViewHistory: (exerciseName: string) => void;
}

export function ExerciseCard({
  exercise,
  unit,
  onAddSet,
  onDeleteSet,
  onRemoveExercise,
  onViewHistory,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [recentPR, setRecentPR] = useState<string | null>(null);

  const lastSession = getLastSession(exercise.name);

  // Default values for the form
  const lastSet = exercise.sets[exercise.sets.length - 1];
  const lastSessionFirstSet = lastSession?.exercise.sets[0];
  const defaultWeight = lastSet?.weight ?? lastSessionFirstSet?.weight ?? 20;
  const defaultReps = lastSet?.reps ?? lastSessionFirstSet?.reps ?? 5;

  const handleSave = (reps: number, weight: number) => {
    const result = onAddSet(exercise.id, reps, weight);
    if (result?.isPR) {
      setRecentPR(result.set.id);
      setTimeout(() => setRecentPR(null), 3000);
    }
    setShowForm(false);
  };

  return (
    <div className="bg-surface rounded-xl p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <button
          onClick={() => onViewHistory(exercise.name)}
          className="text-left"
        >
          <h3 className="text-white font-semibold text-base">{exercise.displayName}</h3>
        </button>
        {exercise.sets.length === 0 && (
          <button
            onClick={() => onRemoveExercise(exercise.id)}
            className="text-text-secondary text-xs min-w-[44px] min-h-[44px] flex items-center justify-end"
          >
            Remove
          </button>
        )}
      </div>

      {/* Last session reference */}
      {lastSession && (
        <div className="mb-3 px-3 py-2 bg-surface-2 rounded-lg">
          <p className="text-xs text-text-secondary mb-1">
            Last session &middot;{' '}
            {new Date(lastSession.date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {lastSession.exercise.sets.map((s, i) => (
              <span key={i} className="text-sm text-text-secondary">
                {s.weight}{unit} &times; {s.reps}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Today's sets */}
      {exercise.sets.length > 0 && (
        <div className="mb-3">
          {exercise.sets.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center justify-between py-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-text-secondary text-sm w-8">
                  Set {i + 1}
                </span>
                <span className="text-white text-sm font-medium">
                  {s.weight}{unit} &times; {s.reps}
                </span>
                {(s.isPR || recentPR === s.id) && <PRBadge />}
              </div>
              <button
                onClick={() => onDeleteSet(exercise.id, s.id)}
                className="text-text-secondary text-xs min-w-[44px] min-h-[44px] flex items-center justify-end"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add set form or button */}
      {showForm ? (
        <AddSetForm
          defaultWeight={defaultWeight}
          defaultReps={defaultReps}
          unit={unit}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-lg border border-border text-text-secondary font-medium
                     min-h-[48px] active:bg-surface-2 transition-colors text-sm"
        >
          + Add Set
        </button>
      )}
    </div>
  );
}
