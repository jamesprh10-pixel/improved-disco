import type { Workout, PersonalRecord, UserSettings } from './types';

const KEYS = {
  workouts: 'lastrep_workouts',
  active: 'lastrep_active_workout',
  prs: 'lastrep_prs',
  settings: 'lastrep_settings',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Settings
export function getSettings(): UserSettings | null {
  return read<UserSettings | null>(KEYS.settings, null);
}

export function saveSettings(settings: UserSettings): void {
  write(KEYS.settings, settings);
}

// Workouts
export function getWorkouts(): Workout[] {
  return read<Workout[]>(KEYS.workouts, []);
}

export function saveWorkouts(workouts: Workout[]): void {
  write(KEYS.workouts, workouts);
}

export function addCompletedWorkout(workout: Workout): void {
  const workouts = getWorkouts();
  workouts.unshift(workout);
  saveWorkouts(workouts);
}

// Active workout
export function getActiveWorkout(): Workout | null {
  return read<Workout | null>(KEYS.active, null);
}

export function saveActiveWorkout(workout: Workout | null): void {
  if (workout) {
    write(KEYS.active, workout);
  } else {
    localStorage.removeItem(KEYS.active);
  }
}

// Last session for an exercise
export function getLastSession(exerciseName: string): WorkoutExerciseResult | null {
  const normalized = exerciseName.toLowerCase();
  const workouts = getWorkouts();
  for (const workout of workouts) {
    const exercise = workout.exercises.find(e => e.name === normalized);
    if (exercise && exercise.sets.length > 0) {
      return { exercise, date: workout.startedAt };
    }
  }
  return null;
}

export interface WorkoutExerciseResult {
  exercise: Workout['exercises'][0];
  date: number;
}

// PRs
export function getPRs(): Record<string, PersonalRecord> {
  return read<Record<string, PersonalRecord>>(KEYS.prs, {});
}

export function getPR(exerciseName: string): PersonalRecord | null {
  const prs = getPRs();
  return prs[exerciseName.toLowerCase()] ?? null;
}

export function updatePR(pr: PersonalRecord): void {
  const prs = getPRs();
  prs[pr.exerciseName.toLowerCase()] = pr;
  write(KEYS.prs, prs);
}

// Get all unique exercise names the user has ever logged
export function getUserExerciseNames(): string[] {
  const workouts = getWorkouts();
  const names = new Set<string>();
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      names.add(exercise.displayName);
    }
  }
  return Array.from(names).sort();
}

// ID generator
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
