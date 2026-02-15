import { useCallback, useEffect } from 'react';
import { Trash2, Copy } from 'lucide-react';
import { useFlowStore } from '../store/useFlowStore';

export interface ContextMenuState {
  x: number;
  y: number;
  nodeId: string | null;
  edgeId: string | null;
}

export function ContextMenu({
  state,
  onClose,
}: {
  state: ContextMenuState | null;
  onClose: () => void;
}) {
  const { nodes, addNode, pushHistory, deleteSelected } = useFlowStore();

  useEffect(() => {
    if (!state) return;
    const handleClick = () => onClose();
    const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state, onClose]);

  const handleDelete = useCallback(() => {
    deleteSelected();
    onClose();
  }, [deleteSelected, onClose]);

  const handleDuplicate = useCallback(() => {
    if (!state?.nodeId) return;
    const node = nodes.find((n) => n.id === state.nodeId);
    if (!node) return;
    const newId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newNode = {
      ...node,
      id: newId,
      position: { x: node.position.x + 24, y: node.position.y + 24 },
      selected: false,
    };
    addNode(newNode);
    pushHistory();
    onClose();
  }, [state?.nodeId, nodes, addNode, pushHistory, onClose]);

  if (!state) return null;

  const iconProps = { size: 16, strokeWidth: 1.75 };

  return (
    <div
      className="fixed z-50 py-1 rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--bg-panel)] shadow-[var(--shadow-dropdown)] min-w-[180px]"
      style={{ left: state.x, top: state.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {state.nodeId && (
        <button
          type="button"
          onClick={handleDuplicate}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] transition-colors duration-[var(--transition-fast)] first:rounded-t-[7px]"
        >
          <Copy {...iconProps} className="text-[var(--text-secondary)]" /> Duplicate
        </button>
      )}
      <button
        type="button"
        onClick={handleDelete}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] transition-colors duration-[var(--transition-fast)] last:rounded-b-[7px]"
      >
        <Trash2 {...iconProps} className="text-[var(--text-secondary)]" /> Delete
      </button>
    </div>
  );
}
