import type { Component, DragState, PartDefinition, Selection } from "../types";
import type { ThemeTokens } from "../theme/tokens";
import { S, px, py } from "../constants";
import {
  getHoles,
  getStripOutline,
  compLabelPos,
  labelOffset,
  resolvedRowPins,
} from "../parts/partGeometry";

interface ComponentLayerProps {
  comps: Component[];
  partDefs: PartDefinition[];
  dragState: DragState | null;
  selected: Selection;
  sigColor: (id: string) => string;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onSelect: (id: string) => void;
  tokens: ThemeTokens;
}

export function ComponentLayer({
  comps,
  partDefs,
  dragState,
  selected,
  sigColor,
  onMouseDown,
  onSelect,
  tokens: t,
}: ComponentLayerProps) {
  return (
    <>
      {comps.map((comp) => {
        const def = partDefs.find((d) => d.id === comp.defId);
        if (!def) return null;
        const isDrag = dragState?.id === comp.id;
        const isSel = selected?.type === "comp" && selected.id === comp.id;

        if (def.archetype === "module" && def.id === "tmc5160") {
          return (
            <TmcModule
              key={comp.id}
              comp={comp}
              def={def}
              isDrag={isDrag}
              isSel={isSel}
              onMouseDown={onMouseDown}
              onSelect={onSelect}
              hasDrag={!!dragState}
              tokens={t}
            />
          );
        }

        if (def.archetype === "module") {
          return (
            <GenericModule
              key={comp.id}
              comp={comp}
              def={def}
              isDrag={isDrag}
              isSel={isSel}
              sigColor={sigColor}
              onMouseDown={onMouseDown}
              onSelect={onSelect}
              hasDrag={!!dragState}
              tokens={t}
            />
          );
        }

        // Strip rendering
        const holes = getHoles(comp, def);
        const outline = getStripOutline(comp, def);
        const lp = compLabelPos(comp, def);
        const lo = labelOffset(comp.rot);
        const borderCol = isSel
          ? t.compSelectStroke
          : isDrag
            ? t.compSelectStroke
            : def.borderColor
              ? def.borderColor
              : comp.defId === "power-2pin"
                ? t.compBorderPower
                : comp.defId === "ribbon-9pin"
                  ? t.compBorderRibbon
                  : t.compBorderDefault;

        return (
          <g
            key={comp.id}
            style={{ cursor: isDrag ? "grabbing" : "grab" }}
            onMouseDown={(e) => onMouseDown(e, comp.id)}
            onClick={(e) => {
              e.stopPropagation();
              if (!dragState) onSelect(comp.id);
            }}
          >
            {outline && (
              <rect
                x={outline.x}
                y={outline.y}
                width={outline.w}
                height={outline.h}
                fill={isDrag ? t.compFillDrag : def.bodyColor || t.compFill}
                stroke={borderCol}
                strokeWidth={isSel || isDrag ? 2 : 1}
                rx={2}
              />
            )}
            <text
              x={lp.x}
              y={lp.y}
              fontSize={7.5}
              fill={borderCol}
              textAnchor="middle"
              fontFamily="monospace"
              fontWeight="bold"
              style={{ pointerEvents: "none" }}
            >
              {comp.label}
            </text>
            {holes.map((h, i) => (
              <g key={`pl${i}`}>
                <text
                  x={px(h.c) + lo.dx}
                  y={py(h.r) + lo.dy}
                  fontSize={7.5}
                  fill={sigColor(h.pin.sig)}
                  textAnchor={lo.anchor}
                  fontFamily="monospace"
                  fontWeight="bold"
                  style={{ pointerEvents: "none" }}
                >
                  {h.pin.label}
                </text>
                {h.pin.wire && (
                  <text
                    x={px(h.c) + lo.dx * 1.7}
                    y={py(h.r) + lo.dy * 1.7}
                    fontSize={6}
                    fill={sigColor(h.pin.sig)}
                    textAnchor={lo.anchor}
                    fontFamily="monospace"
                    opacity={0.7}
                    style={{ pointerEvents: "none" }}
                  >
                    {h.pin.wire}
                  </text>
                )}
              </g>
            ))}
          </g>
        );
      })}
    </>
  );
}

