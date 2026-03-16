import { useState, useCallback } from 'react';
import type { Screen } from './types';
import { useSettings } from './hooks/useSettings';
import { useWorkout } from './hooks/useWorkout';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeScreen } from './components/HomeScreen';
import { ActiveWorkout } from './components/ActiveWorkout';
import { ExerciseSearch } from './components/ExerciseSearch';
import { ExerciseHistory } from './components/ExerciseHistory';
import { WorkoutSummary } from './components/WorkoutSummary';

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
  }
}
