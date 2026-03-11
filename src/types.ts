export interface Pin {
  label: string;
  sig: string;
  wire?: string;
}

/** Describes a row of pins in a part definition */
export interface PinRow {
  pins: Pin[];
  /** Offset from the part origin in grid units [col, row] */
  offset: [number, number];
}

/** Archetype for a part — defines pin layout and appearance */
export interface PartDefinition {
  id: string;
  label: string;
  archetype: "strip" | "module";
  /** Pin rows — strip has 1 row, module has 2+ rows */
  rows: PinRow[];
  /** Whether the part can be rotated (strips yes, modules usually no) */
  rotatable: boolean;
  /** Body colour override (optional) */
  bodyColor?: string;
  /** Border colour override (optional) */
  borderColor?: string;
  /** Whether this is a built-in definition (cannot be deleted) */
  builtin?: boolean;
}

export interface Component {
  id: string;
  defId: string;
  col: number;
  row: number;
  rot: number;
  label: string;
  /** Per-row pin overrides — allows reordering/renaming/net changes per-instance */
  pinRowOverrides?: Pin[][];
  /** @deprecated Use pinRowOverrides instead */
  pinOverrides?: Pin[];
}

export interface Segment {
  c1: number;
  r1: number;
  c2: number;
  r2: number;
  sig: string;
}

export interface Hole {
  c: number;
  r: number;
  pin: Pin;
  side: string;
}

export interface OccEntry {
  comp: string;
  pin: Pin;
  side: string;
}

export interface DrawState {
  sc: number;
  sr: number;
  sig: string;
  curC: number;
  curR: number;
}

export interface DragState {
  id: string;
  ox: number;
  oy: number;
}

export interface Net {
  id: string;
  label: string;
  color: string;
}

export type Selection =
  | { type: "comp"; id: string }
  | { type: "seg"; index: number }
  | null;
