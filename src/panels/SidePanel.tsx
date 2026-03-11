import type { CSSProperties } from "react";
import type { Component, PartDefinition, Segment, Net, Selection } from "../types";
import type { ProjectDispatch } from "../state/useProjectStore";
import type { ThemeTokens } from "../theme/tokens";
import { resolvedRowPins } from "../parts/partGeometry";
import { PinGrid } from "./PinGrid";

function makeBtn(t: ThemeTokens): CSSProperties {
  return {
    padding: "3px 10px",
    fontSize: 10,
    fontFamily: "'JetBrains Mono','Fira Code',monospace",
    background: t.btnBg,
    color: t.btnText,
    border: `1px solid ${t.btnBorder}`,
    borderRadius: 3,
    cursor: "pointer",
  };
}

interface SidePanelProps {
  selected: Selection;
  comps: Component[];
  partDefs: PartDefinition[];
  segments: Segment[];
  nets: Net[];
  sigColor: (id: string) => string;
  dispatch: ProjectDispatch;
  tokens: ThemeTokens;
}

const rotLabels = ["0°", "90°", "180°", "270°"];

export function SidePanel({
  selected,
  comps,
  partDefs,
  segments,
  nets,
  sigColor,
  dispatch,
  tokens: t,
}: SidePanelProps) {
  const btn = makeBtn(t);

  const inputStyle: CSSProperties = {
    padding: "3px 6px",
    fontSize: 11,
    fontFamily: "'JetBrains Mono','Fira Code',monospace",
    background: t.panelItemBg,
    color: t.textPrimary,
    border: `1px solid ${t.btnBorder}`,
    borderRadius: 3,
  };

  // Determine what's selected
  const selComp = selected?.type === "comp" ? comps.find((c) => c.id === selected.id) : null;
  const selDef = selComp ? partDefs.find((d) => d.id === selComp.defId) : null;
  const selSeg = selected?.type === "seg" && selected.index < segments.length ? segments[selected.index] : null;
  const selSegIdx = selected?.type === "seg" ? selected.index : -1;

  return (
    <div
      style={{
        width: 240,
        flexShrink: 0,
        background: t.panelBg,
        borderRadius: 6,
        border: `1px solid ${t.panelBorder}`,
        padding: 10,
        alignSelf: "flex-start",
        marginTop: 82,
      }}
    >
      {/* Nothing selected */}
      {!selComp && !selSeg && (
        <div
          style={{
            color: t.textDim,
            fontSize: 11,
            textAlign: "center",
            padding: "20px 0",
          }}
        >
          Click a component or trace
          <br />
          to inspect and edit it
        </div>
      )}

      {/* ── Segment selected ── */}
      {selSeg && (
        <>
          <div
            style={{
              fontSize: 12,
              color: t.textAccent,
              fontWeight: "bold",
              marginBottom: 8,
            }}
          >
            Trace Segment
          </div>

          {/* Visual preview */}
          <div style={{
            marginBottom: 10,
            padding: 8,
            background: t.panelItemBg,
            borderRadius: 4,
            border: `1px solid ${t.panelBorder}`,
          }}>
            <svg viewBox="0 0 120 40" width={120} style={{ display: "block" }}>
              <line x1={20} y1={20} x2={100} y2={20} stroke={sigColor(selSeg.sig)} strokeWidth={4} strokeLinecap="round" />
              <circle cx={20} cy={20} r={5} fill={sigColor(selSeg.sig) + "44"} stroke={sigColor(selSeg.sig)} strokeWidth={1} />
              <circle cx={100} cy={20} r={5} fill={sigColor(selSeg.sig) + "44"} stroke={sigColor(selSeg.sig)} strokeWidth={1} />
            </svg>
          </div>

          {/* Endpoints */}
          <div style={{
            marginBottom: 10,
            padding: 8,
            background: t.panelItemBg,
            borderRadius: 4,
            border: `1px solid ${t.panelBorder}`,
          }}>
            <div style={{ fontSize: 10, color: t.textSecondary, fontWeight: "bold", marginBottom: 6 }}>
              Endpoints
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "50px 1fr 1fr", gap: "4px 8px", alignItems: "center", fontSize: 10 }}>
              <span style={{ color: t.textDim }}></span>
              <span style={{ color: t.textDim }}>Col</span>
              <span style={{ color: t.textDim }}>Row</span>

              <span style={{ color: t.textTertiary }}>From</span>
              <input
                type="number"
                min={1}
                value={selSeg.c1 + 1}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) dispatch({
                    type: "UPDATE_SEGMENT",
                    index: selSegIdx,
                    segment: { ...selSeg, c1: v - 1 },
                  });
                }}
                style={{ ...inputStyle, width: "100%", textAlign: "center", fontSize: 10, boxSizing: "border-box" }}
              />
              <input
                type="number"
                min={1}
                value={selSeg.r1 + 1}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) dispatch({
                    type: "UPDATE_SEGMENT",
                    index: selSegIdx,
                    segment: { ...selSeg, r1: v - 1 },
                  });
                }}
                style={{ ...inputStyle, width: "100%", textAlign: "center", fontSize: 10, boxSizing: "border-box" }}
              />

              <span style={{ color: t.textTertiary }}>To</span>
              <input
                type="number"
                min={1}
                value={selSeg.c2 + 1}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) dispatch({
                    type: "UPDATE_SEGMENT",
                    index: selSegIdx,
                    segment: { ...selSeg, c2: v - 1 },
                  });
                }}
                style={{ ...inputStyle, width: "100%", textAlign: "center", fontSize: 10, boxSizing: "border-box" }}
              />
              <input
                type="number"
                min={1}
                value={selSeg.r2 + 1}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) dispatch({
                    type: "UPDATE_SEGMENT",
                    index: selSegIdx,
                    segment: { ...selSeg, r2: v - 1 },
                  });
                }}
                style={{ ...inputStyle, width: "100%", textAlign: "center", fontSize: 10, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ fontSize: 9, color: t.textDim, marginTop: 4 }}>
              {selSeg.c1 === selSeg.c2
                ? `Vertical — col ${selSeg.c1 + 1}, rows ${Math.min(selSeg.r1, selSeg.r2) + 1}–${Math.max(selSeg.r1, selSeg.r2) + 1}`
                : selSeg.r1 === selSeg.r2
                  ? `Horizontal — row ${selSeg.r1 + 1}, cols ${Math.min(selSeg.c1, selSeg.c2) + 1}–${Math.max(selSeg.c1, selSeg.c2) + 1}`
                  : `Diagonal — (${selSeg.c1 + 1},${selSeg.r1 + 1}) to (${selSeg.c2 + 1},${selSeg.r2 + 1})`}
            </div>
          </div>

          {/* Net assignment */}
          <div style={{
            marginBottom: 10,
            padding: 8,
            background: t.panelItemBg,
            borderRadius: 4,
            border: `1px solid ${t.panelBorder}`,
          }}>
            <div style={{ fontSize: 10, color: t.textSecondary, fontWeight: "bold", marginBottom: 6 }}>
              Net
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 10, height: 10, borderRadius: 2,
                background: sigColor(selSeg.sig),
                flexShrink: 0,
              }} />
              <select
                value={selSeg.sig}
                onChange={(e) => dispatch({
                  type: "UPDATE_SEGMENT",
                  index: selSegIdx,
                  segment: { ...selSeg, sig: e.target.value },
                })}
                style={{ ...inputStyle, flex: 1 }}
              >
                {nets.map((n) => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Delete */}
          <button
            onClick={() => dispatch({ type: "DELETE_SEGMENT", index: selSegIdx })}
            style={{
              ...btn,
              width: "100%",
              fontSize: 11,
              padding: "5px 0",
              color: t.textDanger,
              border: `1px solid ${t.textDanger}40`,
            }}
          >
            Delete Trace
          </button>
        </>
      )}

      {/* ── Component selected ── */}
      {selComp && selDef && (
        <>
          <div
            style={{
              fontSize: 12,
              color: t.textAccent,
              fontWeight: "bold",
              marginBottom: 4,
            }}
          >
            {selComp.label}
          </div>
          <div style={{ fontSize: 9, color: t.textDim, marginBottom: 8 }}>
            {selDef.label}
          </div>

          <div style={{ fontSize: 9, color: t.textTertiary, marginBottom: 8 }}>
            Position: col {selComp.col + 1}, row {selComp.row + 1}
            {selDef.rotatable && (
              <span>
                {" "}
                · Rotation: {rotLabels[selComp.rot || 0]}
              </span>
            )}
          </div>

          {selDef.rotatable ? (
            <button
              onClick={() =>
                dispatch({ type: "ROTATE_COMP", id: selComp.id })
              }
              style={{
                ...btn,
                width: "100%",
                marginBottom: 10,
                fontSize: 11,
                padding: "5px 0",
                color: t.btnAccentText,
                border: `1px solid ${t.btnAccentBorder}`,
              }}
            >
              Rotate 90°
            </button>
          ) : (
            <div
              style={{
                fontSize: 9,
                color: t.textDim,
                marginBottom: 10,
                fontStyle: "italic",
              }}
            >
              {selDef.archetype === "module"
                ? `Module — fixed orientation (${selDef.rows.length} pin rows)`
                : "Fixed orientation"}
            </div>
          )}

          {/* Delete component button */}
          <button
            onClick={() => {
              if (window.confirm(`Delete "${selComp.label}" from board?`))
                dispatch({ type: "DELETE_COMP", id: selComp.id });
            }}
            style={{
              ...btn,
              width: "100%",
              marginBottom: 10,
              fontSize: 11,
              padding: "5px 0",
              color: t.textDanger,
              border: `1px solid ${t.textDanger}40`,
            }}
          >
            Delete from Board
          </button>

          {/* Pins — unified editor for all component types */}
          <div style={{ fontSize: 10, color: t.textSecondary, fontWeight: "bold", marginBottom: 4 }}>
            Pins
          </div>
          <PinGrid
            rows={selDef.rows.map((_row, ri) => ({
              label: selDef.rows.length > 1 ? `J${ri + 1}` : undefined,
              pins: resolvedRowPins(selComp, selDef, ri),
            }))}
            nets={nets}
            sigColor={sigColor}
            tokens={t}
            compact
            onMove={(rowIdx, pinIdx, dir) =>
              dispatch({ type: "MOVE_PIN", compId: selComp.id, rowIdx, idx: pinIdx, dir })
            }
            onUpdate={(rowIdx, pinIdx, updates) =>
              dispatch({ type: "UPDATE_COMP_PIN", compId: selComp.id, rowIdx, pinIdx, updates })
            }
          />
        </>
      )}
    </div>
  );
}
