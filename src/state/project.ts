import type { Component, Segment, Net, PartDefinition, Selection } from "../types";
import { DEFAULT_NETS } from "../nets/nets";
import { DEFAULT_COLS, DEFAULT_ROWS } from "../constants";
import { BUILTIN_PARTS } from "../parts/PartLibrary";

export interface ProjectState {
  cols: number;
  rows: number;
  partDefs: PartDefinition[];
  comps: Component[];
  segments: Segment[];
  nets: Net[];
  activeSig: string;
  eraseMode: boolean;
  selected: Selection;
}

export const initComps = (): Component[] => [
  {
    id: "ribbon",
    defId: "ribbon-9pin",
    col: 0,
    row: 0,
    rot: 0,
    label: "RIBBON → ESP32",
  },
  { id: "m1", defId: "tmc5160", col: 1, row: 4, rot: 0, label: "#1 Stage A" },
  { id: "m2", defId: "tmc5160", col: 8, row: 4, rot: 0, label: "#2 Stage B" },
  { id: "m3", defId: "tmc5160", col: 15, row: 4, rot: 0, label: "#3 Lens" },
  {
    id: "mot1",
    defId: "motor-4pin",
    col: 2,
    row: 16,
    rot: 0,
    label: "M1 Motor",
  },
  {
    id: "mot2",
    defId: "motor-4pin",
    col: 9,
    row: 16,
    rot: 0,
    label: "M2 Motor",
  },
  {
    id: "mot3",
    defId: "motor-4pin",
    col: 16,
    row: 16,
    rot: 0,
    label: "M3 Motor",
  },
  {
    id: "pwr",
    defId: "power-2pin",
    col: 22,
    row: 16,
    rot: 0,
    label: "24V IN",
  },
];

export const initialProject = (): ProjectState => ({
  cols: DEFAULT_COLS,
  rows: DEFAULT_ROWS,
  partDefs: [...BUILTIN_PARTS],
  comps: initComps(),
  segments: [],
  nets: [...DEFAULT_NETS],
  activeSig: "gnd",
  eraseMode: false,
  selected: null,
});
