import { useState } from 'react';

interface Props {
  defaultWeight: number;
  defaultReps: number;
  unit: string;
  onSave: (reps: number, weight: number) => void;
  onCancel: () => void;
}

export function AddSetForm({ defaultWeight, defaultReps, unit, onSave, onCancel }: Props) {
  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(defaultReps);

  const adjustWeight = (delta: number) => {
    setWeight(prev => Math.max(0, +(prev + delta).toFixed(1)));
  };

  const adjustReps = (delta: number) => {
    setReps(prev => Math.max(1, prev + delta));
  };

  const handleSave = () => {
    onSave(reps, weight);
  };

  return (
    <div className="bg-surface-2 rounded-xl p-4 mt-2">
      <div className="flex gap-4 mb-4">
        {/* Weight */}
        <div className="flex-1">
          <label className="text-xs text-text-secondary mb-1 block">Weight ({unit})</label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => adjustWeight(-2.5)}
              className="min-w-[44px] min-h-[44px] rounded-lg bg-surface text-white text-lg font-bold
                         flex items-center justify-center active:bg-border transition-colors"
            >
              -
            </button>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(Math.max(0, +e.target.value))}
              className="flex-1 bg-surface rounded-lg text-center text-white text-lg font-semibold
                         py-2 min-h-[44px] outline-none min-w-0"
              inputMode="decimal"
            />
            <button
              onClick={() => adjustWeight(2.5)}
              className="min-w-[44px] min-h-[44px] rounded-lg bg-surface text-white text-lg font-bold
                         flex items-center justify-center active:bg-border transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Reps */}
        <div className="flex-1">
          <label className="text-xs text-text-secondary mb-1 block">Reps</label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => adjustReps(-1)}
              className="min-w-[44px] min-h-[44px] rounded-lg bg-surface text-white text-lg font-bold
                         flex items-center justify-center active:bg-border transition-colors"
            >
              -
            </button>
            <input
              type="number"
              value={reps}
              onChange={e => setReps(Math.max(1, Math.round(+e.target.value)))}
              className="flex-1 bg-surface rounded-lg text-center text-white text-lg font-semibold
                         py-2 min-h-[44px] outline-none min-w-0"
              inputMode="numeric"
            />
            <button
              onClick={() => adjustReps(1)}
              className="min-w-[44px] min-h-[44px] rounded-lg bg-surface text-white text-lg font-bold
                         flex items-center justify-center active:bg-border transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg bg-surface text-text-secondary font-medium
                     min-h-[48px] active:bg-border transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 rounded-lg bg-accent text-white font-semibold
                     min-h-[48px] active:bg-accent-hover transition-colors"
        >
          Save Set
        </button>
      </div>
    </div>
  );
}
