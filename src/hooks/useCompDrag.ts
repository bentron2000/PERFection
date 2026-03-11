import { useState, useCallback, useEffect, useRef } from "react";
import type { Component, DragState, PartDefinition } from "../types";
import { PAD, toGrid, px, py } from "../constants";
import { getHoles } from "../parts/partGeometry";

interface UseCompDragOpts {
  cols: number;
  rows: number;
  comps: Component[];
  partDefs: PartDefinition[];
  eraseMode: boolean;
  hasDraw: boolean;
  getSvgPt: (e: MouseEvent) => [number, number];
  onMove: (updater: (comps: Component[]) => Component[]) => void;
  onSelect: (id: string) => void;
}

export function useCompDrag({
  cols,
  rows,
  comps,
  partDefs,
  eraseMode,
  hasDraw,
  getSvgPt,
  onMove,
  onSelect,
}: UseCompDragOpts) {
  const [dragState, setDragState] = useState<DragState | null>(null);

  // Use refs for values needed during drag to avoid stale closures
  const partDefsRef = useRef(partDefs);
  partDefsRef.current = partDefs;
  const colsRef = useRef(cols);
  colsRef.current = cols;
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const getSvgPtRef = useRef(getSvgPt);
  getSvgPtRef.current = getSvgPt;

  const startCompDrag = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (hasDraw || eraseMode) return;
      e.stopPropagation();
      const [mx, my] = getSvgPt(e.nativeEvent);
      const comp = comps.find((c) => c.id === id);
      if (!comp) return;
      setDragState({ id, ox: mx - px(comp.col), oy: my - py(comp.row) });
      onSelect(id);
    },
    [comps, hasDraw, eraseMode, getSvgPt, onSelect]
  );

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const [mx, my] = getSvgPtRef.current(e);
      const [gc, gr] = toGrid(
        mx - dragState.ox + PAD,
        my - dragState.oy + PAD
      );
      const currentDefs = partDefsRef.current;
      const currentCols = colsRef.current;
      const currentRows = rowsRef.current;

      onMoveRef.current((prev) =>
        prev.map((c) => {
          if (c.id !== dragState.id) return c;
          const def = currentDefs.find((d) => d.id === c.defId);
          if (!def) return c;
          const holes = getHoles({ ...c, col: gc, row: gr }, def);

          // Allow positions where at least 1 pin is on the board
          const anyOnBoard = holes.some(
            (h) => h.c >= 0 && h.c < currentCols && h.r >= 0 && h.r < currentRows
          );
          if (!anyOnBoard) return c;

          return { ...c, col: gc, row: gr };
        })
      );
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState]);

  return { dragState, startCompDrag };
}
