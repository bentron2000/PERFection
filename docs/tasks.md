# PERFection — Task Breakdown

Status key: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Phase 1 — Foundation (refactor)

### 1.1 Extract shared types
- [x] Create `src/types.ts` with `Pin`, `Component`, `Segment`, `Net`, `OccEntry`, `DrawState`, `DragState`
- [x] All modules import from `types.ts`

### 1.2 Extract geometry helpers
- [x] Create `src/parts/partGeometry.ts` — `pinOffset`, `labelOffset`, `compLabelPos`, `getHoles`, `getStripOutline`, `buildOccMap`
- [ ] Unit-test key geometry functions

### 1.3 Extract interaction hooks
- [x] `src/hooks/useTraceDraw.ts` — trace drag-draw logic
- [x] `src/hooks/useCompDrag.ts` — component drag logic
- [x] `src/hooks/useSvgCoords.ts` — SVG coordinate conversion
- [x] Erase handled via store dispatch (`ERASE_AT` action) — no separate hook needed

### 1.4 Introduce project state store
- [x] Create `src/state/project.ts` — state shape, initial state factory
- [x] Create `src/state/useProjectStore.ts` — useReducer store with typed actions
- [x] Migrate `comps`, `segments`, `nets`, `activeSig`, `eraseMode`, `selected` into store

### 1.5 Split rendering into sub-components
- [x] `src/board/HoleGrid.tsx` — visual holes
- [x] `src/board/HitTargets.tsx` — invisible hit targets (separated from holes)
- [x] `src/board/TraceLayer.tsx` — placed segments + draw preview + start ring
- [x] `src/board/ComponentLayer.tsx` — TMC + strip renderers
- [x] `src/panels/Toolbar.tsx` — undo, erase, clear, reset buttons
- [x] `src/panels/PaletteBar.tsx` — net colour buttons
- [x] `src/panels/SidePanel.tsx` — component inspector
- [x] `src/App.tsx` — compose all panels + board
- [x] `src/constants.ts` — grid constants + coordinate helpers
- [x] `src/nets/nets.ts` — net definitions + colour/label lookups

### 1.6 Verify
- [x] `tsc -b` passes with zero errors
- [ ] Manual smoke test — all interactions work as before

---

## Phase 2 — Theme system

### 2.1 Define colour tokens
- [x] Create `src/theme/tokens.ts` with `lightTokens` and `darkTokens` (~45 tokens)
- [x] Tokens cover: page, board, holes, components, TMC module, buttons, panels, palette, text hierarchy

### 2.2 Theme context + toggle
- [x] Create `src/theme/ThemeContext.tsx` — provider, `useTheme()` hook, toggle
- [x] Persist preference in localStorage (`perfection-theme`)

### 2.3 Wire tokens through all components
- [x] All components accept `tokens` prop — App, ComponentLayer, HoleGrid, PaletteBar, SidePanel
- [x] Theme toggle button in toolbar (Light/Dark)
- [ ] Visual polish pass — test both modes in browser, tune light mode colours

---

## Phase 3 — Custom board size

### 3.1 Make board size dynamic
- [x] Add `cols`, `rows` to project state (default 24×18)
- [x] Replace all `COLS`/`ROWS` constant imports with state values
- [x] Update SVG viewBox, grid, axis labels, hit targets, hole grid, trace clamping
- [x] Thread `cols`/`rows` through `useTraceDraw`, `useCompDrag`, `HoleGrid`, `HitTargets`
- [x] `SET_BOARD_SIZE` action with validation (min 4×4, max 100×100)

### 3.2 Board settings UI
- [x] +/− buttons for cols (C) and rows (R) in toolbar, with live size display
- [x] Buttons disabled at min/max limits

### 3.3 Edge cases
- [ ] Handle components/traces that fall outside new bounds on resize
- [ ] Clamp or warn when shrinking

---

## Phase 4 — Net system

### 4.1 Promote nets to first-class objects
- [x] `Net` type defined in `types.ts`: `{ id, label, color }`
- [x] Default nets in project state (migrated from old PALETTE)
- [x] `sigColor` / `sigLabel` read from project nets array

### 4.2 Net CRUD UI
- [x] `src/nets/NetEditor.tsx` — inline edit label/colour, delete, add new
- [x] Integrated into Settings page with description
- [x] `ADD_NET`, `UPDATE_NET`, `DELETE_NET` actions in store

### 4.3 Enforce net constraints
- [x] Drawing from a pin inherits the pin's net (existing behaviour preserved)
- [x] Drawing from an unassigned hole uses the selected palette net (existing)
- [ ] Prevent connecting holes with conflicting net assignments (visual feedback)

### 4.4 Update palette bar
- [x] Palette bar reads from project net list (dynamic)
- [x] Highlight active net

---

## Phase 5 — Custom parts

### 5.1 Part definition model
- [x] Define `PartDefinition` type: archetype (strip/module), pin rows with offsets, labels, appearance
- [x] Create `src/parts/PartLibrary.ts` — built-in definitions (TMC5160, ribbon-9pin, motor-4pin, power-2pin, headers)
- [x] Component instances reference definitions by `defId`; `pinOverrides` for per-instance pin reorder

### 5.2 Part editor UI
- [x] Create `src/parts/PartEditor.tsx` — browse/create/edit definitions in Settings page
- [x] Pin editor: add/remove pins, edit labels and net assignments for custom parts
- [x] Built-in parts shown read-only; custom parts fully editable
- [ ] Module editor: configure row count, row gap (future — currently modules are built-in only)
- [ ] Preview rendering in editor (future)

### 5.3 Part placement
- [x] "Place on Board" button in part editor — creates instance at (0,0)
- [x] Delete part instance from board (SidePanel delete button)
- [x] `ADD_COMP`, `DELETE_COMP` actions in store

### 5.4 Rendering generalisation
- [x] `ComponentLayer` renders from `PartDefinition` — strips, modules, TMC5160 special case
- [x] `GenericModule` renderer for user-defined modules
- [x] Support custom body/border colours via `PartDefinition.bodyColor`/`borderColor`
- [x] `partGeometry` fully generalised — `getHoles`, `buildOccMap`, `compLabelPos` all take `PartDefinition`
- [x] `SidePanel` generalised — shows pin rows dynamically, delete button, rotate for rotatable parts
- [x] `useCompDrag` updated to work with `PartDefinition` for bounds checking

---

## Future (out of scope for now)
- [ ] File export/import (JSON project files)
- [ ] Undo/redo stack (proper command history)
- [ ] DRC (design rule check) — detect shorted nets, unconnected pins
- [ ] Print-friendly view / PDF export
