import type { UserSettings } from '../types';

interface Props {
  onComplete: (settings: UserSettings) => void;
}

export function WelcomeScreen({ onComplete }: Props) {
  const select = (unit: 'kg' | 'lbs') => {
    onComplete({ weightUnit: unit, onboardingComplete: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6">
      <h1 className="text-4xl font-bold mb-2 text-white">Last Rep</h1>
      <p className="text-text-secondary mb-12 text-lg">
        Track the lift. Beat the lift.
      </p>

      <p className="text-text-secondary mb-6">Choose your weight unit</p>

      <div className="flex gap-4 w-full max-w-xs">
        <button
          onClick={() => select('kg')}
          className="flex-1 py-5 rounded-xl bg-surface text-white text-xl font-semibold
                     active:bg-surface-2 transition-colors min-h-[60px]"
        >
          kg
        </button>
        <button
          onClick={() => select('lbs')}
          className="flex-1 py-5 rounded-xl bg-surface text-white text-xl font-semibold
                     active:bg-surface-2 transition-colors min-h-[60px]"
        >
          lbs
        </button>
      </div>
    </div>
  );
}
