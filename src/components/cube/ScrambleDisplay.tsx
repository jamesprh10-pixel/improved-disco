import type { PuzzleType } from '../../types';

interface Props {
  scramble: string;
  puzzle: PuzzleType;
  onNewScramble: () => void;
  disabled?: boolean;
}

const PUZZLE_LABELS: Record<PuzzleType, string> = {
  '2x2': '2×2',
  '3x3': '3×3',
  '4x4': '4×4',
  pyraminx: 'Pyraminx',
};

export function ScrambleDisplay({ scramble, puzzle, onNewScramble, disabled }: Props) {
  return (
    <div className="px-4 py-3 bg-surface rounded-xl mx-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-secondary uppercase tracking-widest font-medium">
          {PUZZLE_LABELS[puzzle]} Scramble
        </span>
        <button
          onClick={onNewScramble}
          disabled={disabled}
          className="text-accent text-sm font-medium active:text-accent-hover disabled:opacity-40 p-1 -m-1"
          title="New scramble"
        >
          ↻ Skip
        </button>
      </div>
      <p className="font-mono text-white text-sm leading-relaxed break-words">
        {scramble}
      </p>
    </div>
  );
}
