import { useState, useRef, useCallback, useMemo } from "react";
import { S, PAD, px, py, boardW, boardH } from "./constants";
import { sigColor as _sigColor, sigLabel } from "./nets/nets";
import { buildOccMap } from "./parts/partGeometry";
import { useProjectStore } from "./state/useProjectStore";
import { useSvgCoords } from "./hooks/useSvgCoords";
import { useTraceDraw } from "./hooks/useTraceDraw";
import { useCompDrag } from "./hooks/useCompDrag";
import { useTheme } from "./theme/ThemeContext";
import { HoleGrid } from "./board/HoleGrid";
import { HitTargets } from "./board/HitTargets";
import { TraceLayer } from "./board/TraceLayer";
import { ComponentLayer } from "./board/ComponentLayer";
import { PaletteBar } from "./panels/PaletteBar";
import { SidePanel } from "./panels/SidePanel";
import { SettingsPage } from "./panels/SettingsPage";
import type { Component } from "./types";

type Page = "board" | "settings";

export default function App() {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useProjectStore();
  const { cols, rows, partDefs, comps, segments, nets, activeSig, eraseMode, selected } = state;
  const { mode, tokens: t, toggle: toggleTheme } = useTheme();
  const [page, setPage] = useState<Page>("board");

  const [hovered, setHovered] = useState<[number, number] | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const getSvgPt = useSvgCoords(svgRef);

  const sigColor = useCallback(
    (id: string) => _sigColor(nets, id),
    [nets]
  );

  const occMap = useMemo(() => buildOccMap(comps, partDefs), [comps, partDefs]);

  // Detect holes where two or more dissimilar nets converge
  const conflicts = useMemo(() => {
    const netsAt: Record<string, Set<string>> = {};
    const add = (c: number, r: number, sig: string) => {
      const k = `${c},${r}`;
      (netsAt[k] ??= new Set()).add(sig);
    };
    // Pins from components
    for (const [k, o] of Object.entries(occMap)) {
      const [c, r] = k.split(",").map(Number);
      add(c, r, o.pin.sig);
    }
    // Traces — every hole along each segment
    for (const s of segments) {
      const dc = Math.sign(s.c2 - s.c1);
      const dr = Math.sign(s.r2 - s.r1);
      const steps = Math.max(Math.abs(s.c2 - s.c1), Math.abs(s.r2 - s.r1));
      for (let t = 0; t <= steps; t++) {
        add(s.c1 + dc * t, s.r1 + dr * t, s.sig);
      }
    }
    const set = new Set<string>();
    for (const [k, sigs] of Object.entries(netsAt)) {
      if (sigs.size > 1) set.add(k);
    }
    return set;
  }, [occMap, segments]);

  const { drawState, startDraw, cancelDraw } = useTraceDraw({
    cols,
    rows,
    eraseMode,
    activeSig,
    occMap,
    segments,
    getSvgPt,
    onPlace: (seg) => dispatch({ type: "ADD_SEGMENT", segment: seg }),
    hasDrag: false,
  });

  const { dragState, startCompDrag } = useCompDrag({
    cols,
    rows,
    comps,
    partDefs,
    eraseMode,
    hasDraw: !!drawState,
    getSvgPt,
    onMove: (updater: (comps: Component[]) => Component[]) =>
      dispatch({ type: "MAP_COMPS", updater }),
    onSelect: (id) => {
      dispatch({ type: "SNAPSHOT" });
      dispatch({ type: "SET_SELECTED", selection: { type: "comp", id } });
    },
  });

  const W = boardW(cols);
  const H = boardH(rows);

  const btnStyle = {
    padding: "3px 10px" as const,
    fontSize: 10,
    fontFamily: "'JetBrains Mono','Fira Code',monospace",
    background: t.btnBg,
    color: t.btnText,
    border: `1px solid ${t.btnBorder}`,
    borderRadius: 3,
    cursor: "pointer" as const,
  };

  const tabStyle = (active: boolean) => ({
    ...btnStyle,
    padding: "4px 14px" as const,
    fontSize: 11,
    background: active ? t.textAccent + "18" : t.btnBg,
    color: active ? t.textAccent : t.btnText,
    border: `1px solid ${active ? t.textAccent : t.btnBorder}`,
    fontWeight: active ? "bold" as const : "normal" as const,
  });

  return (
    <div
      style={{
        background: t.pageBg,
        minHeight: "100vh",
        padding: 12,
        fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace",
        color: t.pageText,
        userSelect: "none",
      }}
    >
      <div style={{ maxWidth: page === "board" ? W + 280 : 560, margin: "0 auto" }}>
        {/* Header with tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 14, color: t.textAccent, fontWeight: "bold", letterSpacing: 1 }}>
            PERFection
          </span>
          <span style={{ fontSize: 10, color: t.textDim }}>{cols}×{rows}</span>
          <div style={{ flex: 1 }} />
          <button onClick={() => setPage("board")} style={tabStyle(page === "board")}>
            Board
          </button>
          <button onClick={() => setPage("settings")} style={tabStyle(page === "settings")}>
            Settings
          </button>
        </div>

        {page === "settings" ? (
          <SettingsPage
            state={state}
            dispatch={dispatch}
            tokens={t}
            mode={mode}
            toggleTheme={toggleTheme}
          />
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            {/* Main area */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Board toolbar */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                <button onClick={undo} disabled={!canUndo} style={{ ...btnStyle, opacity: canUndo ? 1 : 0.35 }}>
                  Undo
                </button>
                <button onClick={redo} disabled={!canRedo} style={{ ...btnStyle, opacity: canRedo ? 1 : 0.35 }}>
                  Redo
                </button>
                <button
                  onClick={() => { dispatch({ type: "TOGGLE_ERASE" }); cancelDraw(); }}
                  style={{
                    ...btnStyle,
                    background: eraseMode ? t.textDanger + "20" : t.btnBg,
                    color: eraseMode ? t.textDanger : t.btnText,
                    border: eraseMode ? `1px solid ${t.textDanger}` : `1px solid ${t.btnBorder}`,
                  }}
                >
                  {eraseMode ? "● Eraser" : "Eraser"}
                </button>
              </div>

              <PaletteBar
                nets={nets}
                activeSig={activeSig}
                eraseMode={eraseMode}
                dispatch={dispatch}
                tokens={t}
              />

              {/* Status */}
              <div style={{ fontSize: 10, color: t.textTertiary, marginBottom: 4, height: 14 }}>
                {dragState
                  ? "Dragging — drop to place"
                  : drawState
                    ? `Drawing ${sigLabel(nets, drawState.sig)} — release to place trace`
                    : eraseMode
                      ? "Click a trace to erase"
                      : "Drag from a hole to draw a trace · Drag component bodies to move · Click to select"}
                {hovered && !dragState && !drawState && (
                  <span style={{ marginLeft: 12, color: t.textAccent }}>
                    col {hovered[0] + 1}, row {hovered[1] + 1}
                    {occMap[`${hovered[0]},${hovered[1]}`] && (
                      <span style={{ color: t.textWarn }}>
                        {" · "}
                        {occMap[`${hovered[0]},${hovered[1]}`].pin.label}
                      </span>
                    )}
                  </span>
                )}
                <span style={{ float: "right", color: t.textDim }}>
                  {segments.length} traces
                </span>
              </div>

              {/* SVG Board */}
              <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                width="100%"
                style={{
                  background: t.boardCanvasBg,
                  borderRadius: 6,
                  border: `1px solid ${t.boardBorder}`,
                  display: "block",
                  cursor: dragState
                    ? "grabbing"
                    : drawState
                      ? "crosshair"
                      : "default",
                  maxWidth: W,
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  cancelDraw();
                }}
                onClick={(e) => {
                  if (
                    e.target === e.currentTarget ||
                    (e.target as HTMLElement).dataset?.board
                  )
                    dispatch({ type: "SET_SELECTED", selection: null });
                }}
              >
                <rect
                  data-board="1"
                  x={PAD - 16}
                  y={PAD - 16}
                  width={(cols - 1) * S + 32}
                  height={(rows - 1) * S + 32}
                  fill={t.boardFill}
                  stroke={t.boardStroke}
                  strokeWidth={1}
                  rx={3}
                />

                {Array.from({ length: cols }, (_, i) => (
                  <text
                    key={`c${i}`}
                    x={px(i)}
                    y={PAD - 24}
                    fontSize={8}
                    fill={t.axisText}
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {i + 1}
                  </text>
                ))}
                {Array.from({ length: rows }, (_, i) => (
                  <text
                    key={`r${i}`}
                    x={PAD - 24}
                    y={py(i) + 3}
                    fontSize={8}
                    fill={t.axisText}
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {i + 1}
                  </text>
                ))}

                <ComponentLayer
                  comps={comps}
                  partDefs={partDefs}
                  dragState={dragState}
                  selected={selected}
                  sigColor={sigColor}
                  onMouseDown={startCompDrag}
                  onSelect={(id) => dispatch({ type: "SET_SELECTED", selection: { type: "comp", id } })}
                  tokens={t}
                />
                <HoleGrid
                  cols={cols}
                  rows={rows}
                  occMap={occMap}
                  conflicts={conflicts}
                  hovered={hovered}
                  eraseMode={eraseMode}
                  sigColor={sigColor}
                  tokens={t}
                />
                <TraceLayer
                  segments={segments}
                  drawState={drawState}
                  sigColor={sigColor}
                  selectedIndex={selected?.type === "seg" ? selected.index : null}
                  onSelect={(i) => dispatch({ type: "SET_SELECTED", selection: { type: "seg", index: i } })}
                  eraseMode={eraseMode}
                />
                <HitTargets
                  cols={cols}
                  rows={rows}
                  hasDrag={!!dragState}
                  eraseMode={eraseMode}
                  onHoleDown={startDraw}
                  onEraseHole={(c, r) => dispatch({ type: "ERASE_AT", c, r })}
                  onHover={setHovered}
                />
              </svg>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 9,
                  color: t.textDim,
                  lineHeight: 1.6,
                }}
              >
                <b style={{ color: t.textTertiary }}>Draw:</b> drag from any hole along a
                row/col — uses pin colour or selected palette
                {" · "}
                <b style={{ color: t.textTertiary }}>Move:</b> drag component bodies
                {" · "}
                <b style={{ color: t.textTertiary }}>Select:</b> click component → panel for
                rotate/reorder
                {" · "}
                <b style={{ color: t.textTertiary }}>Palette:</b> pick a colour before
                drawing from empty holes
                {" · "}
                <b style={{ color: t.textTertiary }}>Undo/Redo:</b> Ctrl+Z / Ctrl+Shift+Z
              </div>
            </div>

            <SidePanel
              selected={selected}
              comps={comps}
              partDefs={partDefs}
              segments={segments}
              nets={nets}
              sigColor={sigColor}
              dispatch={dispatch}
              tokens={t}
            />
          </div>
        )}
      </div>
    </div>
  );
}
