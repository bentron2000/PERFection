import { HR, px, py } from "../constants";

interface HitTargetsProps {
  cols: number;
  rows: number;
  hasDrag: boolean;
  eraseMode: boolean;
  onHoleDown: (c: number, r: number, e: React.MouseEvent) => void;
  onEraseHole: (c: number, r: number) => void;
  onHover: (pos: [number, number] | null) => void;
}

export function HitTargets({
  cols,
  rows,
  hasDrag,
  eraseMode,
  onHoleDown,
  onEraseHole,
  onHover,
}: HitTargetsProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <circle
            key={`hit${c},${r}`}
            cx={px(c)}
            cy={py(r)}
            r={HR + 3}
            fill="transparent"
            stroke="none"
            style={{
              cursor: hasDrag ? "grabbing" : "crosshair",
              pointerEvents: hasDrag ? "none" : "auto",
            }}
            onMouseDown={(e) => {
              if (eraseMode) {
                onEraseHole(c, r);
                return;
              }
              onHoleDown(c, r, e);
            }}
            onMouseEnter={() => onHover([c, r])}
            onMouseLeave={() => onHover(null)}
          />
        ))
      )}
    </>
  );
}
