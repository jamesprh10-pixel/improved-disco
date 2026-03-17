import type { Solve } from '../../types';
import { calcAo, calcMean, bestTime, formatStat } from '../../utils/cubeStats';

interface Props {
  solves: Solve[];
}

export function SessionStats({ solves }: Props) {
  const best = formatStat(bestTime(solves));
  const ao5 = formatStat(calcAo(solves, 5));
  const ao12 = formatStat(calcAo(solves, 12));
  const mean = formatStat(calcMean(solves));

  const stats = [
    { label: 'Best', value: best },
    { label: 'Ao5', value: ao5 },
    { label: 'Ao12', value: ao12 },
    { label: 'Mean', value: mean },
  ];

  return (
    <div className="flex justify-around px-4 py-3 bg-surface rounded-xl mx-4">
      {stats.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center gap-0.5">
          <span className="text-xs text-text-secondary uppercase tracking-wider">{label}</span>
          <span className="text-white font-mono text-sm font-semibold tabular-nums">{value}</span>
        </div>
      ))}
    </div>
  );
}
