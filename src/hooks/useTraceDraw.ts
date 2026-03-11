import { useState, useCallback, useEffect } from "react";
import type { DrawState, OccEntry, Segment } from "../types";
import { toGrid, clamp } from "../constants";

interface UseTraceDrawOpts {
  cols: number;
  rows: number;
  eraseMode: boolean;
  activeSig: string;
  occMap: Record<string, OccEntry>;
  segments: Segment[];
  getSvgPt: (e: MouseEvent) => [number, number];
  onPlace: (seg: Segment) => void;
  hasDrag: boolean;
}

export function useTraceDraw({
  cols,
  rows,
  eraseMode,
  activeSig,
  occMap,
  segments,
  getSvgPt,
  onPlace,
  hasDrag,
}: UseTraceDrawOpts) {
  const [drawState, setDrawState] = useState<DrawState | null>(null);

  const startDraw = useCallback(
    (c: number, r: number, e: React.MouseEvent) => {
      if (hasDrag || eraseMode) return;
      e.stopPropagation();
      e.preventDefault();
      const k = `${c},${r}`;
      const o = occMap[k];
      let sig = activeSig;
      if (o) {
        sig = o.pin.sig;
      } else {
        const atHole = segments.find(
          (s) => (s.c1 === c && s.r1 === r) || (s.c2 === c && s.r2 === r)
        );
        if (atHole) sig = atHole.sig;
      }
      setDrawState({ sc: c, sr: r, sig, curC: c, curR: r });
    },
    [hasDrag, eraseMode, activeSig, occMap, segments]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!drawState) return;
      const [mx, my] = getSvgPt(e);
      const [gc, gr] = toGrid(mx, my);
      const dc = Math.abs(gc - drawState.sc);
      const dr = Math.abs(gr - drawState.sr);
      let tc: number, tr: number;
      if (dc === 0 && dr === 0) {
        tc = gc;
        tr = gr;
      } else if (dc >= dr) {
        tc = clamp(gc, 0, cols - 1);
        tr = drawState.sr;
      } else {
        tc = drawState.sc;
        tr = clamp(gr, 0, rows - 1);
      }
      setDrawState((prev) => (prev ? { ...prev, curC: tc, curR: tr } : null));
    },
    [drawState, getSvgPt, cols, rows]
  );

  const onMouseUp = useCallback(() => {
    if (!drawState) return;
    const { sc, sr, sig, curC, curR } = drawState;
    if ((sc !== curC || sr !== curR) && (sc === curC || sr === curR)) {
      onPlace({ c1: sc, r1: sr, c2: curC, r2: curR, sig });
    }
    setDrawState(null);
  }, [drawState, onPlace]);

  useEffect(() => {
    if (!drawState) return;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [drawState, onMouseMove, onMouseUp]);

  const cancelDraw = useCallback(() => setDrawState(null), []);

  return { drawState, startDraw, cancelDraw };
}
