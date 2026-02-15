import type { Node, Edge } from '@xyflow/react';
import type { FlowNodeData } from '../types';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 52;
const HORIZONTAL_GAP = 48;
const VERTICAL_GAP = 32;

export function hierarchicalLayout(nodes: Node<FlowNodeData>[], edges: Edge[]): Node<FlowNodeData>[] {
  if (nodes.length === 0) return nodes;

  const idToNode = new Map(nodes.map((n) => [n.id, { ...n }]));
  const outEdges = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach((n) => {
    outEdges.set(n.id, []);
    inDegree.set(n.id, 0);
  });

  edges.forEach((e) => {
    outEdges.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  });

  const levels: string[][] = [];
  const assigned = new Set<string>();
  let currentLevel = nodes.filter((n) => inDegree.get(n.id) === 0).map((n) => n.id);

  while (currentLevel.length > 0) {
    levels.push(currentLevel);
    currentLevel.forEach((id) => assigned.add(id));
    const nextLevel = new Set<string>();
    currentLevel.forEach((id) => {
      outEdges.get(id)?.forEach((target) => {
        if (!assigned.has(target)) nextLevel.add(target);
      });
    });
    currentLevel = Array.from(nextLevel);
  }

  // Any node not reached (e.g. disconnected) goes to last level
  const remaining = nodes.filter((n) => !assigned.has(n.id)).map((n) => n.id);
  if (remaining.length > 0) levels.push(remaining);

  const result: Node<FlowNodeData>[] = [];
  levels.forEach((levelIds, levelIndex) => {
    levelIds.forEach((id, indexInLevel) => {
      const node = idToNode.get(id);
      if (!node) return;
      const x = indexInLevel * (NODE_WIDTH + HORIZONTAL_GAP) + 24;
      const y = levelIndex * (NODE_HEIGHT + VERTICAL_GAP) + 24;
      result.push({
        ...node,
        position: { x, y },
      });
    });
  });

  return result;
}
export function forceDirectedLayout(nodes: Node<FlowNodeData>[], _edges: Edge[]): Node<FlowNodeData>[] {
  const cols = Math.ceil(Math.sqrt(nodes.length));
  return nodes.map((n, i): Node<FlowNodeData> => ({
    ...n,
    position: {
      x: 24 + (i % cols) * (NODE_WIDTH + HORIZONTAL_GAP),
      y: 24 + Math.floor(i / cols) * (NODE_HEIGHT + VERTICAL_GAP),
    },
  }));
}
