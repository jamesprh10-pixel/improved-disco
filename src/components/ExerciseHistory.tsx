import { getWorkouts, getPR } from '../store';

interface Props {
  exerciseName: string;
  unit: string;
  onBack: () => void;
}

export function ExerciseHistory({ exerciseName, unit, onBack }: Props) {
  const normalized = exerciseName.toLowerCase();
  const workouts = getWorkouts();
  const pr = getPR(exerciseName);

  // Find all workouts containing this exercise
  const history = workouts
    .map(w => {
      const exercise = w.exercises.find(e => e.name === normalized);
      if (!exercise || exercise.sets.length === 0) return null;
      return { date: w.startedAt, sets: exercise.sets, displayName: exercise.displayName };
    })
    .filter(Boolean) as { date: number; sets: typeof workouts[0]['exercises'][0]['sets']; displayName: string }[];

  const displayName = history[0]?.displayName ?? exerciseName;

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="flex items-center gap-3 px-4 pt-5 pb-3">
        <button
          onClick={onBack}
          className="text-text-secondary text-sm min-w-[44px] min-h-[44px] flex items-center"
        >
          &larr; Back
        </button>
        <h1 className="text-lg font-bold text-white">{displayName}</h1>
      </header>

      <div className="flex-1 px-4 pb-6 overflow-y-auto">
        {pr && (
          <div className="bg-pr-gold/10 border border-pr-gold/30 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs text-pr-gold font-medium uppercase tracking-wide mb-1">
              Personal Record
            </p>
            <p className="text-white text-lg font-bold">
              {pr.weight}{unit} &times; {pr.reps}
            </p>
            <p className="text-text-secondary text-xs mt-0.5">
              {new Date(pr.date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        )}

        {history.length === 0 && (
          <p className="text-text-secondary text-center mt-8">No history yet</p>
        )}

        {history.map((entry, idx) => (
          <div key={idx} className="bg-surface rounded-lg px-4 py-3 mb-2">
            <p className="text-xs text-text-secondary mb-1">
              {new Date(entry.date).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {entry.sets.map((s, i) => (
                <span key={i} className="text-sm text-white">
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
    </div>
  );
}
