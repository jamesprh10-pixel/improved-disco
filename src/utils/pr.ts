import type { PersonalRecord } from '../types';
import { getPR, updatePR } from '../store';

export function checkAndUpdatePR(
  exerciseName: string,
  weight: number,
  reps: number,
  workoutId: string,
): boolean {
  const currentPR = getPR(exerciseName);
  const isNewPR = !currentPR || weight > currentPR.weight;

  if (isNewPR && weight > 0) {
    const pr: PersonalRecord = {
      exerciseName: exerciseName.toLowerCase(),
      weight,
      reps,
      date: Date.now(),
      workoutId,
    };
    updatePR(pr);
    return true;
  }
  return false;
}
