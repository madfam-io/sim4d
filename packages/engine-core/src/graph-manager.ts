import type { GraphInstance, NodeInstance, Edge, NodeId, SocketRef } from '@sim4d/types';
import { createNodeId, createEdgeId } from '@sim4d/types';
import { uuidv4 } from './utils/uuid';

export class GraphManager {
  private graph: GraphInstance;
  private listeners = new Set<(graph: GraphInstance) => void>();

  constructor(graph?: GraphInstance) {
    this.graph = graph || this.createEmptyGraph();
  }

  /**
   * Create an empty graph
   */
  private createEmptyGraph(): GraphInstance {
    return {
      version: '0.1.0',
      units: 'mm',
      tolerance: 0.001,
      nodes: [],
      edges: [],
      metadata: {
        created: new Date().toISOString(),
      },
    };
  }

  /**
   * Get current graph
   */
  getGraph(): GraphInstance {
    return this.graph;
  }

  /**
   * Set graph
   */
  setGraph(graph: GraphInstance): void {
    this.graph = graph;
    this.notifyListeners();
  }

  /**
   * Add a node
   */
  addNode(node: Omit<NodeInstance, 'id'>): NodeInstance {
    const newNode: NodeInstance = {
      ...node,
      id: createNodeId(uuidv4()),
      dirty: true,
    };

    this.graph.nodes.push(newNode);
    this.notifyListeners();
    return newNode;
  }

  /**
   * Remove a node
   */
  removeNode(nodeId: NodeId): void {
    // Remove node
    this.graph.nodes = this.graph.nodes.filter((n) => n.id !== nodeId);

    // Remove connected edges
    this.graph.edges = this.graph.edges.filter((e) => e.source !== nodeId && e.target !== nodeId);

    // Remove references from other nodes' inputs
    for (const node of this.graph.nodes) {
      for (const [key, value] of Object.entries(node.inputs)) {
        if (Array.isArray(value)) {
          node.inputs[key] = value.filter((ref: SocketRef) => ref.nodeId !== nodeId);
        } else if (value && (value as SocketRef).nodeId === nodeId) {
          delete node.inputs[key];
        }
      }
    }

    this.notifyListeners();
  }

  /**
   * Update a node
   */
  updateNode(nodeId: NodeId, updates: Partial<NodeInstance>): void {
    const node = this.graph.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    Object.assign(node, updates);
    node.dirty = true;

    // Mark downstream nodes as dirty
    this.markDownstreamDirty(nodeId);
    this.notifyListeners();
  }

  /**
   * Add an edge
   */
  addEdge(edge: Omit<Edge, 'id'>): Edge {
    const newEdge: Edge = {
      ...edge,
      id: createEdgeId(uuidv4()),
    };

    this.graph.edges.push(newEdge);

    // Update target node inputs
    const targetNode = this.graph.nodes.find((n) => n.id === edge.target);
    if (targetNode) {
      const socketRef: SocketRef = {
        nodeId: edge.source,
        socketId: edge.sourceHandle,
      };

      const existingInput = targetNode.inputs[edge.targetHandle];
      if (Array.isArray(existingInput)) {
        existingInput.push(socketRef);
      } else {
        targetNode.inputs[edge.targetHandle] = socketRef;
      }

      targetNode.dirty = true;
      this.markDownstreamDirty(edge.target);
    }

    this.notifyListeners();
    return newEdge;
  }

  /**
   * Remove an edge
   */
  removeEdge(edgeId: string): void {
    const edge = this.graph.edges.find((e) => e.id === edgeId);
    if (!edge) return;

    // Remove from edges array
    this.graph.edges = this.graph.edges.filter((e) => e.id !== edgeId);

    // Update target node inputs
    const targetNode = this.graph.nodes.find((n) => n.id === edge.target);
    if (targetNode) {
      const input = targetNode.inputs[edge.targetHandle];
      if (Array.isArray(input)) {
        targetNode.inputs[edge.targetHandle] = input.filter(
          (ref: SocketRef) => ref.nodeId !== edge.source || ref.socketId !== edge.sourceHandle
        );
      } else {
        delete targetNode.inputs[edge.targetHandle];
      }

      targetNode.dirty = true;
      this.markDownstreamDirty(edge.target);
    }

    this.notifyListeners();
  }

  /**
   * Mark downstream nodes as dirty
   */
  private markDownstreamDirty(nodeId: NodeId): void {
    const visited = new Set<NodeId>();
    const queue = [nodeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      // Find downstream nodes
      for (const edge of this.graph.edges) {
        if (edge.source === current) {
          const targetNode = this.graph.nodes.find((n) => n.id === edge.target);
          if (targetNode) {
            targetNode.dirty = true;
            queue.push(edge.target);
          }
        }
      }
    }
  }

  /**
   * Get dirty nodes
   */
  getDirtyNodes(): Set<NodeId> {
    return new Set(this.graph.nodes.filter((n) => n.dirty).map((n) => n.id));
  }

  /**
   * Clear dirty flags
   */
  clearDirtyFlags(): void {
    for (const node of this.graph.nodes) {
      node.dirty = false;
    }
  }

  /**
   * Validate graph
   */
  validate(): string[] {
    const errors: string[] = [];

    // Check for cycles
    try {
      this.detectCycles();
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    // Check for missing connections
    for (const node of this.graph.nodes) {
      for (const [key, socketRef] of Object.entries(node.inputs)) {
        const _inputName = key.split(':')[1];
        if (!socketRef) continue;

        const refs = Array.isArray(socketRef) ? socketRef : [socketRef];
        for (const ref of refs) {
          const sourceNode = this.graph.nodes.find((n) => n.id === ref.nodeId);
          if (!sourceNode) {
            errors.push(`Node ${node.id}: Missing source node ${ref.nodeId}`);
          }
        }
      }
    }

    return errors;
  }

  /**
   * Detect cycles in graph
   */
  private detectCycles(): void {
    const visited = new Set<NodeId>();
    const recursionStack = new Set<NodeId>();

    const hasCycle = (nodeId: NodeId): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      // Check all downstream nodes
      for (const edge of this.graph.edges) {
        if (edge.source === nodeId) {
          if (!visited.has(edge.target)) {
            if (hasCycle(edge.target)) return true;
          } else if (recursionStack.has(edge.target)) {
            return true;
          }
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of this.graph.nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          throw new Error('Graph contains cycles');
        }
      }
    }
  }

  /**
   * Subscribe to graph changes
   */
  subscribe(listener: (graph: GraphInstance) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.graph);
    }
  }

  /**
   * Serialize graph to JSON
   */
  toJSON(): string {
    return JSON.stringify(this.graph, null, 2);
  }

  /**
   * Load graph from JSON
   */
  fromJSON(json: string): void {
    const graph = JSON.parse(json) as GraphInstance;
    this.setGraph(graph);
  }
}
