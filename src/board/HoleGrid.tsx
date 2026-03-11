import { HR, px, py } from "../constants";
import type { OccEntry } from "../types";
import type { ThemeTokens } from "../theme/tokens";

/** Build an octagon path centred at (cx, cy) with given radius */
function octagon(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 8) + (i * Math.PI) / 4;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return `M${pts.join("L")}Z`;
}

interface HoleGridProps {
  cols: number;
  rows: number;
  occMap: Record<string, OccEntry>;
  conflicts: Set<string>;
  hovered: [number, number] | null;
  eraseMode: boolean;
  sigColor: (id: string) => string;
  tokens: ThemeTokens;
}

export function HoleGrid({ cols, rows, occMap, conflicts, hovered, eraseMode, sigColor, tokens: t }: HoleGridProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const k = `${c},${r}`;
          const o = occMap[k];
          const isHov = hovered?.[0] === c && hovered?.[1] === r;
          const pc = o ? sigColor(o.pin.sig) : null;
          const hasConflict = conflicts.has(k);
          return (
            <g key={`vh${k}`}>
              <circle
                cx={px(c)}
                cy={py(r)}
                r={o ? HR + 0.5 : isHov ? HR : HR - 1}
                fill={o ? pc + "44" : t.holeEmpty}
                stroke={
                  isHov
                    ? eraseMode
                      ? t.holeEraseStroke
                      : t.holeHoverStroke
                    : o
                      ? pc + "88"
                      : t.holeEmptyStroke
                }
                strokeWidth={o ? 1.2 : isHov ? 1 : 0.4}
                style={{ pointerEvents: "none" }}
              />
              {hasConflict && (
                <path
                  d={octagon(px(c), py(r), HR + 4)}
                  fill="none"
                  stroke="#ff2222"
                  strokeWidth={1.5}
                  style={{ pointerEvents: "none" }}
                />
              )}
            </g>
          );
        })
      )}
    </>
  );
}
