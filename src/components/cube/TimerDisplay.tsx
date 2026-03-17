export type TimerPhase = 'idle' | 'holding' | 'armed' | 'running' | 'stopped';

interface Props {
  time: number; // ms
  phase: TimerPhase;
  inspecting?: boolean;
  inspectionTime?: number; // ms remaining
}

function formatTime(ms: number): string {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const min = Math.floor(totalSec / 60);
  const csStr = cs.toString().padStart(2, '0');
  const secStr = sec.toString().padStart(2, '0');
  if (min > 0) return `${min}:${secStr}.${csStr}`;
  return `${sec}.${csStr}`;
}

export function TimerDisplay({ time, phase, inspecting, inspectionTime }: Props) {
  const color =
    phase === 'holding' ? 'text-red-500' :
    phase === 'armed' ? 'text-green-400' :
    'text-white';

  if (inspecting && inspectionTime !== undefined) {
    const secs = Math.ceil(inspectionTime / 1000);
    const label = secs <= 0 ? 'DNF' : secs <= -2 ? '+2' : `${secs}`;
    return (
      <div className="flex flex-col items-center justify-center py-6 select-none">
        <p className="text-text-secondary text-sm mb-1 uppercase tracking-widest">Inspection</p>
        <span className={`text-8xl font-mono font-bold tabular-nums ${secs <= 0 ? 'text-red-500' : secs <= 3 ? 'text-yellow-400' : 'text-white'}`}>
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-6 select-none">
      <span className={`text-8xl font-mono font-bold tabular-nums transition-colors ${color}`}>
        {phase === 'running' ? formatTime(time) : formatTime(time)}
      </span>
    </div>
  );
}
