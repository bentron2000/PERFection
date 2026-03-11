import { useState, type CSSProperties } from "react";
import type { Net } from "../types";
import type { ThemeTokens } from "../theme/tokens";
import type { ProjectDispatch } from "../state/useProjectStore";

interface NetEditorProps {
  nets: Net[];
  dispatch: ProjectDispatch;
  tokens: ThemeTokens;
}

let nextId = 1;
function genId() {
  return `net_${Date.now()}_${nextId++}`;
}

export function NetEditor({ nets, dispatch, tokens: t }: NetEditorProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#888888");

  const rowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
    padding: "4px 6px",
    background: t.panelItemBg,
    borderRadius: 3,
    border: `1px solid ${t.panelBorder}`,
  };

  const inputStyle: CSSProperties = {
    padding: "2px 5px",
    fontSize: 11,
    fontFamily: "'JetBrains Mono','Fira Code',monospace",
    background: t.panelItemBg,
    color: t.textPrimary,
    border: `1px solid ${t.btnBorder}`,
    borderRadius: 3,
  };

  const smallBtn: CSSProperties = {
    padding: "2px 7px",
    fontSize: 10,
    fontFamily: "'JetBrains Mono','Fira Code',monospace",
    background: t.btnBg,
    color: t.btnText,
    border: `1px solid ${t.btnBorder}`,
    borderRadius: 3,
    cursor: "pointer",
  };

  const handleAdd = () => {
    const label = newLabel.trim();
    if (!label) return;
    const id = genId();
    dispatch({ type: "ADD_NET", net: { id, label, color: newColor } });
    setNewLabel("");
  };

  return (
    <div>
      {/* Existing nets */}
      {nets.map((net) => (
        <div key={net.id} style={rowStyle}>
          <input
            type="color"
            value={net.color}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_NET",
                id: net.id,
                updates: { color: e.target.value },
              })
            }
            style={{
              width: 22,
              height: 22,
              padding: 0,
              border: `1px solid ${t.btnBorder}`,
              borderRadius: 2,
              cursor: "pointer",
              background: "transparent",
            }}
          />
          <input
            type="text"
            value={net.label}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_NET",
                id: net.id,
                updates: { label: e.target.value },
              })
            }
            style={{ ...inputStyle, flex: 1, minWidth: 60 }}
          />
          <span style={{ fontSize: 9, color: t.textDim, minWidth: 50 }}>
            {net.id.length > 8 ? "custom" : net.id}
          </span>
          <button
            onClick={() => {
              if (
                window.confirm(
                  `Delete net "${net.label}"? Traces using this net will keep their colour but the net will no longer appear in the palette.`
                )
              )
                dispatch({ type: "DELETE_NET", id: net.id });
            }}
            style={{ ...smallBtn, color: t.textDanger, padding: "2px 5px" }}
          >
            ×
          </button>
        </div>
      ))}

      {/* Add new net */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 8,
        }}
      >
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          style={{
            width: 22,
            height: 22,
            padding: 0,
            border: `1px solid ${t.btnBorder}`,
            borderRadius: 2,
            cursor: "pointer",
            background: "transparent",
          }}
        />
        <input
          type="text"
          placeholder="New net label..."
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          onClick={handleAdd}
          disabled={!newLabel.trim()}
          style={{
            ...smallBtn,
            color: t.btnAccentText,
            border: `1px solid ${t.btnAccentBorder}`,
            opacity: newLabel.trim() ? 1 : 0.4,
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
