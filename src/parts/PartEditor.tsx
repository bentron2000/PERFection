import { useState, type CSSProperties } from "react";
import type { PartDefinition, Pin, Net, Component } from "../types";
import type { ProjectDispatch } from "../state/useProjectStore";
import type { ThemeTokens } from "../theme/tokens";
import { genPartId, genCompId } from "./PartLibrary";
import { PinGrid } from "../panels/PinGrid";

// ── Package templates ──
interface PackageTemplate {
  id: string;
  label: string;
  desc: string;
  archetype: "strip" | "module";
  pinCount: number;
  /** For DIP/DIN: gap between the two rows in grid units */
  rowGap?: number;
  rotatable: boolean;
}

const TEMPLATES: PackageTemplate[] = [
  { id: "sip", label: "SIP", desc: "Single Inline Package", archetype: "strip", pinCount: 8, rotatable: true },
  { id: "dip-8", label: "DIP-8", desc: "Dual Inline, 8 pins", archetype: "module", pinCount: 8, rowGap: 3, rotatable: false },
  { id: "dip-14", label: "DIP-14", desc: "Dual Inline, 14 pins", archetype: "module", pinCount: 14, rowGap: 3, rotatable: false },
  { id: "dip-16", label: "DIP-16", desc: "Dual Inline, 16 pins", archetype: "module", pinCount: 16, rowGap: 3, rotatable: false },
  { id: "dip-28", label: "DIP-28", desc: "Dual Inline, 28 pins", archetype: "module", pinCount: 28, rowGap: 3, rotatable: false },
  { id: "connector", label: "Connector", desc: "Terminal block / header", archetype: "strip", pinCount: 4, rotatable: true },
];

function makeDefFromTemplate(
  tmpl: PackageTemplate,
  label: string,
  pinCount: number,
): PartDefinition {
  if (tmpl.archetype === "module" && tmpl.rowGap !== undefined) {
    const half = Math.ceil(pinCount / 2);
    const leftPins: Pin[] = Array.from({ length: half }, (_, i) => ({
      label: `${i + 1}`,
      sig: "gnd",
    }));
    const rightPins: Pin[] = Array.from({ length: pinCount - half }, (_, i) => ({
      label: `${pinCount - i}`,
      sig: "gnd",
    }));
    return {
      id: genPartId(),
      label,
      archetype: "module",
      rows: [
        { pins: leftPins, offset: [0, 0] },
        { pins: rightPins, offset: [tmpl.rowGap, 0] },
      ],
      rotatable: tmpl.rotatable,
    };
  }
  const pins: Pin[] = Array.from({ length: pinCount }, (_, i) => ({
    label: `${i + 1}`,
    sig: "gnd",
  }));
  return {
    id: genPartId(),
    label,
    archetype: "strip",
    rows: [{ pins, offset: [0, 0] }],
    rotatable: tmpl.rotatable,
  };
}

// ── Main editor ──
interface PartEditorProps {
  partDefs: PartDefinition[];
  comps: Component[];
  nets: Net[];
  dispatch: ProjectDispatch;
  tokens: ThemeTokens;
}

