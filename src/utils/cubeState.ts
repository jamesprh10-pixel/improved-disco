import type { PuzzleType } from '../types';

// Face indices: 0=U, 1=D, 2=F, 3=B, 4=L, 5=R
// Colors: W=white(U), Y=yellow(D), G=green(F), B=blue(B), O=orange(L), R=red(R)
export type FaceColor = 'W' | 'Y' | 'G' | 'B' | 'O' | 'R';
export type CubeState = FaceColor[][];

const FACE_COLORS: FaceColor[] = ['W', 'Y', 'G', 'B', 'O', 'R'];

export function solvedState(n: number): CubeState {
  return FACE_COLORS.map(c => Array(n * n).fill(c) as FaceColor[]);
}

// Rotate a face array clockwise
function rotateFaceCW(face: FaceColor[], n: number): FaceColor[] {
  const out = Array(n * n) as FaceColor[];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      out[c * n + (n - 1 - r)] = face[r * n + c];
    }
  }
  return out;
}

function rotateFaceCCW(face: FaceColor[], n: number): FaceColor[] {
  const out = Array(n * n) as FaceColor[];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      out[(n - 1 - c) * n + r] = face[r * n + c];
    }
  }
  return out;
}

function rotateFace180(face: FaceColor[]): FaceColor[] {
  return [...face].reverse() as FaceColor[];
}

// Cycle stickers among 4 faces at given index arrays
// Each entry: [faceIdx, indices[]]
function cycle4(
  state: CubeState,
  groups: [number, number[]][],
  times: number,
): CubeState {
  const s = state.map(f => [...f]) as CubeState;

  for (let t = 0; t < times; t++) {
    const prev = groups.map(([fi, idxs]) => idxs.map(i => s[fi][i]));
    for (let g = 0; g < 4; g++) {
      const [fi, idxs] = groups[(g + 1) % 4];
      const src = prev[g];
      idxs.forEach((i, j) => { s[fi][i] = src[j]; });
    }
  }
  return s;
}

// Helper: build row indices for a face
function row(n: number, r: number): number[] {
  return Array.from({ length: n }, (_, i) => r * n + i);
}
function rowRev(n: number, r: number): number[] {
  return Array.from({ length: n }, (_, i) => r * n + (n - 1 - i));
}
function col(n: number, c: number): number[] {
  return Array.from({ length: n }, (_, i) => i * n + c);
}
function colRev(n: number, c: number): number[] {
  return Array.from({ length: n }, (_, i) => (n - 1 - i) * n + c);
}

