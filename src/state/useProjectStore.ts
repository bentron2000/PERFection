import { useReducer, useEffect, useCallback, type Dispatch } from "react";
import type { Component, Segment, Net, Pin, PartDefinition, Selection } from "../types";
import { initialProject, initComps, type ProjectState } from "./project";
import { BUILTIN_PARTS } from "../parts/PartLibrary";
import { MIN_COLS, MAX_COLS, MIN_ROWS, MAX_ROWS, clamp } from "../constants";

/** Build a mutable Pin[][] from a component's overrides (or the definition defaults) */
function buildRowOverrides(comp: Component, def: PartDefinition): Pin[][] {
  return def.rows.map((row, ri) => {
    if (comp.pinRowOverrides?.[ri]) return [...comp.pinRowOverrides[ri]];
    // Legacy: pinOverrides applies to row 0 for strips
    if (ri === 0 && comp.pinOverrides) return [...comp.pinOverrides];
    return [...row.pins];
  });
}

// ── Actions ──
type Action =
  | { type: "MAP_COMPS"; updater: (comps: Component[]) => Component[] }
  | { type: "UPDATE_COMP"; id: string; updater: (c: Component) => Component }
  | { type: "ADD_SEGMENT"; segment: Segment }
  | { type: "SET_SEGMENTS"; segments: Segment[] }
  | { type: "UPDATE_SEGMENT"; index: number; segment: Segment }
  | { type: "DELETE_SEGMENT"; index: number }
  | { type: "ERASE_AT"; c: number; r: number }
  | { type: "SET_ACTIVE_SIG"; sig: string }
  | { type: "TOGGLE_ERASE" }
  | { type: "SET_ERASE"; on: boolean }
  | { type: "SET_SELECTED"; selection: Selection }
  | { type: "ROTATE_COMP"; id: string }
  | { type: "MOVE_PIN"; compId: string; rowIdx?: number; idx: number; dir: number }
  | { type: "UPDATE_COMP_PIN"; compId: string; rowIdx: number; pinIdx: number; updates: Partial<Pin> }
  | { type: "SET_BOARD_SIZE"; cols: number; rows: number }
  | { type: "ADD_NET"; net: Net }
  | { type: "UPDATE_NET"; id: string; updates: Partial<Omit<Net, "id">> }
  | { type: "DELETE_NET"; id: string }
  | { type: "ADD_PART_DEF"; def: PartDefinition }
  | { type: "UPDATE_PART_DEF"; id: string; updates: Partial<Omit<PartDefinition, "id" | "builtin">> }
  | { type: "DELETE_PART_DEF"; id: string }
  | { type: "ADD_COMP"; comp: Component }
  | { type: "DELETE_COMP"; id: string }
  | { type: "RESET" }
  | { type: "CLEAR_TRACES" }
  | { type: "SNAPSHOT" }
  | { type: "UNDO" }
  | { type: "REDO" };

/** Actions that don't mutate the board — no undo snapshot needed */
const UI_ONLY_ACTIONS = new Set([
  "SET_ACTIVE_SIG",
  "TOGGLE_ERASE",
  "SET_ERASE",
  "SET_SELECTED",
  "MAP_COMPS", // fires every mouse-move during drag — snapshot at drag start instead
  "UNDO",
  "REDO",
]);

const MAX_UNDO = 100;

interface UndoState {
  current: ProjectState;
  past: ProjectState[];
  future: ProjectState[];
}