// ── Generic Module sub-component (for user-defined modules) ──
function GenericModule({
  comp,
  def,
  isDrag,
  isSel,
  sigColor,
  onMouseDown,
  onSelect,
  hasDrag,
  tokens: t,
}: {
  comp: Component;
  def: PartDefinition;
  isDrag: boolean;
  isSel: boolean;
  sigColor: (id: string) => string;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onSelect: (id: string) => void;
  hasDrag: boolean;
  tokens: ThemeTokens;
}) {
  // Compute outline from rot=0 geometry, then rotate the SVG group
  const rot = comp.rot || 0;
  const unrotComp = { ...comp, rot: 0 };
  const outline = getStripOutline(unrotComp, def);
  const holes = getHoles(unrotComp, def);
  const borderCol = isSel ? t.compSelectStroke : isDrag ? t.compSelectStroke : def.borderColor || t.compBorderDefault;

  const pivotX = px(comp.col);
  const pivotY = py(comp.row);
  const rotDeg = rot * 90;

  return (
    <g
      style={{ cursor: isDrag ? "grabbing" : "grab" }}
      onMouseDown={(e) => onMouseDown(e, comp.id)}
      onClick={(e) => {
        e.stopPropagation();
        if (!hasDrag) onSelect(comp.id);
      }}
      transform={rot ? `rotate(${rotDeg} ${pivotX} ${pivotY})` : undefined}
    >
      {outline && (
        <rect
          x={outline.x}
          y={outline.y}
          width={outline.w}
          height={outline.h}
          fill={isDrag ? t.compFillDrag : def.bodyColor || t.tmcBodyFill}
          stroke={borderCol}
          strokeWidth={isSel || isDrag ? 2 : 1}
          rx={3}
        />
      )}
      <text
        x={outline ? outline.x + outline.w / 2 : px(comp.col)}
        y={outline ? outline.y - 6 : py(comp.row) - 18}
        fontSize={7.5}
        fill={borderCol}
        textAnchor="middle"
        fontFamily="monospace"
        fontWeight="bold"
        style={{ pointerEvents: "none" }}
      >
        {comp.label}
      </text>
      {holes.map((h, i) => (
        <text
          key={`ml${i}`}
          x={h.side.startsWith("j1") ? px(h.c) - 10 : px(h.c) + 10}
          y={py(h.r) + 3.5}
          fontSize={7}
          fill={sigColor(h.pin.sig)}
          textAnchor={h.side.startsWith("j1") ? "end" : "start"}
          fontFamily="monospace"
          style={{ pointerEvents: "none" }}
        >
          {h.pin.label}
        </text>
      ))}
    </g>
  );
}

