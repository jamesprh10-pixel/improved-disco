import { useState, useCallback } from 'react';
import type { Screen, PuzzleType } from './types';
import { useSettings } from './hooks/useSettings';
import { useWorkout } from './hooks/useWorkout';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeScreen } from './components/HomeScreen';
import { ActiveWorkout } from './components/ActiveWorkout';
import { ExerciseSearch } from './components/ExerciseSearch';
import { ExerciseHistory } from './components/ExerciseHistory';
import { WorkoutSummary } from './components/WorkoutSummary';
import { CubeTimer } from './components/cube/CubeTimer';

export default function App() {
  const { settings, updateSettings } = useSettings();
  const {
    workout,
    startWorkout,
    addExercise,
    addSet,
    deleteSet,
    removeExercise,
    endWorkout,
  } = useWorkout();

  // Determine initial screen
  const getInitialScreen = (): Screen => {
    if (!settings?.onboardingComplete) return { type: 'welcome' };
    if (workout) return { type: 'workout' };
    return { type: 'home' };
  };

  const [screen, setScreen] = useState<Screen>(getInitialScreen);

  const unit = settings?.weightUnit ?? 'kg';

  const handleStartWorkout = useCallback(() => {
    startWorkout();
    setScreen({ type: 'workout' });
  }, [startWorkout]);

  const handleAddExercise = useCallback(() => {
    setScreen({ type: 'exercise-search' });
  }, []);

  const handleSelectExercise = useCallback(
    (name: string) => {
      addExercise(name);
      setScreen({ type: 'workout' });
    },
    [addExercise],
  );

  const handleEndWorkout = useCallback(() => {
    const completed = endWorkout();
    if (completed && completed.exercises.length > 0) {
      setScreen({ type: 'summary', workout: completed });
    } else {
      setScreen({ type: 'home' });
    }
  }, [endWorkout]);

  const handleViewHistory = useCallback((exerciseName: string) => {
    setScreen({ type: 'exercise-history', exerciseName });
  }, []);

  const handleBackFromHistory = useCallback(() => {
    if (workout) {
      setScreen({ type: 'workout' });
    } else {
      setScreen({ type: 'home' });
    }
  }, [workout]);

  switch (screen.type) {
    case 'welcome':
      return (
        <WelcomeScreen
          onComplete={s => {
            updateSettings(s);
            setScreen({ type: 'home' });
          }}
        />
      );

    case 'home':
      return (
        <HomeScreen
          onStartWorkout={handleStartWorkout}
          onOpenCubeTimer={() => setScreen({ type: 'cube-puzzle-select' })}
          settings={settings!}
        />
      );

    case 'workout':
      return workout ? (
        <ActiveWorkout
          workout={workout}
          unit={unit}
          onAddExercise={handleAddExercise}
          onAddSet={addSet}
          onDeleteSet={deleteSet}
          onRemoveExercise={removeExercise}
          onEndWorkout={handleEndWorkout}
          onViewHistory={handleViewHistory}
        />
      ) : (
        <HomeScreen
          onStartWorkout={handleStartWorkout}
          onOpenCubeTimer={() => setScreen({ type: 'cube-puzzle-select' })}
          settings={settings!}
        />
      );

    case 'exercise-search':
      return (
        <ExerciseSearch
          onSelect={handleSelectExercise}
          onCancel={() => setScreen({ type: 'workout' })}
          existingExercises={
            workout?.exercises.map(e => e.displayName) ?? []
          }
        />
      );

    case 'exercise-history':
      return (
        <ExerciseHistory
          exerciseName={screen.exerciseName}
          unit={unit}
          onBack={handleBackFromHistory}
        />
      );

    case 'summary':
      return (
        <WorkoutSummary
          workout={screen.workout}
          unit={unit}
          onDone={() => setScreen({ type: 'home' })}
        />
      );

    case 'cube-puzzle-select':
      return (
        <div className="flex flex-col min-h-dvh">
          <header className="flex items-center gap-3 px-5 pt-6 pb-4">
            <button
              onClick={() => setScreen({ type: 'home' })}
              className="text-text-secondary text-lg active:text-white p-1 -m-1"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-white">Cube Timer</h1>
          </header>
          <div className="px-5 grid grid-cols-2 gap-4 mt-4">
            {(['2x2', '3x3', '4x4', 'pyraminx'] as PuzzleType[]).map(p => (
              <button
                key={p}
                onClick={() => setScreen({ type: 'cube-timer', puzzle: p })}
                className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl bg-surface
                           active:bg-border transition-colors text-white"
              >
                <span className="text-4xl">{p === 'pyraminx' ? '🔺' : '🔲'}</span>
                <span className="font-semibold text-lg">
                  {p === 'pyraminx' ? 'Pyraminx' : p === '2x2' ? '2×2' : p === '3x3' ? '3×3' : '4×4'}
                </span>
              </button>
            ))}
          </div>
        </div>
      );

    case 'cube-timer':
      return (
        <CubeTimer
          puzzle={screen.puzzle}
          onBack={() => setScreen({ type: 'cube-puzzle-select' })}
        />
      );
  }
}