function projectReducer(state: ProjectState, action: Action): ProjectState {
  switch (action.type) {
    case "MAP_COMPS":
      return { ...state, comps: action.updater(state.comps) };

    case "UPDATE_COMP":
      return {
        ...state,
        comps: state.comps.map((c) =>
          c.id === action.id ? action.updater(c) : c
        ),
      };

    case "ADD_SEGMENT":
      return { ...state, segments: [...state.segments, action.segment] };

    case "SET_SEGMENTS":
      return { ...state, segments: action.segments };

    case "UPDATE_SEGMENT":
      return {
        ...state,
        segments: state.segments.map((s, i) =>
          i === action.index ? action.segment : s
        ),
      };

    case "DELETE_SEGMENT": {
      const idx = action.index;
      const sel = state.selected;
      let newSel: Selection = sel;
      if (sel?.type === "seg") {
        if (sel.index === idx) newSel = null;
        else if (sel.index > idx) newSel = { type: "seg", index: sel.index - 1 };
      }
      return {
        ...state,
        segments: state.segments.filter((_, i) => i !== idx),
        selected: newSel,
      };
    }

    case "ERASE_AT": {
      const { c, r } = action;
      const newSegs = state.segments.filter((s) => {
        if (s.c1 === s.c2) {
          const [a, b] = [Math.min(s.r1, s.r2), Math.max(s.r1, s.r2)];
          return !(s.c1 === c && r >= a && r <= b);
        }
        const [a, b] = [Math.min(s.c1, s.c2), Math.max(s.c1, s.c2)];
        return !(s.r1 === r && c >= a && c <= b);
      });
      const sel = state.selected;
      let newSel: Selection = sel;
      if (sel?.type === "seg" && sel.index >= newSegs.length) newSel = null;
      return { ...state, segments: newSegs, selected: newSel };
    }

    case "SET_ACTIVE_SIG":
      return { ...state, activeSig: action.sig, eraseMode: false };

    case "TOGGLE_ERASE":
      return { ...state, eraseMode: !state.eraseMode };

    case "SET_ERASE":
      return { ...state, eraseMode: action.on };

    case "SET_SELECTED":
      return { ...state, selected: action.selection };

    case "ROTATE_COMP":
      return {
        ...state,
        comps: state.comps.map((c) =>
          c.id === action.id ? { ...c, rot: ((c.rot || 0) + 1) % 4 } : c
        ),
      };

    case "MOVE_PIN": {
      const { compId, idx, dir } = action;
      const rowIdx = action.rowIdx ?? 0;
      return {
        ...state,
        comps: state.comps.map((c) => {
          if (c.id !== compId) return c;
          const def = state.partDefs.find((d) => d.id === c.defId);
          if (!def) return c;
          const overrides = buildRowOverrides(c, def);
          const pins = [...overrides[rowIdx]];
          const newIdx = idx + dir;
          if (newIdx < 0 || newIdx >= pins.length) return c;
          [pins[idx], pins[newIdx]] = [pins[newIdx], pins[idx]];
          overrides[rowIdx] = pins;
          return { ...c, pinRowOverrides: overrides };
        }),
      };
    }

    case "UPDATE_COMP_PIN": {
      const { compId, rowIdx, pinIdx, updates } = action;
      return {
        ...state,
        comps: state.comps.map((c) => {
          if (c.id !== compId) return c;
          const def = state.partDefs.find((d) => d.id === c.defId);
          if (!def) return c;
          const overrides = buildRowOverrides(c, def);
          overrides[rowIdx] = overrides[rowIdx].map((p, i) =>
            i === pinIdx ? { ...p, ...updates } : p
          );
          return { ...c, pinRowOverrides: overrides };
        }),
      };
    }

    case "SET_BOARD_SIZE": {
      const cols = clamp(Math.round(action.cols), MIN_COLS, MAX_COLS);
      const rows = clamp(Math.round(action.rows), MIN_ROWS, MAX_ROWS);
      return { ...state, cols, rows };
    }

    case "ADD_NET":
      if (state.nets.some((n) => n.id === action.net.id)) return state;
      return { ...state, nets: [...state.nets, action.net] };

    case "UPDATE_NET":
      return {
        ...state,
        nets: state.nets.map((n) =>
          n.id === action.id ? { ...n, ...action.updates } : n
        ),
      };

    case "DELETE_NET": {
      const netId = action.id;
      return {
        ...state,
        nets: state.nets.filter((n) => n.id !== netId),
        activeSig:
          state.activeSig === netId
            ? state.nets.find((n) => n.id !== netId)?.id ?? ""
            : state.activeSig,
      };
    }

    case "ADD_PART_DEF":
      if (state.partDefs.some((d) => d.id === action.def.id)) return state;
      return { ...state, partDefs: [...state.partDefs, action.def] };

    case "UPDATE_PART_DEF":
      return {
        ...state,
        partDefs: state.partDefs.map((d) =>
          d.id === action.id ? { ...d, ...action.updates } : d
        ),
      };

    case "DELETE_PART_DEF": {
      const defId = action.id;
      const def = state.partDefs.find((d) => d.id === defId);
      if (!def || def.builtin) return state;
      return {
        ...state,
        partDefs: state.partDefs.filter((d) => d.id !== defId),
        comps: state.comps.filter((c) => c.defId !== defId),
      };
    }

    case "ADD_COMP":
      return { ...state, comps: [...state.comps, action.comp] };

    case "DELETE_COMP": {
      const sel = state.selected;
      return {
        ...state,
        comps: state.comps.filter((c) => c.id !== action.id),
        selected: sel?.type === "comp" && sel.id === action.id ? null : sel,
      };
    }

    case "RESET":
      return {
        ...state,
        partDefs: [...BUILTIN_PARTS],
        comps: initComps(),
        segments: [],
        selected: null,
      };

    case "CLEAR_TRACES":
      return { ...state, segments: [], selected: state.selected?.type === "seg" ? null : state.selected };

    default:
      return state;
  }
}

