import React from 'react';
import type { PuzzleType } from '../../types';
import type { CubeState, FaceColor, PyraState } from '../../utils/cubeState';

const COLOR_MAP: Record<FaceColor, string> = {
  W: '#ffffff',
  Y: '#ffd700',
  G: '#009b48',
  B: '#0046ad',
  O: '#ff5800',
  R: '#b71234',
};

interface CubeNetProps {
  state: CubeState;
  n: number;
  size?: number;
}

// Net layout:
//      [U(0)]
// [L(4)] [F(2)] [R(5)] [B(3)]
//      [D(1)]
const NET_FACES = [
  { face: 0, col: 1, row: 0 }, // U
  { face: 4, col: 0, row: 1 }, // L
  { face: 2, col: 1, row: 1 }, // F
  { face: 5, col: 2, row: 1 }, // R
  { face: 3, col: 3, row: 1 }, // B
  { face: 1, col: 1, row: 2 }, // D
];

function CubeNet({ state, n, size = 240 }: CubeNetProps) {
  const cell = Math.floor(size / (4 * n));
  const pad = 1;

  const faces = NET_FACES.map(({ face, col, row }) => {
    const xOff = col * n * cell;
    const yOff = row * n * cell;
    return { face, xOff, yOff };
  });

  const totalW = 4 * n * cell;
  const totalH = 3 * n * cell;

  return (
    <svg
      viewBox={`0 0 ${totalW} ${totalH}`}
      width={totalW}
      height={totalH}
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {faces.map(({ face, xOff, yOff }) =>
        state[face].map((color, idx) => {
          const r = Math.floor(idx / n);
          const c = idx % n;
          return (
            <rect
              key={`${face}-${idx}`}
              x={xOff + c * cell + pad}
              y={yOff + r * cell + pad}
              width={cell - pad * 2}
              height={cell - pad * 2}
              fill={COLOR_MAP[color]}
              rx={1}
            />
          );
        })
      )}
    </svg>
  );
}

interface PyraNetProps {
  state: PyraState;
  size?: number;
}

// Pyraminx net: 4 triangular faces in a row (simplified flat layout)
// Each face rendered as a triangle subdivided into 9 smaller triangles
// Layout: F (center), L (left), R (right), B (bottom) — flat horizontal strip
function PyraNet({ state, size = 240 }: PyraNetProps) {
  const faceW = size / 4;
  const h = (faceW * Math.sqrt(3)) / 2;

  // Each face: 9 stickers in a 3-row triangular grid
  // Row 0: 1 upward triangle (index 0)
  // Row 1: 2 upward + 1 downward (indices 1,2,3 → 1=down, 2=up, 3=up... simplified)
  // Row 2: 3 upward + 2 downward (indices 4-8)
  // For simplicity, map 9 stickers to small triangles in a 3-layer arrangement

  function renderFace(faceIdx: number, xBase: number) {
    const colors = state[faceIdx];
    const tris: React.ReactElement[] = [];
    const s = faceW / 3; // sub-triangle base width

    // 3 rows of triangles (upward pointing)
    // Row 0: 1 triangle at center top
    // Row 1: 2 triangles
    // Row 2: 3 triangles
    // Plus downward-pointing fillers (not stickers, just gaps)
    // We'll map 9 stickers to positions in a triangular grid

    // Positions: (row, col) of upward triangles
    const positions = [
      { row: 0, col: 0 }, // sticker 0
      { row: 1, col: 0 }, // sticker 1
      { row: 1, col: 1 }, // sticker 2
      { row: 2, col: 0 }, // sticker 3
      { row: 2, col: 1 }, // sticker 4 (center)
      { row: 2, col: 2 }, // sticker 5
    ];

    // Downward-pointing triangles (stickers 6, 7, 8 are these)
    const downPositions = [
      { row: 1, col: 0 }, // between row1[0] and row2[0,1]
      { row: 2, col: 0 }, // between row2[0] and row2[1]
      { row: 2, col: 1 }, // between row2[1] and row2[2]
    ];

    positions.forEach(({ row, col }, i) => {
      const y0 = row * (h / 3);
      const cx = xBase + (faceW / 2) - ((3 - row * 2) / 2) * s + col * s;
      const topX = cx + s / 2;
      const topY = y0;
      const blX = cx;
      const blY = y0 + (h / 3);
      const brX = cx + s;
      const brY = y0 + (h / 3);

      tris.push(
        <polygon
          key={`u-${faceIdx}-${i}`}
          points={`${topX},${topY} ${blX},${blY} ${brX},${brY}`}
          fill={COLOR_MAP[colors[i]]}
          stroke="#1a1a1a"
          strokeWidth={1}
        />
      );
    });

    downPositions.forEach(({ row, col }, i) => {
      const cx = xBase + (faceW / 2) - ((3 - row * 2) / 2) * s + col * s;
      const tlX = cx;
      const tlY = row * (h / 3);
      const trX = cx + s;
      const trY = row * (h / 3);
      const bX = cx + s / 2;
      const bY = (row + 1) * (h / 3);

      tris.push(
        <polygon
          key={`d-${faceIdx}-${i}`}
          points={`${tlX},${tlY} ${trX},${trY} ${bX},${bY}`}
          fill={COLOR_MAP[colors[6 + i]]}
          stroke="#1a1a1a"
          strokeWidth={1}
        />
      );
    });

    return tris;
  }

  const faces = [
    { idx: 0, x: faceW },     // F - front
    { idx: 1, x: 0 },         // L - left
    { idx: 2, x: faceW * 2 }, // R - right
    { idx: 3, x: faceW * 3 }, // B - back
  ];

  return (
    <svg
      viewBox={`0 0 ${size} ${h}`}
      width={size}
      height={h}
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {faces.flatMap(({ idx, x }) => renderFace(idx, x))}
    </svg>
  );
}

interface Props {
  puzzle: PuzzleType;
  state: CubeState | PyraState;
}

export function CubePreview({ puzzle, state }: Props) {
  const n = puzzle === '2x2' ? 2 : puzzle === '3x3' ? 3 : puzzle === '4x4' ? 4 : 3;

  return (
    <div className="flex justify-center items-center py-2">
      {puzzle === 'pyraminx' ? (
        <PyraNet state={state as PyraState} size={280} />
      ) : (
        <CubeNet state={state as CubeState} n={n} size={280} />
      )}
    </div>
  );
}