// ── TMC5160 Module sub-component (preserves original detailed rendering) ──
function TmcModule({
  comp,
  def,
  isDrag,
  isSel,
  onMouseDown,
  onSelect,
  hasDrag,
  tokens: t,
}: {
  comp: Component;
  def: PartDefinition;
  isDrag: boolean;
  isSel: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onSelect: (id: string) => void;
  hasDrag: boolean;
  tokens: ThemeTokens;
}) {
  // Render at rot=0, then rotate the entire group around the anchor point
  const rot = comp.rot || 0;
  const j1Pins = resolvedRowPins(comp, def, 0);
  const j2Pins = resolvedRowPins(comp, def, 1);
  const j1x = px(comp.col + def.rows[0].offset[0]);
  const j2x = px(comp.col + def.rows[1].offset[0]);
  const midX = (j1x + j2x) / 2;
  const inset = 14;
  const vpad = 10;
  const bx = j1x + inset;
  const by = py(comp.row) - vpad;
  const bw = j2x - j1x - inset * 2;
  const bh = (j1Pins.length - 1) * S + vpad * 2;
  const hsPad = 6;
  const hsX = bx + hsPad;
  const hsW = bw - hsPad * 2;
  const hsY = by + 12;
  const hsH = bh * 0.45;
  const selStroke = isSel ? t.compSelectStroke : isDrag ? t.compSelectStroke : t.tmcBodyStroke;

  // Pivot point for rotation is the component origin
  const pivotX = px(comp.col);
  const pivotY = py(comp.row);
  const rotDeg = rot * 90;

  return (
    <g
      style={{ cursor: isDrag ? "grabbing" : "grab" }}
      onMouseDown={(e) => onMouseDown(e, comp.id)}
      onClick={(e) => {
        e.stopPropagation();
        if (!hasDrag) onSelect(comp.id);
      }}
      transform={rot ? `rotate(${rotDeg} ${pivotX} ${pivotY})` : undefined}
    >
      <rect
        x={bx}
        y={by}
        width={bw}
        height={bh}
        fill={isDrag ? t.compFillDrag : t.tmcBodyFill}
        stroke={selStroke}
        strokeWidth={isSel || isDrag ? 2 : 1}
        rx={3}
      />
      <rect
        x={hsX}
        y={hsY}
        width={hsW}
        height={hsH}
        fill={t.tmcHeatsinkFill}
        stroke={t.tmcHeatsinkStroke}
        strokeWidth={0.8}
        rx={2}
      />
      {Array.from({ length: 5 }, (_, fi) => {
        const fy = hsY + 4 + fi * ((hsH - 8) / 4);
        return (
          <line
            key={`fin${fi}`}
            x1={hsX + 3}
            y1={fy}
            x2={hsX + hsW - 3}
            y2={fy}
            stroke={t.tmcFinStroke}
            strokeWidth={1}
            style={{ pointerEvents: "none" }}
          />
        );
      })}
      <rect
        x={midX - 16}
        y={by + hsH + 20}
        width={32}
        height={32}
        fill={t.tmcChipFill}
        stroke={t.tmcChipStroke}
        strokeWidth={0.6}
        rx={1}
        style={{ pointerEvents: "none" }}
      />
      <circle
        cx={midX - 10}
        cy={by + hsH + 26}
        r={2}
        fill="none"
        stroke={t.tmcChipDot}
        strokeWidth={0.5}
        style={{ pointerEvents: "none" }}
      />
      <text
        x={midX}
        y={by + bh - 18}
        fontSize={8}
        fill={t.tmcLabelBright}
        textAnchor="middle"
        fontFamily="monospace"
        fontWeight="bold"
        style={{ pointerEvents: "none" }}
      >
        TMC5160
      </text>
      <text
        x={midX}
        y={by + bh - 8}
        fontSize={7}
        fill={t.tmcLabelDim}
        textAnchor="middle"
        fontFamily="monospace"
        style={{ pointerEvents: "none" }}
      >
        {comp.label}
      </text>
      {j1Pins.map((p, i) => (
        <text
          key={`j1${i}`}
          x={j1x - 10}
          y={py(comp.row + i) + 3.5}
          fontSize={7}
          fill={t.tmcPinLabel}
          textAnchor="end"
          fontFamily="monospace"
          style={{ pointerEvents: "none" }}
        >
          {p.label}
        </text>
      ))}
      {j2Pins.map((p, i) => (
        <text
          key={`j2${i}`}
          x={j2x + 10}
          y={py(comp.row + i) + 3.5}
          fontSize={7}
          fill={t.tmcPinLabel}
          textAnchor="start"
          fontFamily="monospace"
          style={{ pointerEvents: "none" }}
        >
          {p.label}
        </text>
      ))}
    </g>
  );
}
