import type { CSSProperties } from "react";
import type { Pin, Net } from "../types";
import type { ThemeTokens } from "../theme/tokens";

export interface PinGridRow {
  label?: string;
  pins: Pin[];
}

export interface PinGridProps {
  rows: PinGridRow[];
  nets: Net[];
  sigColor: (id: string) => string;
  tokens: ThemeTokens;
  /** Called when a pin is reordered. null = reorder not supported */
  onMove?: (rowIdx: number, pinIdx: number, dir: number) => void;
  /** Called when a pin label or net changes. null = read-only */
  onUpdate?: (rowIdx: number, pinIdx: number, updates: Partial<Pin>) => void;
  /** Compact mode for narrow side panel */
  compact?: boolean;
}

export function PinGrid({
  rows,
  nets,
  sigColor,
  tokens: t,
  onMove,
  onUpdate,
  compact,
}: PinGridProps) {
  const inputStyle: CSSProperties = {
    padding: compact ? "2px 4px" : "2px 4px",
    fontSize: compact ? 10 : 10,
    fontFamily: "'JetBrains Mono','Fira Code',monospace",
    background: t.panelItemBg,
    color: t.textPrimary,
    border: `1px solid ${t.btnBorder}`,
    borderRadius: 2,
  };

  const arrBtn: CSSProperties = {
    padding: "1px 4px",
    fontSize: 10,
    fontFamily: "inherit",
    background: t.btnBg,
    color: t.btnAccentText,
    border: `1px solid ${t.btnAccentBorder}`,
    borderRadius: 2,
    cursor: "pointer",
    lineHeight: 1,
  };

  return (
    <>
      {rows.map((row, ri) => (
        <div key={ri} style={{ marginBottom: ri < rows.length - 1 ? 8 : 0 }}>
          {row.label && (
            <div style={{
              fontSize: 10,
              color: t.textSecondary,
              fontWeight: "bold",
              marginBottom: 4,
            }}>
              {row.label}
            </div>
          )}
          {row.pins.map((pin, pi) => (
            <div
              key={pi}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 2,
                background: t.panelItemBg,
                borderRadius: 3,
                padding: compact ? "3px 4px" : "3px 6px",
                border: `1px solid ${t.panelBorder}`,
              }}
            >
              {/* Index */}
              <span style={{
                fontSize: 9,
                color: t.textDim,
                width: 14,
                textAlign: "center",
                flexShrink: 0,
              }}>
                {pi + 1}
              </span>

              {/* Net colour swatch */}
              <span style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: sigColor(pin.sig),
                flexShrink: 0,
              }} />

              {/* Label — editable or static */}
              {onUpdate ? (
                <input
                  value={pin.label}
                  onChange={(e) => onUpdate(ri, pi, { label: e.target.value })}
                  style={{
                    ...inputStyle,
                    width: compact ? 40 : 50,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <span style={{
                  fontSize: 10,
                  color: sigColor(pin.sig),
                  fontWeight: "bold",
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {pin.label}
                  {pin.wire && (
                    <span style={{ fontWeight: "normal", opacity: 0.6 }}>
                      {" "}{pin.wire}
                    </span>
                  )}
                </span>
              )}

              {/* Net selector */}
              {onUpdate ? (
                <select
                  value={pin.sig}
                  onChange={(e) => onUpdate(ri, pi, { sig: e.target.value })}
                  style={{
                    ...inputStyle,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {nets.map((n) => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
              ) : (
                <span style={{
                  fontSize: 9,
                  color: t.textTertiary,
                  flex: onMove ? 0 : 1,
                }}>
                  {nets.find((n) => n.id === pin.sig)?.label ?? pin.sig}
                </span>
              )}

              {/* Reorder arrows */}
              {onMove && (
                <>
                  <button
                    onClick={() => onMove(ri, pi, -1)}
                    disabled={pi === 0}
                    style={{ ...arrBtn, opacity: pi === 0 ? 0.2 : 1 }}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => onMove(ri, pi, 1)}
                    disabled={pi === row.pins.length - 1}
                    style={{ ...arrBtn, opacity: pi === row.pins.length - 1 ? 0.2 : 1 }}
                  >
                    ▼
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
