import { useState, type CSSProperties } from "react";
import type { ThemeTokens } from "../theme/tokens";
import type { ProjectState } from "../state/project";
import type { ProjectDispatch } from "../state/useProjectStore";
import { MIN_COLS, MAX_COLS, MIN_ROWS, MAX_ROWS } from "../constants";
import { NetEditor } from "../nets/NetEditor";
import { PartEditor } from "../parts/PartEditor";

type SettingsTab = "general" | "nets" | "parts";

interface SettingsPageProps {
  state: ProjectState;
  dispatch: ProjectDispatch;
  tokens: ThemeTokens;
  mode: "dark" | "light";
  toggleTheme: () => void;
}

export function SettingsPage({
  state,
  dispatch,
  tokens: t,
  mode,
  toggleTheme,
}: SettingsPageProps) {
  const [tab, setTab] = useState<SettingsTab>("general");
  const { cols, rows } = state;

  const sectionStyle: CSSProperties = {
    background: t.panelBg,
    border: `1px solid ${t.panelBorder}`,
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
  };

  const labelStyle: CSSProperties = {
    fontSize: 12,
    color: t.textAccent,
    fontWeight: "bold",
    marginBottom: 10,
    display: "block",
  };

  const descStyle: CSSProperties = {
    fontSize: 10,
    color: t.textTertiary,
    marginBottom: 10,
    lineHeight: 1.5,
  };

  const btnStyle: CSSProperties = {
    padding: "4px 12px",
    fontSize: 11,
    fontFamily: "'JetBrains Mono','Fira Code',monospace",
    background: t.btnBg,
    color: t.btnText,
    border: `1px solid ${t.btnBorder}`,
    borderRadius: 3,
    cursor: "pointer",
  };

  const smallBtn: CSSProperties = {
    ...btnStyle,
    padding: "2px 8px",
    fontSize: 12,
    fontWeight: "bold",
    width: 28,
    textAlign: "center",
  };

  const inputStyle: CSSProperties = {
    width: 56,
    padding: "3px 6px",
    fontSize: 12,
    fontFamily: "'JetBrains Mono','Fira Code',monospace",
    background: t.panelItemBg,
    color: t.textPrimary,
    border: `1px solid ${t.btnBorder}`,
    borderRadius: 3,
    textAlign: "center",
  };

  const tabBtn = (id: SettingsTab, label: string) => {
    const active = tab === id;
    return (
      <button
        key={id}
        onClick={() => setTab(id)}
        style={{
          padding: "6px 16px",
          fontSize: 11,
          fontFamily: "'JetBrains Mono','Fira Code',monospace",
          background: active ? t.panelBg : "transparent",
          color: active ? t.textAccent : t.textTertiary,
          border: "none",
          borderBottom: active ? `2px solid ${t.textAccent}` : "2px solid transparent",
          cursor: "pointer",
          fontWeight: active ? "bold" : "normal",
          transition: "all 0.15s",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ maxWidth: tab === "parts" ? 680 : 480 }}>
      {/* Sub-tab bar */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 12,
          borderBottom: `1px solid ${t.panelBorder}`,
        }}
      >
        {tabBtn("general", "General")}
        {tabBtn("nets", "Nets")}
        {tabBtn("parts", "Parts")}
      </div>

      {tab === "general" && (
        <>
          {/* Theme */}
          <div style={sectionStyle}>
            <span style={labelStyle}>Appearance</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: t.textSecondary }}>Theme</span>
              <button
                onClick={toggleTheme}
                style={{
                  ...btnStyle,
                  color: t.btnAccentText,
                  border: `1px solid ${t.btnAccentBorder}`,
                }}
              >
                {mode === "dark" ? "Switch to Light" : "Switch to Dark"}
              </button>
              <span style={{ fontSize: 10, color: t.textDim }}>
                Currently: {mode}
              </span>
            </div>
          </div>

          {/* Board Size */}
          <div style={sectionStyle}>
            <span style={labelStyle}>Board Size</span>
            <div style={descStyle}>
              Set the number of columns and rows on the perfboard.
              Range: {MIN_COLS}–{MAX_COLS} columns, {MIN_ROWS}–{MAX_ROWS} rows.
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: t.textSecondary, width: 60 }}>Columns</span>
              <button
                onClick={() => dispatch({ type: "SET_BOARD_SIZE", cols: cols - 1, rows })}
                disabled={cols <= MIN_COLS}
                style={{ ...smallBtn, opacity: cols <= MIN_COLS ? 0.3 : 1 }}
              >
                −
              </button>
              <input
                type="number"
                min={MIN_COLS}
                max={MAX_COLS}
                value={cols}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) dispatch({ type: "SET_BOARD_SIZE", cols: v, rows });
                }}
                style={inputStyle}
              />
              <button
                onClick={() => dispatch({ type: "SET_BOARD_SIZE", cols: cols + 1, rows })}
                disabled={cols >= MAX_COLS}
                style={{ ...smallBtn, opacity: cols >= MAX_COLS ? 0.3 : 1 }}
              >
                +
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 11, color: t.textSecondary, width: 60 }}>Rows</span>
              <button
                onClick={() => dispatch({ type: "SET_BOARD_SIZE", cols, rows: rows - 1 })}
                disabled={rows <= MIN_ROWS}
                style={{ ...smallBtn, opacity: rows <= MIN_ROWS ? 0.3 : 1 }}
              >
                −
              </button>
              <input
                type="number"
                min={MIN_ROWS}
                max={MAX_ROWS}
                value={rows}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) dispatch({ type: "SET_BOARD_SIZE", cols, rows: v });
                }}
                style={inputStyle}
              />
              <button
                onClick={() => dispatch({ type: "SET_BOARD_SIZE", cols, rows: rows + 1 })}
                disabled={rows >= MAX_ROWS}
                style={{ ...smallBtn, opacity: rows >= MAX_ROWS ? 0.3 : 1 }}
              >
                +
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div style={sectionStyle}>
            <span style={labelStyle}>Data</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  if (window.confirm("Clear all traces? Components will be kept."))
                    dispatch({ type: "CLEAR_TRACES" });
                }}
                style={{ ...btnStyle, color: t.textDanger }}
              >
                Clear Traces
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Reset everything to default? All traces and component positions will be lost."))
                    dispatch({ type: "RESET" });
                }}
                style={{ ...btnStyle, color: t.textWarn }}
              >
                Reset All
              </button>
            </div>
          </div>
        </>
      )}

      {tab === "nets" && (
        <div style={sectionStyle}>
          <span style={labelStyle}>Nets</span>
          <div style={descStyle}>
            Define signal nets for your board. Each net has a label and colour.
            Traces drawn from a pin inherit the pin's net.
          </div>
          <NetEditor nets={state.nets} dispatch={dispatch} tokens={t} />
        </div>
      )}

      {tab === "parts" && (
        <PartEditor
          partDefs={state.partDefs}
          comps={state.comps}
          nets={state.nets}
          dispatch={dispatch}
          tokens={t}
        />
      )}
    </div>
  );
}