function undoReducer(undoState: UndoState, action: Action): UndoState {
  if (action.type === "UNDO") {
    if (undoState.past.length === 0) return undoState;
    const prev = undoState.past[undoState.past.length - 1];
    return {
      current: prev,
      past: undoState.past.slice(0, -1),
      future: [undoState.current, ...undoState.future].slice(0, MAX_UNDO),
    };
  }

  if (action.type === "SNAPSHOT") {
    return {
      current: undoState.current,
      past: [...undoState.past, undoState.current].slice(-MAX_UNDO),
      future: [],
    };
  }

  if (action.type === "REDO") {
    if (undoState.future.length === 0) return undoState;
    const next = undoState.future[0];
    return {
      current: next,
      past: [...undoState.past, undoState.current].slice(-MAX_UNDO),
      future: undoState.future.slice(1),
    };
  }

  const next = projectReducer(undoState.current, action);
  if (next === undoState.current) return undoState;

  // UI-only actions don't push to undo history
  if (UI_ONLY_ACTIONS.has(action.type)) {
    return { ...undoState, current: next };
  }

  return {
    current: next,
    past: [...undoState.past, undoState.current].slice(-MAX_UNDO),
    future: [],
  };
}

function initUndoState(): UndoState {
  return { current: initialProject(), past: [], future: [] };
}

export function useProjectStore() {
  const [undoState, rawDispatch] = useReducer(undoReducer, undefined, initUndoState);

  // Keyboard shortcut: Ctrl/Cmd+Z for undo, Ctrl/Cmd+Shift+Z for redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod || e.key.toLowerCase() !== "z") return;
      // Don't capture if user is typing in an input/textarea/select
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      rawDispatch({ type: e.shiftKey ? "REDO" : "UNDO" });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Expose the same interface as before: { state, dispatch }
  // Also expose canUndo/canRedo for UI hints
  const dispatch = useCallback(
    (action: Exclude<Action, { type: "UNDO" } | { type: "REDO" }>) => rawDispatch(action as Action),
    []
  );

  return {
    state: undoState.current,
    dispatch,
    undo: useCallback(() => rawDispatch({ type: "UNDO" }), []),
    redo: useCallback(() => rawDispatch({ type: "REDO" }), []),
    canUndo: undoState.past.length > 0,
    canRedo: undoState.future.length > 0,
  };
}

// Convenience typed dispatch — excludes UNDO/REDO (use undo()/redo() instead)
export type ProjectDispatch = Dispatch<Exclude<Action, { type: "UNDO" } | { type: "REDO" }>>;
