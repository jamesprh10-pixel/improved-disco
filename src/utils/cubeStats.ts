import type { Solve } from '../types';

export function formatTime(ms: number): string {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const min = Math.floor(totalSec / 60);

  const csStr = cs.toString().padStart(2, '0');
  const secStr = sec.toString().padStart(2, '0');

  if (min > 0) {
    return `${min}:${secStr}.${csStr}`;
  }
  return `${sec}.${csStr}`;
}

function effectiveTime(solve: Solve): number {
  if (solve.dnf) return Infinity;
  return solve.time + (solve.plusTwo ? 2000 : 0);
}

export function calcAo(solves: Solve[], n: number): number | null {
  if (solves.length < n) return null;
  const window = solves.slice(0, n).map(effectiveTime);
  const dnfCount = window.filter(t => t === Infinity).length;
  if (dnfCount > 1) return Infinity;

  const sorted = [...window].sort((a, b) => a - b);
  // Drop best and worst
  const trimmed = sorted.slice(1, n - 1);
  const sum = trimmed.reduce((a, b) => a + b, 0);
  return sum / trimmed.length;
}

export function calcMean(solves: Solve[]): number | null {
  if (solves.length === 0) return null;
  const times = solves.map(effectiveTime);
  if (times.some(t => t === Infinity)) return null;
  return times.reduce((a, b) => a + b, 0) / times.length;
}

export function bestTime(solves: Solve[]): number | null {
  if (solves.length === 0) return null;
  const times = solves.map(effectiveTime).filter(t => t !== Infinity);
  if (times.length === 0) return null;
  return Math.min(...times);
}

export function formatStat(ms: number | null): string {
  if (ms === null) return '—';
  if (ms === Infinity) return 'DNF';
  return formatTime(ms);
}
