import { HR, px, py } from "../constants";
import type { DrawState, Segment } from "../types";

interface TraceLayerProps {
  segments: Segment[];
  drawState: DrawState | null;
  sigColor: (id: string) => string;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  eraseMode: boolean;
}

export function TraceLayer({
  segments,
  drawState,
  sigColor,
  selectedIndex,
  onSelect,
  eraseMode,
}: TraceLayerProps) {
  return (
    <>
      {/* Placed traces */}
      {segments.map((s, i) => {
        const isSel = selectedIndex === i;
        return (
          <g key={`s${i}`}>
            {/* Visible trace */}
            <line
              x1={px(s.c1)}
              y1={py(s.r1)}
              x2={px(s.c2)}
              y2={py(s.r2)}
              stroke={sigColor(s.sig)}
              strokeWidth={isSel ? 5 : 4}
              strokeLinecap="round"
              opacity={isSel ? 1 : 0.8}
              style={{ pointerEvents: "none" }}
            />
            {/* Selection highlight */}
            {isSel && (
              <line
                x1={px(s.c1)}
                y1={py(s.r1)}
                x2={px(s.c2)}
                y2={py(s.r2)}
                stroke="#fff"
                strokeWidth={8}
                strokeLinecap="round"
                opacity={0.15}
                style={{ pointerEvents: "none" }}
              />
            )}
            {/* Invisible wide hit target for clicking */}
            <line
              x1={px(s.c1)}
              y1={py(s.r1)}
              x2={px(s.c2)}
              y2={py(s.r2)}
              stroke="transparent"
              strokeWidth={12}
              strokeLinecap="round"
              style={{ cursor: eraseMode ? "pointer" : "pointer", pointerEvents: "auto" }}
              onClick={(e) => {
                e.stopPropagation();
                if (!eraseMode) onSelect(i);
              }}
            />
          </g>
        );
      })}

      {/* Draw preview */}
      {drawState &&
        (drawState.sc !== drawState.curC ||
          drawState.sr !== drawState.curR) && (
          <line
            x1={px(drawState.sc)}
            y1={py(drawState.sr)}
            x2={px(drawState.curC)}
            y2={py(drawState.curR)}
            stroke={sigColor(drawState.sig)}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.5}
            style={{ pointerEvents: "none" }}
          />
        )}

      {/* Start hole ring */}
      {drawState && (
        <circle
          cx={px(drawState.sc)}
          cy={py(drawState.sr)}
          r={HR + 4}
          fill="none"
          stroke={sigColor(drawState.sig)}
          strokeWidth={2}
          style={{ pointerEvents: "none" }}
        />
      )}
    </>
  );
}
