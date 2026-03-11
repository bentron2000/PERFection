# PERFection — Product Spec

## Vision
An interactive perfboard layout designer for planning solder traces and component placement on prototype boards. The tool lets users define custom boards, custom parts, and signal nets, then visually route traces between them.

---

## Features

### 1. Theme: Light Mode / Dark Mode
- Toggle between light and dark colour schemes
- All SVG board colours, UI chrome, and text must adapt
- User preference persists (localStorage)
- Dark mode is the current default — light mode is additive

### 2. Custom Board Size
- User-configurable column × row count (currently hardcoded 24×18)
- Board dimensions update the SVG viewBox, grid, and axis labels dynamically
- Sensible defaults and min/max limits (e.g. 4×4 to 60×40)
- Board size is part of the project state and saved/loaded with it

### 3. Customisable Parts
Parts are the physical components placed on the board. Two archetypes exist today:

| Archetype | Current examples | Key properties |
|-----------|-----------------|----------------|
| **Header / Strip** | Ribbon, motor terminals, power terminal | Single row of N pins, rotatable 0/90/180/270° |
| **Module** | TMC5160 | Dual-row IC (DIP-like), fixed orientation, defined pin-to-pin gap |

**Customisation scope:**
- **Create / edit / delete** parts from a part library
- **Pin count & layout** — single-row (strip) or dual-row (module) with configurable row gap
- **Pin definitions** — label, net assignment, optional wire-colour annotation
- **Visual appearance** — outline colour, optional body detail (heatsink, chip, etc.)
- **Per-project instances** — each placed part is an instance of a library definition; position, rotation, and pin-order overrides are per-instance

### 4. Net Definition
A **net** is a named electrical signal that may connect multiple pins across the board.

- Each net has: `id`, `label`, `color`
- The current palette entries (GND, 24V, 3V3, SCK, MOSI, …) become the default net list
- Users can **add / edit / remove** nets
- Nets are referenced by pin definitions and by trace segments
- **Routing constraint**: a trace drawn from a pin inherits that pin's net; traces may only connect holes that share the same net (or are unassigned)
- **Colour coding**: traces, pin highlights, and the palette bar all reflect net colours
- Net list is part of project state

---

## Non-goals (for now)
- Multi-layer / back-side traces
- Auto-routing
- Export to Gerber or other fabrication formats
- Component footprint library import (KiCad, Eagle)
- Collaborative / multi-user editing
