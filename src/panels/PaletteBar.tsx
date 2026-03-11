import type { Net } from "../types";
import type { ProjectDispatch } from "../state/useProjectStore";
import type { ThemeTokens } from "../theme/tokens";

interface PaletteBarProps {
  nets: Net[];
  activeSig: string;
  eraseMode: boolean;
  dispatch: ProjectDispatch;
  tokens: ThemeTokens;
}

export function PaletteBar({
  nets,
  activeSig,
  eraseMode,
  dispatch,
  tokens: t,
}: PaletteBarProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 6 }}>
      {nets.map((p) => {
        const active = activeSig === p.id && !eraseMode;
        return (
          <button
            key={p.id}
            onClick={() => dispatch({ type: "SET_ACTIVE_SIG", sig: p.id })}
            style={{
              padding: "2px 7px",
              fontSize: 9,
              fontFamily: "inherit",
              background: active ? p.color + "28" : t.paletteInactiveBg,
              color: active ? p.color : t.paletteInactiveText,
              border: `1px solid ${active ? p.color : t.paletteInactiveBorder}`,
              borderRadius: 3,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: 1,
                background: p.color,
                marginRight: 3,
                verticalAlign: "middle",
              }}
            />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