export function PartEditor({ partDefs, comps, nets, dispatch, tokens: t }: PartEditorProps) {
  const [selectedDefId, setSelectedDefId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const selectedDef = selectedDefId ? partDefs.find((d) => d.id === selectedDefId) : null;
  const builtinDefs = partDefs.filter((d) => d.builtin);
  const customDefs = partDefs.filter((d) => !d.builtin);

  const sectionStyle: CSSProperties = {
    background: t.panelBg,
    border: `1px solid ${t.panelBorder}`,
    borderRadius: 6,
    padding: 12,
  };

  const btnStyle: CSSProperties = {
    padding: "4px 10px",
    fontSize: 10,
    fontFamily: "'JetBrains Mono','Fira Code',monospace",
    background: t.btnBg,
    color: t.btnText,
    border: `1px solid ${t.btnBorder}`,
    borderRadius: 3,
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      {/* Left: Library list */}
      <div style={{ ...sectionStyle, width: 220, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: t.textAccent, fontWeight: "bold", flex: 1 }}>
            Part Library
          </span>
          <button
            onClick={() => { setShowCreate(true); setSelectedDefId(null); }}
            style={{
              ...btnStyle,
              fontSize: 10,
              padding: "3px 8px",
              color: t.btnAccentText,
              border: `1px solid ${t.btnAccentBorder}`,
            }}
          >
            + New
          </button>
        </div>

        {/* Built-in */}
        <div style={{ fontSize: 9, color: t.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
          Built-in
        </div>
        {builtinDefs.map((def) => (
          <PartListItem
            key={def.id}
            def={def}
            isSelected={selectedDefId === def.id}
            instanceCount={comps.filter((c) => c.defId === def.id).length}
            onClick={() => { setSelectedDefId(def.id); setShowCreate(false); }}
            tokens={t}
          />
        ))}

        {customDefs.length > 0 && (
          <>
            <div style={{ fontSize: 9, color: t.textDim, marginTop: 10, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
              Custom
            </div>
            {customDefs.map((def) => (
              <PartListItem
                key={def.id}
                def={def}
                isSelected={selectedDefId === def.id}
                instanceCount={comps.filter((c) => c.defId === def.id).length}
                onClick={() => { setSelectedDefId(def.id); setShowCreate(false); }}
                tokens={t}
              />
            ))}
          </>
        )}
      </div>

      {/* Right: Detail / Create */}
      <div style={{ ...sectionStyle, flex: 1, minWidth: 0 }}>
        {showCreate ? (
          <CreatePartPanel
            dispatch={dispatch}
            tokens={t}
            onCreated={(id) => { setSelectedDefId(id); setShowCreate(false); }}
            onCancel={() => setShowCreate(false)}
          />
        ) : selectedDef ? (
          <PartDetailPanel
            def={selectedDef}
            nets={nets}
            comps={comps}
            dispatch={dispatch}
            tokens={t}
          />
        ) : (
          <div style={{ padding: "40px 20px", textAlign: "center", color: t.textDim, fontSize: 11 }}>
            Select a part from the library
            <br />
            or click <b>+ New</b> to create one
          </div>
        )}
      </div>
    </div>
  );
}

// ── List item ──
function PartListItem({
  def,
  isSelected,
  instanceCount,
  onClick,
  tokens: t,
}: {
  def: PartDefinition;
  isSelected: boolean;
  instanceCount: number;
  onClick: () => void;
  tokens: ThemeTokens;
}) {
  const totalPins = def.rows.reduce((sum, r) => sum + r.pins.length, 0);
  return (
    <div
      onClick={onClick}
      style={{
        padding: "5px 8px",
        marginBottom: 2,
        borderRadius: 3,
        cursor: "pointer",
        background: isSelected ? t.textAccent + "18" : "transparent",
        border: `1px solid ${isSelected ? t.textAccent + "40" : "transparent"}`,
        transition: "all 0.1s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          width: 6, height: 6, borderRadius: 1,
          background: def.archetype === "module" ? t.textWarn : t.textAccent,
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 11, color: isSelected ? t.textAccent : t.textPrimary, fontWeight: "bold", flex: 1 }}>
          {def.label}
        </span>
        {instanceCount > 0 && (
          <span style={{ fontSize: 9, color: t.textDim, background: t.panelItemBg, borderRadius: 8, padding: "1px 5px" }}>
            {instanceCount}
          </span>
        )}
      </div>
      <div style={{ fontSize: 9, color: t.textDim, marginTop: 1, paddingLeft: 12 }}>
        {def.archetype === "module" ? "Module" : "Strip"} · {totalPins}p
        {def.bodyColor && <span style={{ marginLeft: 4 }}>·</span>}
        {def.bodyColor && (
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 1, background: def.bodyColor, marginLeft: 3, verticalAlign: "middle" }} />
        )}
      </div>
    </div>
  );
}

// ── Create Part panel ──
function CreatePartPanel({
  dispatch,
  tokens: t,
  onCreated,
  onCancel,
}: {
  dispatch: ProjectDispatch;
  tokens: ThemeTokens;
  onCreated: (id: string) => void;
  onCancel: () => void;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("sip");
  const [label, setLabel] = useState("");
  const [pinCount, setPinCount] = useState(8);

  const tmpl = TEMPLATES.find((tp) => tp.id === selectedTemplate)!;

  const inputStyle: CSSProperties = {
    padding: "4px 8px",
    fontSize: 11,
    fontFamily: "'JetBrains Mono','Fira Code',monospace",
    background: t.panelItemBg,
    color: t.textPrimary,
    border: `1px solid ${t.btnBorder}`,
    borderRadius: 3,
  };

  const btnStyle: CSSProperties = {
    padding: "5px 14px",
    fontSize: 11,
    fontFamily: "'JetBrains Mono','Fira Code',monospace",
    background: t.btnBg,
    color: t.btnText,
    border: `1px solid ${t.btnBorder}`,
    borderRadius: 3,
    cursor: "pointer",
  };

  function handleCreate() {
    const finalLabel = label.trim() || `${tmpl.label}-${pinCount}`;
    const def = makeDefFromTemplate(tmpl, finalLabel, pinCount);
    dispatch({ type: "ADD_PART_DEF", def });
    onCreated(def.id);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: t.textAccent, fontWeight: "bold", flex: 1 }}>
          Create New Part
        </span>
        <button onClick={onCancel} style={{ ...btnStyle, fontSize: 10, padding: "3px 8px" }}>
          Cancel
        </button>
      </div>

      {/* Package selector */}
      <div style={{ fontSize: 10, color: t.textSecondary, fontWeight: "bold", marginBottom: 6 }}>
        Package Type
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {TEMPLATES.map((tp) => {
          const active = selectedTemplate === tp.id;
          return (
            <button
              key={tp.id}
              onClick={() => {
                setSelectedTemplate(tp.id);
                setPinCount(tp.pinCount);
              }}
              style={{
                padding: "6px 12px",
                fontSize: 10,
                fontFamily: "'JetBrains Mono','Fira Code',monospace",
                background: active ? t.textAccent + "18" : t.panelItemBg,
                color: active ? t.textAccent : t.textSecondary,
                border: `1px solid ${active ? t.textAccent + "60" : t.panelBorder}`,
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: active ? "bold" : "normal",
                transition: "all 0.1s",
              }}
            >
              <div>{tp.label}</div>
              <div style={{ fontSize: 8, color: t.textDim, marginTop: 2 }}>{tp.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Config */}
      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: t.textSecondary, marginBottom: 4 }}>Label</div>
          <input
            type="text"
            placeholder={`${tmpl.label}-${pinCount}`}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ width: 80 }}>
          <div style={{ fontSize: 10, color: t.textSecondary, marginBottom: 4 }}>
            {tmpl.archetype === "module" ? "Total Pins" : "Pins"}
          </div>
          <input
            type="number"
            min={tmpl.archetype === "module" ? 4 : 1}
            max={40}
            value={pinCount}
            onChange={(e) => setPinCount(Math.max(1, Math.min(40, parseInt(e.target.value, 10) || 1)))}
            style={{ ...inputStyle, width: "100%", textAlign: "center", boxSizing: "border-box" }}
          />
        </div>
      </div>

      {/* Preview sketch */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: t.textSecondary, marginBottom: 6 }}>Preview</div>
        <TemplatePreview tmpl={tmpl} pinCount={pinCount} tokens={t} />
      </div>

      <button
        onClick={handleCreate}
        style={{
          ...btnStyle,
          width: "100%",
          padding: "8px 0",
          color: t.btnAccentText,
          border: `1px solid ${t.btnAccentBorder}`,
          fontWeight: "bold",
        }}
      >
        Create Part Definition
      </button>
    </div>
  );
}

// ── Small SVG preview for template ──
function TemplatePreview({
  tmpl,
  pinCount,
  tokens: t,
}: {
  tmpl: PackageTemplate;
  pinCount: number;
  tokens: ThemeTokens;
}) {
  const ps = 14; // pin spacing
  const pr = 4;  // pin radius
  const pad = 20;

  if (tmpl.archetype === "module" && tmpl.rowGap !== undefined) {
    const half = Math.ceil(pinCount / 2);
    const bodyH = (half - 1) * ps + 20;
    const bodyW = (tmpl.rowGap - 1) * ps + 20;
    const w = bodyW + pad * 2;
    const h = bodyH + pad * 2;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width={Math.min(w, 300)} style={{ display: "block", background: t.boardCanvasBg, borderRadius: 4, border: `1px solid ${t.panelBorder}` }}>
        <rect x={pad} y={pad} width={bodyW} height={bodyH} fill={t.tmcBodyFill} stroke={t.tmcBodyStroke} strokeWidth={1} rx={3} />
        {/* Notch */}
        <path d={`M ${pad + bodyW / 2 - 6} ${pad} A 6 6 0 0 1 ${pad + bodyW / 2 + 6} ${pad}`} fill="none" stroke={t.tmcBodyStroke} strokeWidth={1} />
        {/* Left pins */}
        {Array.from({ length: half }, (_, i) => (
          <g key={`l${i}`}>
            <circle cx={pad} cy={pad + 10 + i * ps} r={pr} fill={t.holeEmpty} stroke={t.holeEmptyStroke} strokeWidth={0.8} />
            <text x={pad + 8} y={pad + 13 + i * ps} fontSize={7} fill={t.textDim} fontFamily="monospace">{i + 1}</text>
          </g>
        ))}
        {/* Right pins */}
        {Array.from({ length: pinCount - half }, (_, i) => (
          <g key={`r${i}`}>
            <circle cx={pad + bodyW} cy={pad + 10 + (half - 1 - i) * ps} r={pr} fill={t.holeEmpty} stroke={t.holeEmptyStroke} strokeWidth={0.8} />
            <text x={pad + bodyW - 9} y={pad + 13 + (half - 1 - i) * ps} fontSize={7} fill={t.textDim} fontFamily="monospace" textAnchor="end">{half + i + 1}</text>
          </g>
        ))}
      </svg>
    );
  }

  // Strip
  const w = (pinCount - 1) * ps + pad * 2;
  const h = 60;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={Math.min(w, 400)} style={{ display: "block", background: t.boardCanvasBg, borderRadius: 4, border: `1px solid ${t.panelBorder}` }}>
      <rect x={pad - 8} y={h / 2 - 10} width={(pinCount - 1) * ps + 16} height={20} fill={t.compFill} stroke={t.compBorderDefault} strokeWidth={1} rx={2} />
      {Array.from({ length: pinCount }, (_, i) => (
        <g key={`p${i}`}>
          <circle cx={pad + i * ps} cy={h / 2} r={pr} fill={t.holeEmpty} stroke={t.holeEmptyStroke} strokeWidth={0.8} />
          <text x={pad + i * ps} y={h / 2 - 14} fontSize={7} fill={t.textDim} fontFamily="monospace" textAnchor="middle">{i + 1}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Part detail panel ──
function PartDetailPanel({
  def,
  nets,
  comps,
  dispatch,
  tokens: t,
}: {
  def: PartDefinition;
  nets: Net[];
  comps: Component[];
  dispatch: ProjectDispatch;
  tokens: ThemeTokens;
}) {
  const [instanceLabel, setInstanceLabel] = useState("");
  const [selectedPin, setSelectedPin] = useState<{ row: number; pin: number } | null>(null);

  const instances = comps.filter((c) => c.defId === def.id);
  const totalPins = def.rows.reduce((sum, r) => sum + r.pins.length, 0);

  const inputStyle: CSSProperties = {
    padding: "3px 6px",
    fontSize: 11,
    fontFamily: "'JetBrains Mono','Fira Code',monospace",
    background: t.panelItemBg,
    color: t.textPrimary,
    border: `1px solid ${t.btnBorder}`,
    borderRadius: 3,
  };

  const btnStyle: CSSProperties = {
    padding: "4px 10px",
    fontSize: 10,
    fontFamily: "'JetBrains Mono','Fira Code',monospace",
    background: t.btnBg,
    color: t.btnText,
    border: `1px solid ${t.btnBorder}`,
    borderRadius: 3,
    cursor: "pointer",
  };

  function updateDefPin(rowIdx: number, pinIdx: number, updates: Partial<Pin>) {
    const newRows = def.rows.map((r, ri) =>
      ri === rowIdx
        ? { ...r, pins: r.pins.map((p, pi) => (pi === pinIdx ? { ...p, ...updates } : p)) }
        : r
    );
    dispatch({ type: "UPDATE_PART_DEF", id: def.id, updates: { rows: newRows } });
  }

  function moveDefPin(rowIdx: number, pinIdx: number, dir: number) {
    const row = def.rows[rowIdx];
    const newIdx = pinIdx + dir;
    if (newIdx < 0 || newIdx >= row.pins.length) return;
    const pins = [...row.pins];
    [pins[pinIdx], pins[newIdx]] = [pins[newIdx], pins[pinIdx]];
    const newRows = def.rows.map((r, ri) =>
      ri === rowIdx ? { ...r, pins } : r
    );
    dispatch({ type: "UPDATE_PART_DEF", id: def.id, updates: { rows: newRows } });
  }

  function addPin(rowIdx: number) {
    const row = def.rows[rowIdx];
    const newPin: Pin = { label: `${row.pins.length + 1}`, sig: "gnd" };
    const newRows = def.rows.map((r, ri) =>
      ri === rowIdx ? { ...r, pins: [...r.pins, newPin] } : r
    );
    dispatch({ type: "UPDATE_PART_DEF", id: def.id, updates: { rows: newRows } });
  }

  function removePin(rowIdx: number) {
    const row = def.rows[rowIdx];
    if (row.pins.length <= 1) return;
    const newRows = def.rows.map((r, ri) =>
      ri === rowIdx ? { ...r, pins: r.pins.slice(0, -1) } : r
    );
    dispatch({ type: "UPDATE_PART_DEF", id: def.id, updates: { rows: newRows } });
  }

  function placeOnBoard() {
    const lbl = instanceLabel.trim() || def.label;
    dispatch({
      type: "ADD_COMP",
      comp: { id: genCompId(), defId: def.id, col: 0, row: 0, rot: 0, label: lbl },
    });
    setInstanceLabel("");
  }

  // Net colour lookup
  function netColor(sig: string): string {
    const net = nets.find((n) => n.id === sig);
    return net ? net.color : "#666";
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: t.textAccent, fontWeight: "bold" }}>{def.label}</div>
          <div style={{ fontSize: 9, color: t.textDim, marginTop: 2 }}>
            {def.archetype === "module" ? "Module" : "Strip"} · {totalPins} pins
            {def.builtin ? " · built-in" : " · custom"}
            {def.rows.length > 1 && ` · ${def.rows.length} rows`}
          </div>
        </div>
        {!def.builtin && (
          <button
            onClick={() => {
              if (window.confirm(`Delete "${def.label}"? All ${instances.length} instances will be removed.`))
                dispatch({ type: "DELETE_PART_DEF", id: def.id });
            }}
            style={{ ...btnStyle, color: t.textDanger, border: `1px solid ${t.textDanger}40` }}
          >
            Delete Part
          </button>
        )}
      </div>

      {/* SVG Preview */}
      <div style={{ marginBottom: 12 }}>
        <PartPreview
          def={def}
          selectedPin={selectedPin}
          onSelectPin={setSelectedPin}
          netColor={netColor}
          tokens={t}
        />
      </div>

      {/* Appearance (editable for custom parts) */}
      {!def.builtin && (
        <div style={{
          padding: 10,
          background: t.panelItemBg,
          borderRadius: 4,
          border: `1px solid ${t.panelBorder}`,
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 10, color: t.textSecondary, fontWeight: "bold", marginBottom: 8 }}>
            Appearance
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, color: t.textTertiary }}>Body</span>
              <input
                type="color"
                value={def.bodyColor || "#1a1a2a"}
                onChange={(e) => dispatch({ type: "UPDATE_PART_DEF", id: def.id, updates: { bodyColor: e.target.value } })}
                style={{ width: 24, height: 24, padding: 0, border: `1px solid ${t.btnBorder}`, borderRadius: 2, cursor: "pointer", background: "transparent" }}
              />
              {def.bodyColor && (
                <button
                  onClick={() => dispatch({ type: "UPDATE_PART_DEF", id: def.id, updates: { bodyColor: undefined } })}
                  style={{ ...btnStyle, padding: "1px 4px", fontSize: 9 }}
                  title="Reset to default"
                >
                  x
                </button>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, color: t.textTertiary }}>Border</span>
              <input
                type="color"
                value={def.borderColor || "#3a3a4a"}
                onChange={(e) => dispatch({ type: "UPDATE_PART_DEF", id: def.id, updates: { borderColor: e.target.value } })}
                style={{ width: 24, height: 24, padding: 0, border: `1px solid ${t.btnBorder}`, borderRadius: 2, cursor: "pointer", background: "transparent" }}
              />
              {def.borderColor && (
                <button
                  onClick={() => dispatch({ type: "UPDATE_PART_DEF", id: def.id, updates: { borderColor: undefined } })}
                  style={{ ...btnStyle, padding: "1px 4px", fontSize: 9 }}
                  title="Reset to default"
                >
                  x
                </button>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <label style={{ fontSize: 10, color: t.textTertiary, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={def.rotatable}
                  onChange={(e) => dispatch({ type: "UPDATE_PART_DEF", id: def.id, updates: { rotatable: e.target.checked } })}
                  style={{ marginRight: 3 }}
                />
                Rotatable
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Pin detail + net assignment */}
      <div style={{
        padding: 10,
        background: t.panelItemBg,
        borderRadius: 4,
        border: `1px solid ${t.panelBorder}`,
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 10, color: t.textSecondary, fontWeight: "bold", marginBottom: 8 }}>
          Pins
          {def.builtin && (
            <span style={{ fontWeight: "normal", color: t.textDim }}>
              {" "}— definition is read-only (edit per-instance on the board)
            </span>
          )}
        </div>

        <PinGrid
          rows={def.rows.map((row, ri) => ({
            label: def.rows.length > 1 ? `Row ${ri + 1} — J${ri + 1}` : undefined,
            pins: row.pins,
          }))}
          nets={nets}
          sigColor={netColor}
          tokens={t}
          onMove={def.builtin ? undefined : moveDefPin}
          onUpdate={def.builtin ? undefined : updateDefPin}
        />

        {/* Add/remove for custom parts */}
        {!def.builtin && def.rows.map((row, ri) => (
          <div key={`addrem${ri}`} style={{ display: "flex", gap: 4, marginTop: 6 }}>
            {def.rows.length > 1 && (
              <span style={{ fontSize: 9, color: t.textDim, lineHeight: "20px" }}>J{ri + 1}:</span>
            )}
            <button onClick={() => addPin(ri)} style={{ ...btnStyle, fontSize: 9, padding: "2px 6px" }}>
              + Pin
            </button>
            {row.pins.length > 1 && (
              <button onClick={() => removePin(ri)} style={{ ...btnStyle, fontSize: 9, padding: "2px 6px" }}>
                - Pin
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Place instance */}
      <div style={{
        padding: 10,
        background: t.panelItemBg,
        borderRadius: 4,
        border: `1px solid ${t.panelBorder}`,
      }}>
        <div style={{ fontSize: 10, color: t.textSecondary, fontWeight: "bold", marginBottom: 6 }}>
          Place on Board
          {instances.length > 0 && (
            <span style={{ fontWeight: "normal", color: t.textDim }}> — {instances.length} on board</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="text"
            placeholder={def.label}
            value={instanceLabel}
            onChange={(e) => setInstanceLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") placeOnBoard(); }}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={placeOnBoard}
            style={{
              ...btnStyle,
              color: t.btnAccentText,
              border: `1px solid ${t.btnAccentBorder}`,
              fontWeight: "bold",
            }}
          >
            + Place
          </button>
        </div>
        {instances.length > 0 && (
          <div style={{ marginTop: 6, fontSize: 9, color: t.textDim }}>
            Instances: {instances.map((c) => c.label).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Interactive SVG part preview ──
function PartPreview({
  def,
  selectedPin,
  onSelectPin,
  netColor,
  tokens: t,
}: {
  def: PartDefinition;
  selectedPin: { row: number; pin: number } | null;
  onSelectPin: (pin: { row: number; pin: number } | null) => void;
  netColor: (sig: string) => string;
  tokens: ThemeTokens;
}) {
  const ps = 20; // pin spacing
  const pr = 5;  // pin radius
  const pad = 30;

  if (def.archetype === "module") {
    // Dual-row module
    const maxPins = Math.max(...def.rows.map((r) => r.pins.length));
    const bodyH = (maxPins - 1) * ps + 24;
    const colSpan = Math.max(...def.rows.map((r) => r.offset[0])) - Math.min(...def.rows.map((r) => r.offset[0]));
    const bodyW = colSpan * ps + 10;
    const minOff = Math.min(...def.rows.map((r) => r.offset[0]));
    const w = bodyW + pad * 2 + 40;
    const h = bodyH + pad * 2;

    return (
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={Math.min(w, 400)}
        style={{ display: "block", background: t.boardCanvasBg, borderRadius: 4, border: `1px solid ${t.panelBorder}`, cursor: "pointer" }}
        onClick={() => onSelectPin(null)}
      >
        {/* Body */}
        <rect
          x={pad + 5}
          y={pad}
          width={bodyW}
          height={bodyH}
          fill={def.bodyColor || t.tmcBodyFill}
          stroke={def.borderColor || t.tmcBodyStroke}
          strokeWidth={1.5}
          rx={3}
        />
        {/* Notch */}
        <path
          d={`M ${pad + 5 + bodyW / 2 - 8} ${pad} A 8 8 0 0 1 ${pad + 5 + bodyW / 2 + 8} ${pad}`}
          fill="none"
          stroke={def.borderColor || t.tmcBodyStroke}
          strokeWidth={1}
        />
        {/* Pins per row */}
        {def.rows.map((row, ri) => {
          const cx = pad + 5 + (row.offset[0] - minOff) * ps + 5;
          const isLeft = ri === 0;
          return row.pins.map((pin, pi) => {
            const cy = pad + 12 + pi * ps;
            const isSel = selectedPin?.row === ri && selectedPin?.pin === pi;
            const col = netColor(pin.sig);
            return (
              <g
                key={`${ri}_${pi}`}
                onClick={(e) => { e.stopPropagation(); onSelectPin({ row: ri, pin: pi }); }}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSel ? pr + 2 : pr}
                  fill={col + "44"}
                  stroke={isSel ? t.textAccent : col + "aa"}
                  strokeWidth={isSel ? 2 : 1}
                />
                <text
                  x={isLeft ? cx - pr - 4 : cx + pr + 4}
                  y={cy + 3.5}
                  fontSize={8}
                  fill={isSel ? t.textAccent : col}
                  fontFamily="monospace"
                  fontWeight={isSel ? "bold" : "normal"}
                  textAnchor={isLeft ? "end" : "start"}
                  style={{ pointerEvents: "none" }}
                >
                  {pin.label}
                </text>
              </g>
            );
          });
        })}
      </svg>
    );
  }

  // Strip
  const pinCount = def.rows[0].pins.length;
  const w = (pinCount - 1) * ps + pad * 2;
  const h = 80;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={Math.min(w, 400)}
      style={{ display: "block", background: t.boardCanvasBg, borderRadius: 4, border: `1px solid ${t.panelBorder}`, cursor: "pointer" }}
      onClick={() => onSelectPin(null)}
    >
      <rect
        x={pad - 10}
        y={h / 2 - 12}
        width={(pinCount - 1) * ps + 20}
        height={24}
        fill={def.bodyColor || t.compFill}
        stroke={def.borderColor || t.compBorderDefault}
        strokeWidth={1.5}
        rx={3}
      />
      {def.rows[0].pins.map((pin, pi) => {
        const cx = pad + pi * ps;
        const cy = h / 2;
        const isSel = selectedPin?.row === 0 && selectedPin?.pin === pi;
        const col = netColor(pin.sig);
        return (
          <g
            key={`p${pi}`}
            onClick={(e) => { e.stopPropagation(); onSelectPin({ row: 0, pin: pi }); }}
            style={{ cursor: "pointer" }}
          >
            <circle
              cx={cx}
              cy={cy}
              r={isSel ? pr + 2 : pr}
              fill={col + "44"}
              stroke={isSel ? t.textAccent : col + "aa"}
              strokeWidth={isSel ? 2 : 1}
            />
            <text
              x={cx}
              y={cy - pr - 6}
              fontSize={8}
              fill={isSel ? t.textAccent : col}
              fontFamily="monospace"
              fontWeight={isSel ? "bold" : "normal"}
              textAnchor="middle"
              style={{ pointerEvents: "none" }}
            >
              {pin.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
