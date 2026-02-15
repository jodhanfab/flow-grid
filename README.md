# Flow — Diagram Builder

A flow diagram builder with a **Swiss/International** design system: precise 8px grid, limited typography scale, neutral palette with minimal accent colors, and clean UI.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Features

- **Canvas**: React Flow with dot grid, zoom/pan, minimap, snap-to-grid (8px)
- **Node types**: Process (rounded rect), Decision (diamond), Data (parallelogram), Terminal (start/end pill), Custom (rectangle, rounded, ellipse, hexagon, parallelogram)
- **Palette**: Left sidebar with search; drag nodes onto the canvas
- **Edges**: Connect nodes; choose Bezier, Straight, or Step in the toolbar
- **Properties**: Right panel when a node is selected — edit label, color, size, shape (custom/terminal variant)
- **Toolbar**: Save (localStorage), Export PNG/SVG/JSON, Load JSON, Undo/Redo, Clear, Hierarchical/Grid layout, Edge type, Dark mode, Collapse palette
- **Shortcuts**: Delete/Backspace (delete selected), Ctrl+Z / Ctrl+Y (undo/redo)
- **Context menu**: Right-click node or canvas for Duplicate (node only) and Delete
- **Bottom bar**: Zoom in/out, Fit view, Snap to grid toggle, node/edge counts

## Tech

- **React** + **TypeScript** + **Vite**
- **@xyflow/react** for the diagram
- **Zustand** for app state and history (undo/redo)
- **Tailwind CSS v4** with Swiss design tokens in `src/index.css`
- **Lucide React** for icons

## Design tokens (Swiss)

- **Spacing**: 8px grid (8, 16, 24, 32, 48, 64)
- **Type**: Inter, 12–32px scale
- **Colors**: Neutrals (#FAFAFA → #1A1A1A), primary #0066FF, success #00B341, warning #FF8C00
- **Transitions**: 150–200ms ease

Build output: `npm run build` → `dist/`.
