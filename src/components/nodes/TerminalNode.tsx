import { memo, useCallback } from 'react';
import { Handle, Position, NodeResizer, type Node, type NodeProps } from '@xyflow/react';
import { useFlowStore } from '../../store/useFlowStore';
import type { TerminalNodeData } from '../../types';

const MIN_W = 64;
const MIN_H = 28;

function TerminalNode({ id, data, selected }: NodeProps<Node<TerminalNodeData>>) {
  const { label, color, width = 132, height = 44, variant = 'start' } = data;
  const commitResize = useFlowStore((s) => s.commitResize);
  const bg = !color || color === '#FFFFFF' ? 'var(--node-bg)' : color;
  const borderColor = selected ? 'var(--accent)' : 'var(--node-border)';

  const onResizeEnd = useCallback(
    (_: unknown, params: { x?: number; y?: number; width: number; height: number }) => {
      commitResize(id, params);
    },
    [id, commitResize]
  );

  return (
    <>
      <NodeResizer
        nodeId={id}
        minWidth={MIN_W}
        minHeight={MIN_H}
        isVisible={selected}
        onResizeEnd={onResizeEnd}
        lineClassName="!border-[var(--accent)]"
        handleClassName="!w-2.5 !h-2.5 !rounded-full !border-2 !border-[var(--accent)] !bg-[var(--bg-panel)]"
      />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />
      <div
        className="flex items-center justify-center rounded-full min-w-[64px] min-h-[28px] transition-colors duration-150"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: bg,
          border: `1px solid ${borderColor}`,
          borderRadius: '9999px',
          boxShadow: '0 1px 1px rgba(0,0,0,0.04)',
        }}
      >
        <span className="text-[11px] font-medium text-center px-2 truncate max-w-full" style={{ color: 'var(--node-text)' }}>
          {label || (variant === 'start' ? 'Start' : 'End')}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
    </>
  );
}

export default memo(TerminalNode);
