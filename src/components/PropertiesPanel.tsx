import { useMemo, useState, useEffect } from 'react';
import { Type, Palette, Square } from 'lucide-react';

const iconProps = { size: 16, strokeWidth: 1.75 };
import { useFlowStore } from '../store/useFlowStore';
import type { FlowNodeData, CustomShapeId, NodeTypeId } from '../types';

const CUSTOM_SHAPE_NODE_TYPES: NodeTypeId[] = [
  'custom',
  'api',
  'service',
  'queue',
  'cache',
  'message',
  'document',
  'interface',
  'container',
  'server',
  'function',
  'cloud',
  'actor',
  'inputoutput',
];

const SHAPE_OPTIONS: { id: CustomShapeId; label: string }[] = [
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'ellipse', label: 'Ellipse' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'parallelogram', label: 'Parallelogram' },
];

const ACCENT_COLORS: { value: string; label?: string }[] = [
  { value: '', label: 'Default' },
  { value: '#e0e6ed', label: 'Slate' },
  { value: '#d4dce4', label: 'Gray' },
  { value: '#c5e1c8', label: 'Mint' },
  { value: '#b8d4e8', label: 'Sky' },
  { value: '#e8d4c5', label: 'Sand' },
  { value: '#ddc4e0', label: 'Lavender' },
  { value: '#e8c5c5', label: 'Blush' },
];

