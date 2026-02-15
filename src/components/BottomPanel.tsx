import { ZoomIn, ZoomOut, Maximize2, Grid3X3 } from 'lucide-react';
import { useFlowStore } from '../store/useFlowStore';
import { useReactFlow } from '@xyflow/react';

export function BottomPanel() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const snapToGrid = useFlowStore((s) => s.snapToGrid);
  const setSnapToGrid = useFlowStore((s) => s.setSnapToGrid);

  const reactFlow = useReactFlow();
  const zoomIn = () => reactFlow?.zoomIn();
  const zoomOut = () => reactFlow?.zoomOut();
  const fitView = () => reactFlow?.fitView({ padding: 0.2 });

  const iconProps = { size: 18, strokeWidth: 1.75 };

  return (
    <footer
      className="h-12 border-t border-[var(--border-color)] bg-[var(--bg-panel)] flex items-center justify-between px-4 shrink-0"
      style={{ height: '48px' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-[var(--radius-md)] border border-[var(--border-color)] overflow-hidden">
          <button
            type="button"
            onClick={zoomOut}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] transition-colors duration-[var(--transition-fast)]"
            title="Zoom out"
          >
            <ZoomOut {...iconProps} />
          </button>
          <button
            type="button"
            onClick={zoomIn}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] transition-colors duration-[var(--transition-fast)] border-l border-[var(--border-color)]"
            title="Zoom in"
          >
            <ZoomIn {...iconProps} />
          </button>
          <button
            type="button"
            onClick={fitView}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] transition-colors duration-[var(--transition-fast)] border-l border-[var(--border-color)]"
            title="Fit view (Ctrl+0)"
          >
            <Maximize2 {...iconProps} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] border text-[13px] font-medium transition-colors duration-[var(--transition-fast)] ${
            snapToGrid
              ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
              : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)]'
          }`}
          title="Snap to grid"
        >
          <Grid3X3 {...iconProps} />
          Snap to grid
        </button>
      </div>
      <div className="flex items-center gap-6 text-[13px] text-[var(--text-secondary)] tabular-nums">
        <span>{nodes.length} nodes</span>
        <span>{edges.length} connections</span>
      </div>
    </footer>
  );
}
