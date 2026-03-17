import { useState, useEffect, useRef, useCallback } from 'react';
import type { PuzzleType, Solve } from '../../types';
import { generateScramble } from '../../utils/scrambler';
import { applyScramble } from '../../utils/cubeState';
import { generateId, getCubeSolves, addCubeSolve, deleteCubeSolve, updateCubeSolve } from '../../store';
import { TimerDisplay, type TimerPhase } from './TimerDisplay';
import { ScrambleDisplay } from './ScrambleDisplay';
import { CubePreview } from './CubePreview';
import { SessionStats } from './SessionStats';
import { SolveList } from './SolveList';
import type { CubeState, PyraState } from '../../utils/cubeState';

const HOLD_MS = 300;
const INSPECTION_SECS = 15;

interface Props {
  puzzle: PuzzleType;
  onBack: () => void;
}

const PUZZLE_LABELS: Record<PuzzleType, string> = {
  '2x2': '2×2',
  '3x3': '3×3',
  '4x4': '4×4',
  pyraminx: 'Pyraminx',
};

export function CubeTimer({ puzzle, onBack }: Props) {
  const [scramble, setScramble] = useState(() => generateScramble(puzzle));
  const [cubeState, setCubeState] = useState<CubeState | PyraState>(() =>
    applyScramble(puzzle, generateScramble(puzzle))
  );
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [solves, setSolves] = useState<Solve[]>(() => getCubeSolves(puzzle));
  const [inspectionEnabled, setInspectionEnabled] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [inspectionMs, setInspectionMs] = useState(INSPECTION_SECS * 1000);

  const startRef = useRef<number>(0);
  const holdStartRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inspectionStartRef = useRef<number>(0);
  const inspectionRafRef = useRef<number>(0);

  function newScramble() {
    const s = generateScramble(puzzle);
    setScramble(s);
    setCubeState(applyScramble(puzzle, s));
  }

  // Tick the running timer
  const tick = useCallback(() => {
    setElapsed(Date.now() - startRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopTick = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  // Inspection tick
  const inspectionTick = useCallback(() => {
    const remaining = (INSPECTION_SECS * 1000) - (Date.now() - inspectionStartRef.current);
    setInspectionMs(remaining);
    inspectionRafRef.current = requestAnimationFrame(inspectionTick);
  }, []);

  const stopInspection = useCallback(() => {
    cancelAnimationFrame(inspectionRafRef.current);
  }, []);

  function startInspection() {
    inspectionStartRef.current = Date.now();
    setInspectionMs(INSPECTION_SECS * 1000);
    setInspecting(true);
    inspectionRafRef.current = requestAnimationFrame(inspectionTick);
  }

  function startTimer() {
    stopInspection();
    setInspecting(false);
    startRef.current = Date.now();
    setElapsed(0);
    setPhase('running');
    rafRef.current = requestAnimationFrame(tick);
  }

  function stopTimer() {
    stopTick();
    const finalTime = Date.now() - startRef.current;
    setElapsed(finalTime);
    setPhase('stopped');

    const solve: Solve = {
      id: generateId(),
      time: finalTime,
      scramble,
      puzzle,
      timestamp: Date.now(),
    };
    addCubeSolve(solve);
    setSolves(prev => [solve, ...prev]);

    // Generate next scramble after a short delay
    setTimeout(() => {
      newScramble();
      setPhase('idle');
    }, 600);
  }

  // Input handling
  const handlePressStart = useCallback(() => {
    if (phase === 'running') {
      stopTimer();
      return;
    }
    if (phase === 'idle' || phase === 'stopped') {
      holdStartRef.current = Date.now();
      setPhase('holding');
      holdTimerRef.current = setTimeout(() => {
        setPhase('armed');
      }, HOLD_MS);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handlePressEnd = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (phase === 'armed') {
      if (inspectionEnabled) {
        startInspection();
        setPhase('idle');
      } else {
        startTimer();
      }
    } else if (phase === 'holding') {
      setPhase('idle');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, inspectionEnabled]);

  const handleInspectionPressStart = useCallback(() => {
    if (inspecting) {
      holdStartRef.current = Date.now();
      setPhase('holding');
      holdTimerRef.current = setTimeout(() => {
        setPhase('armed');
      }, HOLD_MS);
    }
  }, [inspecting]);

  const handleInspectionPressEnd = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (phase === 'armed' && inspecting) {
      startTimer();
    } else if (phase === 'holding') {
      setPhase('idle');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, inspecting]);

  // Keyboard support
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopTick();
        stopInspection();
        setPhase('idle');
        setInspecting(false);
        setElapsed(0);
        return;
      }
      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        if (inspecting) {
          handleInspectionPressStart();
        } else {
          handlePressStart();
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (inspecting) {
          handleInspectionPressEnd();
        } else {
          handlePressEnd();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handlePressStart, handlePressEnd, handleInspectionPressStart, handleInspectionPressEnd, inspecting, stopTick, stopInspection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTick();
      stopInspection();
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, [stopTick, stopInspection]);

  function handleDelete(id: string) {
    deleteCubeSolve(id, puzzle);
    setSolves(prev => prev.filter(s => s.id !== id));
  }

  function handleToggleDnf(solve: Solve) {
    const updated = { ...solve, dnf: !solve.dnf, plusTwo: solve.dnf ? solve.plusTwo : false };
    updateCubeSolve(updated);
    setSolves(prev => prev.map(s => s.id === updated.id ? updated : s));
  }

  function handleTogglePlusTwo(solve: Solve) {
    if (solve.dnf) return;
    const updated = { ...solve, plusTwo: !solve.plusTwo };
    updateCubeSolve(updated);
    setSolves(prev => prev.map(s => s.id === updated.id ? updated : s));
  }

  const isTimerActive = phase === 'running' || phase === 'holding' || phase === 'armed';

  return (
    <div className="flex flex-col min-h-dvh select-none">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-5 pb-3">
        <button
          onClick={onBack}
          className="text-text-secondary text-lg active:text-white p-1 -m-1"
        >
          ←
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-white font-semibold text-lg">{PUZZLE_LABELS[puzzle]}</h1>
          <span className="text-text-secondary text-sm">{solves.length} solve{solves.length !== 1 ? 's' : ''}</span>
        </div>
        <button
          onClick={() => setInspectionEnabled(v => !v)}
          className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
            inspectionEnabled ? 'bg-accent/20 text-accent' : 'text-text-secondary'
          }`}
          title="Toggle inspection time"
        >
          Insp.
        </button>
      </header>

      {/* Scramble + preview (hidden while timer running) */}
      {!isTimerActive && (
        <>
          <ScrambleDisplay
            scramble={scramble}
            puzzle={puzzle}
            onNewScramble={newScramble}
            disabled={phase === 'stopped'}
          />
          <div className="mt-2">
            <CubePreview puzzle={puzzle} state={cubeState} />
          </div>
        </>
      )}

      {/* Timer interaction zone */}
      <div
        className="flex-1 flex flex-col items-center justify-center cursor-pointer"
        style={{ touchAction: 'none', userSelect: 'none' }}
        onPointerDown={e => {
          e.preventDefault();
          if (inspecting) handleInspectionPressStart();
          else handlePressStart();
        }}
        onPointerUp={e => {
          e.preventDefault();
          if (inspecting) handleInspectionPressEnd();
          else handlePressEnd();
        }}
        onPointerCancel={() => {
          if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
          if (phase === 'holding' || phase === 'armed') setPhase('idle');
        }}
      >
        <TimerDisplay
          time={elapsed}
          phase={phase}
          inspecting={inspecting}
          inspectionTime={inspectionMs}
        />
        {phase === 'idle' && !inspecting && (
          <p className="text-text-secondary text-sm mt-2">
            Hold space or tap to start
          </p>
        )}
        {inspecting && phase === 'idle' && (
          <p className="text-text-secondary text-sm mt-2">
            Hold space or tap when ready
          </p>
        )}
      </div>

      {/* Stats + solve list (hidden while timer running) */}
      {!isTimerActive && (
        <div className="flex flex-col gap-3 pb-6">
          <SessionStats solves={solves} />
          <SolveList
            solves={solves}
            onDelete={handleDelete}
            onToggleDnf={handleToggleDnf}
            onTogglePlusTwo={handleTogglePlusTwo}
          />
        </div>
      )}
    </div>
  );
}