export function PropertiesPanel() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const propertiesPanelOpen = useFlowStore((s) => s.propertiesPanelOpen);

  const selectedNode = useMemo(() => nodes.find((n) => n.selected), [nodes]);
  const selectedEdge = useMemo(() => edges.find((e) => e.selected), [edges]);

  const [localLabel, setLocalLabel] = useState('');
  const [localWidth, setLocalWidth] = useState('');
  const [localHeight, setLocalHeight] = useState('');

  useEffect(() => {
    if (selectedNode?.data) {
      const d = selectedNode.data;
      setLocalLabel((d as { label?: string }).label ?? '');
      setLocalWidth(String((d as { width?: number }).width ?? ''));
      setLocalHeight(String((d as { height?: number }).height ?? (d as { size?: number }).size ?? ''));
    }
  }, [selectedNode?.id, selectedNode?.data]);

  if (!propertiesPanelOpen || (!selectedNode && !selectedEdge)) return null;

  const isNode = !!selectedNode;
  const data = selectedNode?.data;

  const handleApplyLabel = () => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, { label: localLabel });
    }
  };

  const handleApplyColor = (color: string) => {
    if (selectedNode) updateNodeData(selectedNode.id, { color });
  };

  const handleApplySize = () => {
    if (!selectedNode) return;
    const w = localWidth ? parseInt(localWidth, 10) : undefined;
    const h = localHeight ? parseInt(localHeight, 10) : undefined;
    if (selectedNode.type === 'decision') {
      const s = w ?? h ?? (data as { size?: number })?.size;
      if (s != null) updateNodeData(selectedNode.id, { size: s } as Partial<FlowNodeData>);
    } else if (w != null || h != null) {
      updateNodeData(selectedNode.id, {
        width: w ?? (data as { width?: number })?.width,
        height: h ?? (data as { height?: number })?.height,
      });
    }
  };

  const handleApplyShape = (shape: CustomShapeId) => {
    if (selectedNode && CUSTOM_SHAPE_NODE_TYPES.includes(selectedNode.type as NodeTypeId)) {
      updateNodeData(selectedNode.id, { shape } as Partial<FlowNodeData>);
    }
  };

  return (
    <aside
      className="w-[280px] border-l border-[var(--border-color)] bg-[var(--bg-panel)] flex flex-col shrink-0 overflow-y-auto"
      style={{ width: '280px' }}
    >
      <div className="p-4 border-b border-[var(--border-color)]">
        <h2 className="text-[13px] font-semibold text-[var(--text-primary)] tracking-tight">
          {isNode ? 'Node' : 'Edge'} properties
        </h2>
      </div>
      <div className="p-4 space-y-5">
        {selectedNode && data && (
          <>
            <div>
              <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                <Type {...iconProps} /> Label
              </label>
              <input
                type="text"
                value={localLabel || data.label || ''}
                onChange={(e) => setLocalLabel(e.target.value)}
                onBlur={handleApplyLabel}
                className="w-full px-3 py-2 text-[13px] border border-[var(--border-color)] rounded-[var(--radius-md)] bg-[var(--bg-app)] dark:bg-[var(--color-neutral-800)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-[var(--transition-fast)]"
                placeholder="Label"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                <Palette {...iconProps} /> Color
              </label>
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map((item) => {
                  const value = typeof item === 'string' ? item : item.value;
                  const isDefault = value === '';
                  const current = (data as { color?: string })?.color;
                  const isSelected = isDefault ? !current || current === '' : current === value;
                  return (
                    <button
                      key={value || 'default'}
                      type="button"
                      onClick={() => handleApplyColor(value)}
                      className="w-8 h-8 rounded-[var(--radius-sm)] border-2 transition-[var(--transition-fast)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-panel)]"
                      style={{
                        backgroundColor: isDefault ? 'var(--node-bg)' : value,
                        borderColor: isSelected ? 'var(--accent)' : 'var(--border-color)',
                      }}
                      title={typeof item === 'object' && item.label ? item.label : value}
                    />
                  );
                })}
              </div>
            </div>
            {selectedNode.type !== 'decision' && (
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                  <Square {...iconProps} /> Size
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={40}
                    max={400}
                    value={(localWidth || (data as { width?: number })?.width) ?? ''}
                    onChange={(e) => setLocalWidth(e.target.value)}
                    onBlur={handleApplySize}
                    className="w-20 px-2.5 py-2 text-[13px] border border-[var(--border-color)] rounded-[var(--radius-md)] bg-[var(--bg-app)] dark:bg-[var(--color-neutral-800)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    placeholder="W"
                  />
                  <input
                    type="number"
                    min={24}
                    max={200}
                    value={(localHeight || (data as { height?: number })?.height) ?? ''}
                    onChange={(e) => setLocalHeight(e.target.value)}
                    onBlur={handleApplySize}
                    className="w-20 px-2.5 py-2 text-[13px] border border-[var(--border-color)] rounded-[var(--radius-md)] bg-[var(--bg-app)] dark:bg-[var(--color-neutral-800)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    placeholder="H"
                  />
                </div>
              </div>
            )}
            {selectedNode.type === 'decision' && (
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                  <Square {...iconProps} /> Size
                </label>
                <input
                  type="number"
                  min={48}
                  max={120}
                  value={(localWidth || (data as { size?: number })?.size) ?? ''}
                  onChange={(e) => setLocalWidth(e.target.value)}
                  onBlur={handleApplySize}
                  className="w-full px-2.5 py-2 text-[13px] border border-[var(--border-color)] rounded-[var(--radius-md)] bg-[var(--bg-app)] dark:bg-[var(--color-neutral-800)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="Size"
                />
              </div>
            )}
            {CUSTOM_SHAPE_NODE_TYPES.includes(selectedNode.type as NodeTypeId) && (
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                  Shape
                </label>
                <div className="flex flex-wrap gap-2">
                  {SHAPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleApplyShape(opt.id)}
                      className="px-3 py-1.5 text-[13px] font-medium rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--bg-app)] dark:bg-[var(--color-neutral-800)] text-[var(--text-primary)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-700)] transition-colors duration-[var(--transition-fast)]"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {selectedNode.type === 'terminal' && (
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                  Variant
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateNodeData(selectedNode.id, { variant: 'start' } as Partial<FlowNodeData>)}
                    className={`px-3 py-1.5 text-[13px] font-medium rounded-[var(--radius-md)] border transition-colors duration-[var(--transition-fast)] ${
                      (data as { variant?: string })?.variant === 'start'
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-[var(--border-color)] bg-[var(--bg-app)] dark:bg-[var(--color-neutral-800)] text-[var(--text-primary)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-700)]'
                    }`}
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    onClick={() => updateNodeData(selectedNode.id, { variant: 'end' } as Partial<FlowNodeData>)}
                    className={`px-3 py-1.5 text-[13px] font-medium rounded-[var(--radius-md)] border transition-colors duration-[var(--transition-fast)] ${
                      (data as { variant?: string })?.variant === 'end'
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-[var(--border-color)] bg-[var(--bg-app)] dark:bg-[var(--color-neutral-800)] text-[var(--text-primary)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-700)]'
                    }`}
                  >
                    End
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {selectedEdge && !selectedNode && (
          <p className="text-[13px] text-[var(--text-secondary)]">Edge selected. Reconnect or delete.</p>
        )}
      </div>
    </aside>
  );
}
