import { useState, useCallback } from 'react';
import type { Workout, WorkoutExercise, WorkoutSet } from '../types';
import {
  getActiveWorkout,
  saveActiveWorkout,
  addCompletedWorkout,
  generateId,
} from '../store';
import { checkAndUpdatePR } from '../utils/pr';

export function useWorkout() {
  const [workout, setWorkout] = useState<Workout | null>(getActiveWorkout);

  const persist = useCallback((w: Workout) => {
    saveActiveWorkout(w);
    setWorkout({ ...w });
  }, []);

  const startWorkout = useCallback(() => {
    const w: Workout = {
      id: generateId(),
      startedAt: Date.now(),
      exercises: [],
    };
    persist(w);
    return w;
  }, [persist]);

  const addExercise = useCallback(
    (displayName: string) => {
      if (!workout) return;
      const exercise: WorkoutExercise = {
        id: generateId(),
        name: displayName.toLowerCase(),
        displayName,
        sets: [],
      };
      workout.exercises.push(exercise);
      persist(workout);
    },
    [workout, persist],
  );

  const addSet = useCallback(
    (
      exerciseId: string,
      reps: number,
      weight: number,
    ): { set: WorkoutSet; isPR: boolean } | null => {
      if (!workout) return null;
      const exercise = workout.exercises.find(e => e.id === exerciseId);
      if (!exercise) return null;

      const isPR = checkAndUpdatePR(exercise.name, weight, reps, workout.id);
      const newSet: WorkoutSet = {
        id: generateId(),
        reps,
        weight,
        isPR,
        timestamp: Date.now(),
      };
      exercise.sets.push(newSet);
      persist(workout);
      return { set: newSet, isPR };
    },
    [workout, persist],
  );

  const deleteSet = useCallback(
    (exerciseId: string, setId: string) => {
      if (!workout) return;
      const exercise = workout.exercises.find(e => e.id === exerciseId);
      if (!exercise) return;
      exercise.sets = exercise.sets.filter(s => s.id !== setId);
      persist(workout);
    },
    [workout, persist],
  );

  const removeExercise = useCallback(
    (exerciseId: string) => {
      if (!workout) return;
      workout.exercises = workout.exercises.filter(e => e.id !== exerciseId);
      persist(workout);
    },
    [workout, persist],
  );

  const endWorkout = useCallback((): Workout | null => {
    if (!workout) return null;
    const completed = {
      ...workout,
      endedAt: Date.now(),
      exercises: workout.exercises.filter(e => e.sets.length > 0),
    };
    if (completed.exercises.length > 0) {
      addCompletedWorkout(completed);
    }
    saveActiveWorkout(null);
    setWorkout(null);
    return completed;
  }, [workout]);

  return {
    workout,
    startWorkout,
    addExercise,
    addSet,
    deleteSet,
    removeExercise,
    endWorkout,
  };
}
