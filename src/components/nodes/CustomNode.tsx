import { memo, useCallback } from 'react';
import { Handle, Position, NodeResizer, type Node, type NodeProps } from '@xyflow/react';
import { useFlowStore } from '../../store/useFlowStore';
import type { CustomNodeData } from '../../types';

const MIN_W = 72;
const MIN_H = 28;

function CustomNode({ id, data, selected }: NodeProps<Node<CustomNodeData>>) {
  const { label, color, width = 160, height = 48, shape = 'rounded' } = data;
  const commitResize = useFlowStore((s) => s.commitResize);
  const bg = !color || color === '#FFFFFF' ? 'var(--node-bg)' : color;
  const borderColor = selected ? 'var(--accent)' : 'var(--node-border)';
  const isHexagon = shape === 'hexagon';
  const isParallel = shape === 'parallelogram';

  const onResizeEnd = useCallback(
    (_: unknown, params: { x?: number; y?: number; width: number; height: number }) => {
      commitResize(id, params);
    },
    [id, commitResize]
  );

  if (isHexagon) {
    const w = width;
    const h = height;
    const cut = Math.min(w * 0.2, h * 0.25);
    const path = `M ${cut} 0 L ${w - cut} 0 L ${w} ${h / 2} L ${w - cut} ${h} L ${cut} ${h} L 0 ${h / 2} Z`;
    return (
      <>
        <NodeResizer
          nodeId={id}
          minWidth={MIN_W}
          minHeight={MIN_H}
          isVisible={selected}
          onResizeEnd={onResizeEnd}
          lineClassName="!border-[var(--accent)]"
          handleClassName="!w-2.5 !h-2.5 !rounded !border-2 !border-[var(--accent)] !bg-[var(--bg-panel)]"
        />
        <Handle type="target" position={Position.Top} />
        <Handle type="target" position={Position.Left} />
        <svg width={w} height={h} className="transition-colors duration-150">
          <path d={path} fill={bg} stroke={borderColor} strokeWidth={1} />
          <foreignObject x={0} y={0} width={w} height={h} className="flex items-center justify-center">
            <span className="text-[11px] font-medium text-center w-full px-2 truncate block" style={{ color: 'var(--node-text)' }}>
              {label || 'Custom'}
            </span>
          </foreignObject>
        </svg>
        <Handle type="source" position={Position.Bottom} />
        <Handle type="source" position={Position.Right} />
      </>
    );
  }

  return (
    <>
      <NodeResizer
        nodeId={id}
        minWidth={MIN_W}
        minHeight={MIN_H}
        isVisible={selected}
        onResizeEnd={onResizeEnd}
        lineClassName="!border-[var(--accent)]"
        handleClassName="!w-2.5 !h-2.5 !rounded !border-2 !border-[var(--accent)] !bg-[var(--bg-panel)]"
      />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />
      <div
        className={`flex items-center justify-center min-w-[72px] min-h-[28px] transition-colors duration-150 ${
          shape === 'rounded' ? 'rounded-md' : shape === 'ellipse' ? 'rounded-full' : shape === 'rectangle' ? 'rounded-none' : ''
        }`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: bg,
          border: `1px solid ${borderColor}`,
          ...(isParallel ? { transform: 'skewX(-6deg)' } : {}),
          boxShadow: '0 1px 1px rgba(0,0,0,0.04)',
        }}
      >
        <span
          className="text-[11px] font-medium text-center px-2 truncate max-w-full"
          style={{ color: 'var(--node-text)', ...(isParallel ? { transform: 'skewX(6deg)' } : {}) }}
        >
          {label || 'Custom'}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
    </>
  );
}

export default memo(CustomNode);
