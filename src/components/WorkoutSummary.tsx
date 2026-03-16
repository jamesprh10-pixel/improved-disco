import type { Workout } from '../types';

interface Props {
  workout: Workout;
  unit: string;
  onDone: () => void;
}

export function WorkoutSummary({ workout, unit, onDone }: Props) {
  const durationMins = workout.endedAt
    ? Math.floor((workout.endedAt - workout.startedAt) / 60000)
    : 0;
  const hours = Math.floor(durationMins / 60);
  const mins = durationMins % 60;

  const totalSets = workout.exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const prs = workout.exercises.flatMap(e =>
    e.sets.filter(s => s.isPR).map(s => ({ exercise: e.displayName, set: s })),
  );

  return (
    <div className="flex flex-col items-center min-h-dvh px-6 pt-12">
      <h1 className="text-3xl font-bold text-white mb-2">Workout Complete</h1>
      <p className="text-text-secondary mb-8">
        {hours > 0 ? `${hours}h ${mins}m` : `${mins} min`}
      </p>

      <div className="flex gap-6 mb-8">
        <div className="text-center">
          <p className="text-3xl font-bold text-white">{workout.exercises.length}</p>
          <p className="text-xs text-text-secondary mt-1">Exercises</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-white">{totalSets}</p>
          <p className="text-xs text-text-secondary mt-1">Sets</p>
        </div>
        {prs.length > 0 && (
          <div className="text-center">
            <p className="text-3xl font-bold text-pr-gold">{prs.length}</p>
            <p className="text-xs text-text-secondary mt-1">PRs</p>
          </div>
        )}
      </div>

      {/* Exercise breakdown */}
      <div className="w-full max-w-sm mb-8">
        {workout.exercises.map(e => (
          <div key={e.id} className="bg-surface rounded-lg px-4 py-3 mb-2">
            <h3 className="text-white text-sm font-medium mb-1">{e.displayName}</h3>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {e.sets.map((s, i) => (
                <span key={i} className="text-sm text-text-secondary">
                  {s.weight}{unit} &times; {s.reps}
                  {s.isPR && (
                    <span className="text-pr-gold ml-1 text-xs font-bold">PR</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onDone}
        className="w-full max-w-sm py-4 rounded-xl bg-accent text-white text-lg font-semibold
                   min-h-[56px] active:bg-accent-hover transition-colors"
      >
        Done
      </button>
    </div>
  );
}
