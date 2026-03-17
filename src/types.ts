export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  isPR: boolean;
  timestamp: number;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  displayName: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  startedAt: number;
  endedAt?: number;
  exercises: WorkoutExercise[];
}

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: number;
  workoutId: string;
}

export interface UserSettings {
  weightUnit: 'kg' | 'lbs';
  onboardingComplete: boolean;
}

export type Screen =
  | { type: 'welcome' }
  | { type: 'home' }
  | { type: 'workout' }
  | { type: 'exercise-search' }
  | { type: 'exercise-history'; exerciseName: string }
  | { type: 'summary'; workout: Workout };
