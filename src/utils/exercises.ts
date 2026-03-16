export interface ExerciseCategory {
  name: string;
  exercises: string[];
}

export const DEFAULT_EXERCISES: ExerciseCategory[] = [
  {
    name: 'Push',
    exercises: [
      'Bench Press',
      'Incline Bench Press',
      'Overhead Press',
      'Dumbbell Shoulder Press',
      'Dumbbell Bench Press',
      'Dips',
      'Tricep Pushdown',
      'Chest Fly',
    ],
  },
  {
    name: 'Pull',
    exercises: [
      'Deadlift',
      'Barbell Row',
      'Pull-Ups',
      'Lat Pulldown',
      'Dumbbell Row',
      'Face Pulls',
      'Barbell Curl',
      'Dumbbell Curl',
      'Hammer Curl',
    ],
  },
  {
    name: 'Legs',
    exercises: [
      'Squat',
      'Front Squat',
      'Leg Press',
      'Romanian Deadlift',
      'Leg Curl',
      'Leg Extension',
      'Calf Raise',
      'Bulgarian Split Squat',
      'Hip Thrust',
      'Lunges',
    ],
  },
  {
    name: 'Core',
    exercises: [
      'Plank',
      'Hanging Leg Raise',
      'Cable Crunch',
      'Ab Wheel Rollout',
    ],
  },
];

export function getAllDefaultExercises(): string[] {
  return DEFAULT_EXERCISES.flatMap(c => c.exercises);
}
