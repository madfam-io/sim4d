import type { Node as RFNode, Edge as RFEdge } from 'reactflow';
import { MarkerType } from 'reactflow';
import type { GraphInstance, NodeInstance, Edge, NodeId, EdgeId, SocketId } from '@brepflow/types';
import { createNodeId, createEdgeId, createSocketId } from '@brepflow/types';
import type { ErrorInfo } from '../hooks/useErrorTracking';

/**
 * Convert BrepFlow graph to ReactFlow format
 */
export function convertToReactFlow(
  graph: GraphInstance,
  selectedNodes?: Set<string>,
  errors?: Map<string, ErrorInfo>,
  onOpenParameterDialog?: (nodeType: string, position: { x: number; y: number }) => void
): {
  nodes: RFNode[];
  edges: RFEdge[];
} {
  const nodes: RFNode[] = graph.nodes.map((node) => ({
    id: node.id,
    type: getReactFlowNodeType(node.type),
    position: node.position || { x: 0, y: 0 },
    data: {
      label: getNodeLabel(node),
      nodeType: node.type,
      nodeData: node,
      isSelected: selectedNodes?.has(node.id) || false,
      hasError: errors?.has(node.id) || false,
      isExecuting: (node.state as unknown as string) === 'executing' || false,
      onOpenParameterDialog,
      ...node,
    },
  }));

  const edges: RFEdge[] = graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    sourceHandle: edge.sourceHandle,
    target: edge.target,
    targetHandle: edge.targetHandle,
    type: 'smoothstep',
    animated: true,
    style: {
      stroke: 'var(--color-primary-500)',
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.Arrow,
      color: 'var(--color-primary-500)',
    },
  }));

  return { nodes, edges };
}

/**
 * Convert ReactFlow format to BrepFlow graph
 */
export function convertFromReactFlow(nodes: RFNode[], edges: RFEdge[]): GraphInstance {
  const graphNodes: NodeInstance[] = nodes.map((node) => ({
    id: createNodeId(node.id),
    type: node.data?.type || node.type || 'unknown',
    position: node.position,
    inputs: node.data?.inputs || {},
    params: node.data?.params || {},
    outputs: node.data?.outputs,
    state: node.data?.state,
    dirty: node.data?.dirty,
  }));

  const graphEdges: Edge[] = edges.map((edge) => ({
    id: createEdgeId(edge.id),
    source: createNodeId(edge.source),
    sourceHandle: createSocketId(edge.sourceHandle || ''),
    target: createNodeId(edge.target),
    targetHandle: createSocketId(edge.targetHandle || ''),
  }));

  return {
    version: '0.1.0',
    units: 'mm',
    tolerance: 0.001,
    nodes: graphNodes,
    edges: graphEdges,
  };
}

/**
 * Get ReactFlow node type from BrepFlow node type
 */
function getReactFlowNodeType(type: string): string {
  // Map BrepFlow node types to ReactFlow node types
  if (type.startsWith('IO::Import')) return 'input';
  if (type.startsWith('IO::Export')) return 'output';
  return 'default';
}

/**
 * Get node label from node instance
 */
function getNodeLabel(node: NodeInstance): string {
  // Extract label from node type
  const parts = node.type.split('::');
  const label = parts[parts.length - 1];

  // Add parameter info for some nodes
  if (node.type === 'Solid::Box' && node.params) {
    const { width, height, depth } = node.params as unknown;
    if (width && height && depth) {
      return `Box (${width}×${height}×${depth})`;
    }
  }

  if (node.type === 'Features::Fillet' && node.params) {
    const { radius } = node.params as unknown;
    if (radius) {
      return `Fillet (R${radius})`;
    }
  }

  return label || 'Unknown';
}
