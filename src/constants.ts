export const DEFAULT_COLS = 24;
export const DEFAULT_ROWS = 18;
export const MIN_COLS = 4;
export const MIN_ROWS = 4;
export const MAX_COLS = 100;
export const MAX_ROWS = 100;
export const S = 34;
export const PAD = 62;
export const HR = 5.5;

export const px = (c: number) => PAD + c * S;
export const py = (r: number) => PAD + r * S;
export const toGrid = (x: number, y: number): [number, number] => [
  Math.round((x - PAD) / S),
  Math.round((y - PAD) / S),
];
export const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export const boardW = (cols: number) => PAD * 2 + (cols - 1) * S;
export const boardH = (rows: number) => PAD * 2 + (rows - 1) * S;
