import ProcessNode from './ProcessNode';
import DecisionNode from './DecisionNode';
import DataNode from './DataNode';
import TerminalNode from './TerminalNode';
import CustomNode from './CustomNode';
import type { NodeTypes } from '@xyflow/react';

const devNodeTypes = [
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
] as const;

export const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  data: DataNode,
  terminal: TerminalNode,
  custom: CustomNode,
  ...Object.fromEntries(devNodeTypes.map((t) => [t, CustomNode])),
} as NodeTypes;

export { ProcessNode, DecisionNode, DataNode, TerminalNode, CustomNode };
