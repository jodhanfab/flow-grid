import { memo, useCallback } from 'react';
import { Handle, Position, NodeResizer, type Node, type NodeProps } from '@xyflow/react';
import { useFlowStore } from '../../store/useFlowStore';
import type { DecisionNodeData } from '../../types';

const MIN_SIZE = 48;

function DecisionNode({ id, data, selected }: NodeProps<Node<DecisionNodeData>>) {
  const { label, color, size = 84 } = data;
  const commitResize = useFlowStore((s) => s.commitResize);
  const bg = !color || color === '#FFFFFF' ? 'var(--node-bg)' : color;
  const borderColor = selected ? 'var(--accent)' : 'var(--node-border)';

  const onResizeEnd = useCallback(
    (_: unknown, params: { x?: number; y?: number; width: number; height: number }) => {
      commitResize(id, { ...params, width: params.width, height: params.width });
    },
    [id, commitResize]
  );

  return (
    <>
      <NodeResizer
        nodeId={id}
        minWidth={MIN_SIZE}
        minHeight={MIN_SIZE}
        keepAspectRatio
        isVisible={selected}
        onResizeEnd={onResizeEnd}
        lineClassName="!border-[var(--accent)]"
        handleClassName="!w-2.5 !h-2.5 !rounded !border-2 !border-[var(--accent)] !bg-[var(--bg-panel)]"
      />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />
      <div
        className="flex items-center justify-center transition-colors duration-150"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          backgroundColor: bg,
          border: `1px solid ${borderColor}`,
          boxShadow: '0 1px 1px rgba(0,0,0,0.04)',
        }}
      >
        <span className="text-[11px] font-medium text-center px-2 max-w-[120px] truncate" style={{ color: 'var(--node-text)' }}>
          {label || 'Decision'}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
    </>
  );
}

export default memo(DecisionNode);
