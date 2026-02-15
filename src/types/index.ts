import type { Node, Edge } from '@xyflow/react';

export type NodeTypeId =
  | 'process'
  | 'decision'
  | 'data'
  | 'terminal'
  | 'custom'
  // Development / architecture
  | 'api'
  | 'service'
  | 'queue'
  | 'cache'
  | 'message'
  | 'document'
  | 'interface'
  // Infrastructure
  | 'container'
  | 'server'
  | 'function'
  | 'cloud'
  // UML / flow
  | 'actor'
  | 'inputoutput';

export type CustomShapeId = 'rectangle' | 'rounded' | 'ellipse' | 'hexagon' | 'parallelogram';

interface BaseNodeData {
  label: string;
  [key: string]: unknown;
}

export interface ProcessNodeData extends BaseNodeData {
  label: string;
  color?: string;
  width?: number;
  height?: number;
}

export interface DecisionNodeData extends BaseNodeData {
  label: string;
  color?: string;
  size?: number;
}

export interface DataNodeData extends BaseNodeData {
  label: string;
  color?: string;
  width?: number;
  height?: number;
}

export interface TerminalNodeData extends BaseNodeData {
  label: string;
  color?: string;
  width?: number;
  height?: number;
  variant: 'start' | 'end';
}

export interface CustomNodeData extends BaseNodeData {
  label: string;
  color?: string;
  width?: number;
  height?: number;
  shape: CustomShapeId;
}

export type FlowNodeData =
  | ProcessNodeData
  | DecisionNodeData
  | DataNodeData
  | TerminalNodeData
  | CustomNodeData;

export type EdgeTypeId = 'straight' | 'default' | 'step';

export interface PaletteItem {
  id: NodeTypeId;
  label: string;
  category: string;
  icon: string;
  defaultData: Partial<FlowNodeData>;
}

export interface DiagramState {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}
