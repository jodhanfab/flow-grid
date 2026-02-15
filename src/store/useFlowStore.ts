import { create } from 'zustand';
import type { Node, Edge, Viewport } from '@xyflow/react';
import type { FlowNodeData, EdgeTypeId, ToastItem, DiagramState } from '../types';

const MAX_HISTORY = 50;
const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 52;

interface FlowState {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  viewport: Viewport;
  edgeType: EdgeTypeId;
  snapToGrid: boolean;
  darkMode: boolean;
  sidebarOpen: boolean;
  propertiesPanelOpen: boolean;
  history: DiagramState[];
  historyIndex: number;
  toasts: ToastItem[];
  exportRef: HTMLElement | null;
  setExportRef: (el: HTMLElement | null) => void;
  contextMenu: { x: number; y: number; nodeId: string | null; edgeId: string | null } | null;
  setContextMenu: (m: { x: number; y: number; nodeId: string | null; edgeId: string | null } | null) => void;
  setNodes: (nodes: Node<FlowNodeData>[] | ((prev: Node<FlowNodeData>[]) => Node<FlowNodeData>[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  setViewport: (vp: Viewport) => void;
  setEdgeType: (t: EdgeTypeId) => void;
  setSnapToGrid: (v: boolean) => void;
  setDarkMode: (v: boolean) => void;
  setSidebarOpen: (v: boolean) => void;
  setPropertiesPanelOpen: (v: boolean) => void;
  addNode: (node: Node<FlowNodeData>) => void;
  updateNodeData: (id: string, data: Partial<FlowNodeData>) => void;  
  commitResize: (nodeId: string, params: { x?: number; y?: number; width: number; height: number }) => void;
  deleteSelected: () => void;
  clearCanvas: () => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  addToast: (item: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  loadDiagram: (state: DiagramState) => void;
  getDiagramState: () => DiagramState;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  edgeType: 'default',
  snapToGrid: true,
  darkMode: false,
  sidebarOpen: true,
  propertiesPanelOpen: false,
  history: [],
  historyIndex: -1,
  toasts: [],
  exportRef: null,
  setExportRef: (exportRef) => set({ exportRef }),
  contextMenu: null,
  setContextMenu: (contextMenu) => set({ contextMenu }),

  setNodes: (nodes) =>
    set((state) => ({
      nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes,
    })),

  setEdges: (edges) =>
    set((state) => ({
      edges: typeof edges === 'function' ? edges(state.edges) : edges,
    })),

  setViewport: (viewport) => set({ viewport }),

  setEdgeType: (edgeType) => set({ edgeType }),

  setSnapToGrid: (snapToGrid) => set({ snapToGrid }),

  setDarkMode: (darkMode) => {
    set({ darkMode });
    document.documentElement.classList.toggle('dark', darkMode);
  },

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  setPropertiesPanelOpen: (propertiesPanelOpen) => set({ propertiesPanelOpen }),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  updateNodeData: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),

  commitResize: (nodeId, params) => {
    const { x, y, width, height } = params;
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const isDecision = n.type === 'decision';
        return {
          ...n,
          ...(typeof x === 'number' && typeof y === 'number' ? { position: { x, y } } : {}),
          width,
          height,
          data: {
            ...n.data,
            ...(isDecision ? { size: width } : { width, height }),
          },
        };
      }),
    }));
    get().pushHistory();
  },

  deleteSelected: () => {
    const { nodes, edges, pushHistory } = get();
    const selectedIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
    edges.forEach((e) => {
      if (e.selected || selectedIds.has(e.source) || selectedIds.has(e.target)) {
        selectedIds.add(e.id);
      }
    });
    set((state) => ({
      nodes: state.nodes.filter((n) => !n.selected),
      edges: state.edges.filter(
        (e) => !e.selected && !selectedIds.has(e.source) && !selectedIds.has(e.target)
      ),
    }));
    pushHistory();
  },

  clearCanvas: () => {
    set({ nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } });
    get().pushHistory();
  },

  pushHistory: () =>
    set((state) => {
      const snapshot: DiagramState = {
        nodes: state.nodes.map((n) => ({
          ...n,
          data: { ...n.data },
        })),
        edges: [...state.edges],
        viewport: { ...state.viewport },
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(snapshot);
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      viewport: prev.viewport,
      historyIndex: historyIndex - 1,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    set({
      nodes: next.nodes,
      edges: next.edges,
      viewport: next.viewport,
      historyIndex: historyIndex + 1,
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1 && history.length > 0;
  },

  addToast: (item) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...item, id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}` },
      ],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  loadDiagram: (state) =>
    set({
      nodes: state.nodes.map((n) => {
        const dims = getDefaultNodeDimensions(n.type ?? 'process', n.data);
        return { ...n, width: n.width ?? dims.width, height: n.height ?? dims.height };
      }),
      edges: state.edges,
      viewport: state.viewport,
    }),

  getDiagramState: (): DiagramState => {
    const { nodes, edges, viewport } = get();
    return {
      nodes: nodes.map((n) => ({ ...n, data: { ...n.data } })),
      edges: [...edges],
      viewport: { ...viewport },
    };
  },
}));

const DEFAULT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  process: { width: 180, height: 52 },
  decision: { width: 84, height: 84 },
  data: { width: 160, height: 48 },
  terminal: { width: 132, height: 44 },
  custom: { width: 160, height: 48 },
  api: { width: 120, height: 40 },
  service: { width: 140, height: 44 },
  queue: { width: 140, height: 44 },
  cache: { width: 120, height: 40 },
  message: { width: 120, height: 40 },
  document: { width: 140, height: 44 },
  interface: { width: 130, height: 40 },
  container: { width: 140, height: 44 },
  server: { width: 130, height: 44 },
  function: { width: 120, height: 40 },
  cloud: { width: 120, height: 44 },
  actor: { width: 100, height: 44 },
  inputoutput: { width: 140, height: 44 },
};

export const getDefaultNodeDimensions = (
  type: string, 
  data?: Partial<FlowNodeData>
): { width: number; height: number } => {
  const d = data as { width?: number; height?: number; size?: number } | undefined;
  const defaults = DEFAULT_DIMENSIONS[type] ?? { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT };
  if (type === 'decision') {
    const s = d?.size ?? defaults.width;
    return { width: s, height: s };
  }
  return {
    width: d?.width ?? defaults.width,
    height: d?.height ?? defaults.height,
  };
};
