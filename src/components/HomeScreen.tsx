import { getWorkouts } from '../store';
import type { UserSettings } from '../types';

interface Props {
  onStartWorkout: () => void;
  onOpenCubeTimer: () => void;
  settings: UserSettings;
}

export function HomeScreen({ onStartWorkout, onOpenCubeTimer, settings }: Props) {
  const workouts = getWorkouts().slice(0, 5);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white">Last Rep</h1>
      </header>

      <div className="px-5 flex-1">
        <button
          onClick={onStartWorkout}
          className="w-full py-5 rounded-xl bg-accent text-white text-lg font-semibold
                     active:bg-accent-hover transition-colors min-h-[56px]"
        >
          Start Workout
        </button>

        <button
          onClick={onOpenCubeTimer}
          className="w-full py-4 rounded-xl bg-surface text-white text-lg font-semibold
                     active:bg-border transition-colors min-h-[56px] mt-3 flex items-center justify-center gap-2"
        >
          <span>🔲</span> Cube Timer
        </button>

        {workouts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3">
              Recent Workouts
            </h2>
            <div className="flex flex-col gap-2">
              {workouts.map(w => (
                <div
                  key={w.id}
                  className="bg-surface rounded-lg px-4 py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-white text-sm font-medium">
                      {w.exercises.map(e => e.displayName).join(', ')}
                    </p>
                    <p className="text-text-secondary text-xs mt-0.5">
                      {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''} &middot;{' '}
                      {w.exercises.reduce((sum, e) => sum + e.sets.length, 0)} sets
                    </p>
                  </div>
                  <span className="text-text-secondary text-xs whitespace-nowrap ml-3">
                    {formatDate(w.startedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {workouts.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-text-secondary">No workouts yet</p>
            <p className="text-text-secondary text-sm mt-1">
              Tap above to log your first session
            </p>
          </div>
        )}
      </div>

      <footer className="px-5 py-4 text-center">
        <p className="text-xs text-text-secondary">
          Weights in {settings.weightUnit}
        </p>
      </footer>
    </div>
  );
}
