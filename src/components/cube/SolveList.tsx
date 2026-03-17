import type { Solve } from '../../types';
import { formatTime } from '../../utils/cubeStats';

interface Props {
  solves: Solve[];
  onDelete: (id: string) => void;
  onToggleDnf: (solve: Solve) => void;
  onTogglePlusTwo: (solve: Solve) => void;
}

export function SolveList({ solves, onDelete, onToggleDnf, onTogglePlusTwo }: Props) {
  if (solves.length === 0) {
    return (
      <div className="text-center py-6 text-text-secondary text-sm">
        No solves yet this session
      </div>
    );
  }

  function displayTime(solve: Solve): string {
    if (solve.dnf) return 'DNF';
    const t = solve.time + (solve.plusTwo ? 2000 : 0);
    return formatTime(t) + (solve.plusTwo ? '+' : '');
  }

  return (
    <div className="overflow-y-auto max-h-48 flex flex-col gap-1 px-4">
      {solves.map((solve, i) => (
        <div
          key={solve.id}
          className="flex items-center justify-between bg-surface rounded-lg px-3 py-2"
        >
          <span className="text-text-secondary text-xs w-7 shrink-0">{solves.length - i}</span>
          <span className={`font-mono text-sm font-medium flex-1 ${solve.dnf ? 'text-red-400' : solve.plusTwo ? 'text-yellow-400' : 'text-white'}`}>
            {displayTime(solve)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTogglePlusTwo(solve)}
              className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${
                solve.plusTwo ? 'bg-yellow-500/20 text-yellow-400' : 'text-text-secondary active:text-white'
              }`}
              disabled={solve.dnf}
            >
              +2
            </button>
            <button
              onClick={() => onToggleDnf(solve)}
              className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${
                solve.dnf ? 'bg-red-500/20 text-red-400' : 'text-text-secondary active:text-white'
              }`}
            >
              DNF
            </button>
            <button
              onClick={() => onDelete(solve.id)}
              className="text-text-secondary text-sm active:text-red-400 px-1"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
