import type { Component, Hole, PartDefinition, Pin } from "../types";
import { S, px, py } from "../constants";

// Re-export pin arrays for backwards compat (used by SidePanel, etc.)
export { J1_PINS, J2_PINS } from "./PartLibrary";

export function pinOffset(i: number, rot: number): [number, number] {
  switch (rot % 4) {
    case 0:
      return [i, 0];
    case 1:
      return [0, i];
    case 2:
      return [-i, 0];
    case 3:
      return [0, -i];
    default:
      return [i, 0];
  }
}

export function labelOffset(rot: number) {
  switch (rot % 4) {
    case 0:
      return { dx: 0, dy: -10, anchor: "middle" as const };
    case 1:
      return { dx: 10, dy: 3, anchor: "start" as const };
    case 2:
      return { dx: 0, dy: 14, anchor: "middle" as const };
    case 3:
      return { dx: -10, dy: 3, anchor: "end" as const };
    default:
      return { dx: 0, dy: -10, anchor: "middle" as const };
  }
}

/** Resolve pins for a single row of a component instance (respecting overrides) */
export function resolvedRowPins(comp: Component, def: PartDefinition, rowIdx: number): Pin[] {
  if (comp.pinRowOverrides?.[rowIdx]) return comp.pinRowOverrides[rowIdx];
  // Legacy: pinOverrides applies to row 0 for strips
  if (rowIdx === 0 && comp.pinOverrides) return comp.pinOverrides;
  return def.rows[rowIdx]?.pins ?? [];
}

/** Resolve the actual pins for a component instance (row 0 — for strips) */
export function resolvedPins(comp: Component, def: PartDefinition): Pin[] {
  return resolvedRowPins(comp, def, 0);
}

/** Rotate a grid offset [dc, dr] around the origin by rot*90° */
function rotateOffset(dc: number, dr: number, rot: number): [number, number] {
  switch (rot % 4) {
    case 0: return [dc, dr];
    case 1: return [-dr, dc];
    case 2: return [-dc, -dr];
    case 3: return [dr, -dc];
    default: return [dc, dr];
  }
}

/** Get all holes occupied by a component */
export function getHoles(comp: Component, def: PartDefinition): Hole[] {
  if (def.archetype === "module") {
    // Module: each PinRow is a column of pins at an offset
    const holes: Hole[] = [];
    const rot = comp.rot || 0;
    def.rows.forEach((row, ri) => {
      const pins = resolvedRowPins(comp, def, ri);
      pins.forEach((pin, i) => {
        const dc = row.offset[0];
        const dr = row.offset[1] + i;
        const [rc, rr] = rotateOffset(dc, dr, rot);
        holes.push({
          c: comp.col + rc,
          r: comp.row + rr,
          pin,
          side: `j${ri + 1}`,
        });
      });
    });
    return holes;
  }
  // Strip: single row of pins, supports rotation
  const pins = resolvedPins(comp, def);
  return pins.map((pin, i) => {
    const [dc, dr] = pinOffset(i, comp.rot);
    return { c: comp.col + dc, r: comp.row + dr, pin, side: "pin" };
  });
}

export function compLabelPos(comp: Component, def: PartDefinition) {
  if (def.archetype === "module") {
    // Use bounding box of all holes to position label above
    const holes = getHoles(comp, def);
    if (holes.length === 0) return { x: px(comp.col), y: py(comp.row) - 18 };
    let minC = Infinity, maxC = -Infinity, minR = Infinity;
    holes.forEach((h) => {
      minC = Math.min(minC, h.c);
      maxC = Math.max(maxC, h.c);
      minR = Math.min(minR, h.r);
    });
    return {
      x: (px(minC) + px(maxC)) / 2,
      y: py(minR) - 18,
    };
  }
  const pins = resolvedPins(comp, def);
  const n = pins.length;
  const rot = comp.rot % 4;
  const last = pinOffset(n - 1, rot);
  const midX = (px(comp.col) + px(comp.col + last[0])) / 2;
  const midY = (py(comp.row) + py(comp.row + last[1])) / 2;
  switch (rot) {
    case 0:
      return { x: midX, y: midY - 20 };
    case 1:
      return { x: midX - 18, y: midY };
    case 2:
      return { x: midX, y: midY + 22 };
    case 3:
      return { x: midX + 18, y: midY };
    default:
      return { x: midX, y: midY - 20 };
  }
}

export function getStripOutline(comp: Component, def: PartDefinition) {
  const holes = getHoles(comp, def);
  if (holes.length === 0) return null;
  let minC = Infinity,
    maxC = -Infinity,
    minR = Infinity,
    maxR = -Infinity;
  holes.forEach((h) => {
    minC = Math.min(minC, h.c);
    maxC = Math.max(maxC, h.c);
    minR = Math.min(minR, h.r);
    maxR = Math.max(maxR, h.r);
  });
  return {
    x: px(minC) - 9,
    y: py(minR) - 9,
    w: (maxC - minC) * S + 18,
    h: (maxR - minR) * S + 18,
  };
}

/** Build a map of occupied grid positions from all components */
export function buildOccMap(comps: Component[], defs: PartDefinition[]) {
  const occMap: Record<string, { comp: string; pin: Pin; side: string }> = {};
  comps.forEach((comp) => {
    const def = defs.find((d) => d.id === comp.defId);
    if (!def) return;
    getHoles(comp, def).forEach((h) => {
      occMap[`${h.c},${h.r}`] = { comp: comp.id, pin: h.pin, side: h.side };
    });
  });
  return occMap;
}