// Apply a single move to the cube state (for NxN cubes, layer=0 means outer)
function applyNxNMove(state: CubeState, move: string, n: number): CubeState {
  const base = move.replace(/[2']/g, '').replace('w', '');
  const isWide = move.includes('w');
  const isPrime = move.includes("'");
  const is180 = move.includes('2');
  const times = is180 ? 2 : isPrime ? 3 : 1;

  let s = state.map(f => [...f]) as CubeState;

  // Determine which layers to cycle
  const layers = isWide ? [0, 1] : [0];

  switch (base) {
    case 'U': {
      // Rotate U face
      for (let t = 0; t < times; t++) {
        s[0] = isPrime && !is180 ? rotateFaceCCW(s[0], n)
          : is180 ? rotateFace180(s[0])
          : rotateFaceCW(s[0], n);
      }
      for (const layer of layers) {
        // F top row → R top row → B top row → L top row (CW)
        s = cycle4(s, [
          [2, row(n, layer)],
          [5, row(n, layer)],
          [3, row(n, layer)],
          [4, row(n, layer)],
        ], times);
      }
      break;
    }
    case 'D': {
      for (let t = 0; t < times; t++) {
        s[1] = isPrime && !is180 ? rotateFaceCCW(s[1], n)
          : is180 ? rotateFace180(s[1])
          : rotateFaceCW(s[1], n);
      }
      for (const layer of layers) {
        const r = n - 1 - layer;
        // F bottom → L bottom → B bottom → R bottom (CW = F→L→B→R)
        s = cycle4(s, [
          [2, row(n, r)],
          [4, row(n, r)],
          [3, row(n, r)],
          [5, row(n, r)],
        ], times);
      }
      break;
    }
    case 'F': {
      for (let t = 0; t < times; t++) {
        s[2] = isPrime && !is180 ? rotateFaceCCW(s[2], n)
          : is180 ? rotateFace180(s[2])
          : rotateFaceCW(s[2], n);
      }
      for (const layer of layers) {
        const r = n - 1 - layer;
        // U bottom row → R left col → D top row (rev) → L right col (rev)
        s = cycle4(s, [
          [0, row(n, r)],
          [5, col(n, layer)],
          [1, rowRev(n, layer)],
          [4, colRev(n, r)],
        ], times);
      }
      break;
    }
    case 'B': {
      for (let t = 0; t < times; t++) {
        s[3] = isPrime && !is180 ? rotateFaceCCW(s[3], n)
          : is180 ? rotateFace180(s[3])
          : rotateFaceCW(s[3], n);
      }
      for (const layer of layers) {
        const r = layer;
        // U top row (rev) → L left col → D bottom row → R right col (rev)
        s = cycle4(s, [
          [0, rowRev(n, r)],
          [4, col(n, layer)],
          [1, row(n, n - 1 - layer)],
          [5, colRev(n, n - 1 - layer)],
        ], times);
      }
      break;
    }
    case 'L': {
      for (let t = 0; t < times; t++) {
        s[4] = isPrime && !is180 ? rotateFaceCCW(s[4], n)
          : is180 ? rotateFace180(s[4])
          : rotateFaceCW(s[4], n);
      }
      for (const layer of layers) {
        const c = layer;
        // U left col → F left col → D left col → B right col (rev)
        s = cycle4(s, [
          [0, col(n, c)],
          [2, col(n, c)],
          [1, col(n, c)],
          [3, colRev(n, n - 1 - c)],
        ], times);
      }
      break;
    }
    case 'R': {
      for (let t = 0; t < times; t++) {
        s[5] = isPrime && !is180 ? rotateFaceCCW(s[5], n)
          : is180 ? rotateFace180(s[5])
          : rotateFaceCW(s[5], n);
      }
      for (const layer of layers) {
        const c = n - 1 - layer;
        // U right col → B left col (rev) → D right col → F right col
        s = cycle4(s, [
          [0, col(n, c)],
          [3, colRev(n, n - 1 - c)],
          [1, col(n, c)],
          [2, col(n, c)],
        ], times);
      }
      break;
    }
  }

  return s;
}

// ---- Pyraminx ----
// 4 faces: 0=F(front/green), 1=L(left/red), 2=R(right/blue), 3=B(bottom/yellow)
// Each face: 9 stickers in triangular arrangement (row-major, pointing-up triangles first)
// Layout indices per face:
//   0 1 2
//  3 4 5
// 6 7 8
// where triangles 0,2,5,8 point up and others point down (or vice versa)
// We use a simple flat 9-element array per face

export type PyraState = FaceColor[][];

const PYRA_COLORS: FaceColor[] = ['G', 'R', 'B', 'Y'];

export function solvedPyraminx(): PyraState {
  return PYRA_COLORS.map(c => Array(9).fill(c) as FaceColor[]);
}

// Pyraminx move: rotates a vertex (corner) and cycles 3 stickers from 3 adjacent faces
// The WCA standard moves U, L, R, B rotate around the corresponding tip
// Each move cycles 3 groups of 3 stickers on adjacent faces

// Sticker layout (9 per face, triangular):
// Tip stickers: 0 (top tip)
// Edge stickers in a strip
// For simplicity, map: corners at indices 0,2,6,8; edges at 1,3,5,7; center at 4
// Face adjacency and sticker cycles for each move:
const PYRA_MOVES: Record<string, { face: number; adj: [number, number[]][] }> = {
  // U: rotates around top tip; affects F/L/R
  U: {
    face: -1, // tip only rotation handled separately
    adj: [
      [0, [0, 1, 3]],  // F: top-left stickers
      [2, [0, 1, 3]],  // R
      [1, [0, 1, 3]],  // L
    ],
  },
  L: {
    face: -1,
    adj: [
      [0, [2, 5, 8]],  // F: right edge
      [1, [2, 5, 8]],  // L: right edge
      [3, [2, 5, 8]],  // B: right edge
    ],
  },
  R: {
    face: -1,
    adj: [
      [0, [6, 7, 8]],  // F: bottom
      [2, [6, 7, 8]],  // R: bottom
      [3, [0, 3, 6]],  // B: left
    ],
  },
  B: {
    face: -1,
    adj: [
      [1, [6, 7, 8]],  // L: bottom
      [2, [2, 5, 8]],  // R: right
      [3, [0, 1, 2]],  // B: top
    ],
  },
};

function applyPyraMoveOnce(state: PyraState, base: string): PyraState {
  const s = state.map(f => [...f]) as PyraState;
  const def = PYRA_MOVES[base];
  if (!def) return s;

  const [[f0, i0], [f1, i1], [f2, i2]] = def.adj;
  const saved = i0.map(i => s[f0][i]);

  i0.forEach((i, j) => { s[f0][i] = s[f2][i2[j]]; });
  i2.forEach((i, j) => { s[f2][i] = s[f1][i1[j]]; });
  i1.forEach((i, j) => { s[f1][i] = saved[j]; });

  return s;
}

function applyPyraMove(state: PyraState, move: string): PyraState {
  const isPrime = move.includes("'");
  const base = move.replace("'", '');
  const times = isPrime ? 2 : 1;
  let s = state;
  for (let t = 0; t < times; t++) {
    s = applyPyraMoveOnce(s, base);
  }
  return s;
}

// Parse scramble and apply to state
export function applyScramble(puzzle: PuzzleType, scramble: string): CubeState | PyraState {
  const moves = scramble.split(' ').filter(Boolean);

  if (puzzle === 'pyraminx') {
    let state = solvedPyraminx();
    for (const move of moves) {
      // Skip tip moves (lowercase) for visualization simplicity
      if (move[0] === move[0].toUpperCase()) {
        state = applyPyraMove(state, move);
      }
    }
    return state;
  }

  const n = puzzle === '2x2' ? 2 : puzzle === '3x3' ? 3 : 4;
  let state = solvedState(n);
  for (const move of moves) {
    state = applyNxNMove(state, move, n);
  }
  return state;
}
