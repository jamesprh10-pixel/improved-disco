import type { PuzzleType } from '../types';

const AXES: Record<string, number> = {
  U: 0, D: 0,
  F: 1, B: 1,
  L: 2, R: 2,
};

function pickMove(
  faces: string[],
  modifiers: string[],
  lastFace: string | null,
  lastAxis: number | null,
): [string, string, number] {
  const available = faces.filter(f => {
    if (f === lastFace) return false;
    if (lastAxis !== null && AXES[f[0]] === lastAxis) return false;
    return true;
  });
  const face = available[Math.floor(Math.random() * available.length)];
  const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
  return [face, mod, AXES[face[0]] ?? -1];
}

function gen3x3(count: number, extraFaces: string[] = []): string {
  const faces = ['U', 'D', 'F', 'B', 'L', 'R', ...extraFaces];
  const mods = ['', "'", '2'];
  const moves: string[] = [];
  let lastFace: string | null = null;
  let lastAxis: number | null = null;

  for (let i = 0; i < count; i++) {
    const [face, mod, axis] = pickMove(faces, mods, lastFace, lastAxis);
    moves.push(face + mod);
    lastFace = face;
    lastAxis = axis;
  }
  return moves.join(' ');
}

function gen2x2(): string {
  const faces = ['U', 'F', 'R'];
  const mods = ['', "'", '2'];
  const count = 9 + Math.floor(Math.random() * 3); // 9-11
  const moves: string[] = [];
  let lastFace: string | null = null;

  for (let i = 0; i < count; i++) {
    const available = faces.filter(f => f !== lastFace);
    const face = available[Math.floor(Math.random() * available.length)];
    const mod = mods[Math.floor(Math.random() * mods.length)];
    moves.push(face + mod);
    lastFace = face;
  }
  return moves.join(' ');
}

function gen4x4(): string {
  // Normal faces + wide variants (treat Uw/U as same "face group" for no-repeat)
  const normalFaces = ['U', 'D', 'F', 'B', 'L', 'R'];
  const wideFaces = ['Uw', 'Dw', 'Fw', 'Bw', 'Lw', 'Rw'];
  const allFaces = [...normalFaces, ...wideFaces];
  const mods = ['', "'", '2'];
  const moves: string[] = [];
  let lastBase: string | null = null;
  let lastAxis: number | null = null;

  for (let i = 0; i < 40; i++) {
    const available = allFaces.filter(f => {
      const base = f.replace('w', '');
      if (base === lastBase) return false;
      if (lastAxis !== null && AXES[base] === lastAxis) return false;
      return true;
    });
    const face = available[Math.floor(Math.random() * available.length)];
    const mod = mods[Math.floor(Math.random() * mods.length)];
    moves.push(face + mod);
    lastBase = face.replace('w', '');
    lastAxis = AXES[face[0]] ?? -1;
  }
  return moves.join(' ');
}

function genPyraminx(): string {
  const mainFaces = ['U', 'L', 'R', 'B'];
  const mods = ['', "'"];
  const count = 10 + Math.floor(Math.random() * 2); // 10-11
  const moves: string[] = [];
  let lastFace: string | null = null;

  for (let i = 0; i < count; i++) {
    const available = mainFaces.filter(f => f !== lastFace);
    const face = available[Math.floor(Math.random() * available.length)];
    const mod = mods[Math.floor(Math.random() * mods.length)];
    moves.push(face + mod);
    lastFace = face;
  }

  // Tips: each of u/l/r/b randomly included with random prime
  const tips = ['u', 'l', 'r', 'b'];
  const tipMoves: string[] = [];
  for (const t of tips) {
    if (Math.random() > 0.5) {
      tipMoves.push(t + (Math.random() > 0.5 ? "'" : ''));
    }
  }

  return [...moves, ...tipMoves].join(' ');
}

export function generateScramble(puzzle: PuzzleType): string {
  switch (puzzle) {
    case '2x2': return gen2x2();
    case '3x3': return gen3x3(20);
    case '4x4': return gen4x4();
    case 'pyraminx': return genPyraminx();
  }
}
