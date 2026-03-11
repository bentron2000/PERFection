# PERFection — Architecture Plan

## Current State
Single-file React component (`src/Perfboard.tsx`) with all state, rendering, and interaction logic inline. Types are defined but tightly coupled. No state persistence, no theming, hardcoded board size and parts.

## Target Architecture

```
src/
├── main.tsx                  # React root
├── App.tsx                   # Top-level layout, theme provider, modals
├── types.ts                  # Shared type definitions
├── state/
│   ├── project.ts            # Project state shape & defaults
│   ├── useProjectStore.ts    # Zustand or useReducer-based store
│   └── persistence.ts        # localStorage save/load
├── theme/
│   ├── ThemeContext.tsx       # Light/dark provider + toggle
│   └── tokens.ts             # Colour tokens for both modes
├── board/
│   ├── BoardSvg.tsx          # SVG container, viewBox, grid, axis labels
│   ├── HoleGrid.tsx          # Visual holes + hit targets
│   ├── TraceLayer.tsx        # Placed traces + draw preview
│   └── ComponentLayer.tsx    # Rendered parts (modules + strips)
├── parts/
│   ├── PartLibrary.ts        # Default part definitions + CRUD
│   ├── partGeometry.ts       # getHoles, pinOffset, outlines (extracted helpers)
│   └── PartEditor.tsx        # UI for creating/editing part definitions
├── nets/
│   ├── NetLibrary.ts         # Net definitions + CRUD
│   └── NetEditor.tsx         # UI for creating/editing nets
├── panels/
│   ├── Toolbar.tsx           # Top toolbar (undo, erase, clear, reset)
│   ├── PaletteBar.tsx        # Net/signal palette selector
│   ├── SidePanel.tsx         # Component inspector (rotate, reorder pins)
│   └── BoardSettings.tsx     # Board size config
└── hooks/
    ├── useTraceDraw.ts       # Drag-to-draw trace interaction
    ├── useCompDrag.ts        # Component drag interaction
    └── useErase.ts           # Erase interaction
```

## Phasing Strategy

### Phase 1 — Foundation (refactor, no new features)
Extract types, split the monolith into modules, introduce state store. Everything should still work identically to today.

### Phase 2 — Theme system
Introduce colour tokens and ThemeContext. Wire all SVG and UI colours through tokens. Add toggle.

### Phase 3 — Custom board size
Make COLS/ROWS part of project state. Wire through to SVG viewBox, grid rendering, and clamping logic. Add BoardSettings panel.

### Phase 4 — Net system
Promote palette entries to first-class Net objects with CRUD. Nets are stored in project state. Update trace drawing to enforce net constraints. Add NetEditor UI.

### Phase 5 — Custom parts
Extract part definitions into a library. Build PartEditor for creating/editing definitions. Parts reference nets for pin assignments. Update rendering to handle arbitrary part shapes.

## Key Decisions
- **State management**: Start with React context + useReducer. Migrate to Zustand if complexity warrants it — the API is nearly identical.
- **No component library**: Keep raw HTML/SVG + inline styles for now (matching existing approach). Reconsider if UI complexity grows significantly.
- **Persistence**: localStorage for v1. File export/import as a future enhancement.
- **Testing**: Type-check is the first gate. Add Vitest for geometry helpers and state reducers as they're extracted.
