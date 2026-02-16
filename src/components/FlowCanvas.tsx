import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  applyNodeChanges,
  applyEdgeChanges,
  ConnectionLineType,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore, getDefaultNodeDimensions } from '../store/useFlowStore';
import { nodeTypes } from './nodes';
import { BottomPanel } from './BottomPanel';
import { CustomConnectionLine } from './ConnectionLine';
import type { FlowNodeData, NodeTypeId } from '../types';

const GRID_SIZE = 8;

function generateId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function FlowCanvasInner() {
  const reactFlow = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    nodes,
    edges,
    viewport,
    setNodes,
    setEdges,
    setViewport,
    setExportRef,
    addNode,
    deleteSelected,
    pushHistory,
    snapToGrid,
    edgeType,
    setPropertiesPanelOpen,
    setContextMenu,
  } = useFlowStore();

  useEffect(() => {
    if (containerRef.current) {
      const viewportEl = containerRef.current.querySelector('.react-flow__viewport');
      setExportRef(viewportEl ? (viewportEl as HTMLElement) : containerRef.current);
    }
    return () => setExportRef(null);
  }, [setExportRef]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow') as NodeTypeId;
      if (!type) return;
      let defaultData: Partial<FlowNodeData> = {};
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (raw) defaultData = JSON.parse(raw);
      } catch { }
      const position = reactFlow.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      let x = position.x;
      let y = position.y;
      if (snapToGrid) {
        x = Math.round(x / GRID_SIZE) * GRID_SIZE;
        y = Math.round(y / GRID_SIZE) * GRID_SIZE;
      }
      const id = generateId();
      const data = { ...defaultData } as FlowNodeData;
      const { width, height } = getDefaultNodeDimensions(type, data);
      const newNode: Node<FlowNodeData> = {
        id,
        type,
        position: { x, y },
        data: { ...data, width, height },
        width,
        height,
      };
      addNode(newNode);
      pushHistory();
    },
    [reactFlow, snapToGrid, addNode, pushHistory]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<FlowNodeData>>[]) => {
      setNodes((nds) => {
        const next = applyNodeChanges(changes, nds);
        if (snapToGrid) {
          return next.map((n) => ({
            ...n,
            position: {
              x: Math.round(n.position.x / GRID_SIZE) * GRID_SIZE,
              y: Math.round(n.position.y / GRID_SIZE) * GRID_SIZE,
            },
          }));
        }
        return next;
      });
    },
    [setNodes, snapToGrid]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: { nodes: Node[]; edges: Edge[] }) => {
      setPropertiesPanelOpen(selectedNodes.length > 0 || selectedEdges.length > 0);
    },
    [setPropertiesPanelOpen]
  );

  const onViewportChange = useCallback(
    (vp: { x: number; y: number; zoom: number }) => setViewport(vp),
    [setViewport]
  );

  const onNodeContextMenu = useCallback(
    (e: React.MouseEvent<Element, MouseEvent> | MouseEvent, node: Node<FlowNodeData>) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id, edgeId: null });
    },
    [setContextMenu]
  );

  const onPaneContextMenu = useCallback(
    (e: React.MouseEvent<Element, MouseEvent> | MouseEvent) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId: null, edgeId: null });
    },
    [setContextMenu]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) useFlowStore.getState().redo();
        else useFlowStore.getState().undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        useFlowStore.getState().redo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        reactFlow?.fitView({ padding: 0.2 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, reactFlow]);

  const defaultEdgeOptions = {
    type: (edgeType === 'straight' ? 'straight' : edgeType === 'step' ? 'step' : 'default') as 'straight' | 'step' | 'default',
  };

  const connectionLineType =
    edgeType === 'straight'
      ? ConnectionLineType.Straight
      : edgeType === 'step'
        ? ConnectionLineType.Step
        : ConnectionLineType.Bezier;

  const isValidConnection = useCallback((conn: Edge | Connection) => {
    const source = conn.source;
    const target = conn.target;
    if (source === target) return false;
    const sh = 'sourceHandle' in conn ? conn.sourceHandle ?? null : null;
    const th = 'targetHandle' in conn ? conn.targetHandle ?? null : null;
    const exists = useFlowStore.getState().edges.some(
      (e) => e.source === source && e.target === target && (e.sourceHandle ?? null) === sh && (e.targetHandle ?? null) === th
    );
    return !exists;
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <ReactFlow
        connectionRadius={40}
        connectionLineType={connectionLineType}
        connectionLineComponent={CustomConnectionLine}
        isValidConnection={isValidConnection}
        nodes={nodes}
        edges={edges}
        viewport={viewport}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(params) => {
          const id = `edge-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          setEdges((eds) => [...eds, { ...params, id, ...defaultEdgeOptions }]);
          pushHistory();
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onSelectionChange={onSelectionChange}
        onViewportChange={onViewportChange}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        snapToGrid={snapToGrid}
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        className="bg-[var(--bg-canvas)]"
      >
        <Background variant={BackgroundVariant.Dots} gap={GRID_SIZE} size={1} />
        <Controls showInteractive={false} />
        {nodes.length === 0 && (
          <Panel position="top-center" className="mt-28">
            <div
              className="px-6 py-5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-panel)] text-center max-w-sm"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <p className="text-[14px] font-medium text-[var(--text-primary)] mb-1 tracking-tight">
                Drag nodes from the palette
              </p>
              <p className="text-[12px] text-[var(--text-secondary)] mb-2">
                Connect by dragging from a node handle to another. Select a node to resize it by dragging the corner.
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Ctrl+Z undo · Del delete · Ctrl+0 fit view
              </p>
            </div>
          </Panel>
        )}
        <MiniMap
          nodeColor="var(--color-neutral-400)"
          maskColor="rgba(0,0,0,0.06)"
          className="!rounded-lg !border !border-[var(--border-color)]"
        />
      </ReactFlow>
    </div>
  );
}

export function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0">
          <FlowCanvasInner />
        </div>
        <BottomPanel />
      </div>
    </ReactFlowProvider>
  );
}
