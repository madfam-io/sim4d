import * as Y from 'yjs';
import { createLogger } from '@brepflow/engine-core';

const logger = createLogger('Collaboration');
import type { Graph, Node, Edge, Operation } from '../types';
import { createNodeId, createEdgeId } from '@brepflow/types';

/**
 * SharedGraph - Yjs CRDT-based graph structure for real-time collaboration
 *
 * This class wraps Yjs shared types to represent the BrepFlow graph structure.
 * It provides automatic conflict resolution, offline support, and guaranteed
 * eventual consistency across all connected clients.
 *
 * Architecture:
 * - Y.Map<Y.Map> for nodes (nodeId → node data as nested map)
 * - Y.Array<Y.Map> for edges (array of edge objects)
 * - Y.Map for graph metadata
 * - Automatic convergence through CRDT semantics
 */
export class SharedGraph {
  private ydoc: Y.Doc;
  private nodes: Y.Map<Y.Map<unknown>>;
  private edges: Y.Array<Y.Map<unknown>>;
  private metadata: Y.Map<unknown>;
  private undoManager: Y.UndoManager;

  constructor(ydoc?: Y.Doc) {
    this.ydoc = ydoc || new Y.Doc();

    // Initialize shared types
    this.nodes = this.ydoc.getMap('nodes');
    this.edges = this.ydoc.getArray('edges');
    this.metadata = this.ydoc.getMap('metadata');

    // Setup undo/redo manager
    this.undoManager = new Y.UndoManager([this.nodes, this.edges, this.metadata], {
      trackedOrigins: new Set([this.ydoc.clientID]),
      captureTimeout: 500, // Group operations within 500ms
    });
  }

  /**
   * Get the underlying Yjs document
   */
  getYDoc(): Y.Doc {
    return this.ydoc;
  }

  /**
   * Get the undo manager for collaborative undo/redo
   */
  getUndoManager(): Y.UndoManager {
    return this.undoManager;
  }

  /**
   * Apply a BrepFlow operation to the shared graph
   * Operations are automatically synced to all connected clients
   */
  applyOperation(operation: Operation): void {
    this.ydoc.transact(() => {
      switch (operation.type) {
        case 'ADD_NODE':
          this.addNode(operation.node);
          break;

        case 'DELETE_NODE':
          this.deleteNode(operation.nodeId);
          break;

        case 'UPDATE_NODE':
          this.updateNode(operation.nodeId, operation.updates);
          break;

        case 'ADD_EDGE':
          this.addEdge(operation.edge);
          break;

        case 'DELETE_EDGE':
          this.deleteEdge(operation.edgeId);
          break;

        case 'UPDATE_GRAPH_METADATA':
          if (operation.metadata) {
            this.updateMetadata(operation.metadata);
          }
          break;

        default:
          logger.warn('Unknown operation type:', (operation as unknown).type);
      }
    }, operation.userId); // Track operation origin for undo/redo
  }

  /**
   * Add a node to the shared graph
   */
  private addNode(node: Node): void {
    const nodeMap = new Y.Map();

    // Convert node object to Y.Map
    Object.entries(node).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Nested object - create nested Y.Map
        const nestedMap = new Y.Map();
        Object.entries(value).forEach(([k, v]) => nestedMap.set(k, v));
        nodeMap.set(key, nestedMap);
      } else {
        nodeMap.set(key, value);
      }
    });

    this.nodes.set(node.id, nodeMap);
  }

  /**
   * Delete a node from the shared graph
   * Also removes connected edges (cascade delete)
   */
  private deleteNode(nodeId: string): void {
    // Delete the node
    this.nodes.delete(nodeId);

    // Delete connected edges
    const edgesToDelete: number[] = [];
    this.edges.forEach((edgeMap, index) => {
      const source = edgeMap.get('source');
      const target = edgeMap.get('target');
      if (source === nodeId || target === nodeId) {
        edgesToDelete.push(index);
      }
    });

    // Delete in reverse order to maintain indices
    edgesToDelete.reverse().forEach((index) => {
      this.edges.delete(index, 1);
    });
  }

  /**
   * Update a node in the shared graph
   * Uses last-write-wins semantics for conflicting updates
   */
  private updateNode(nodeId: string, updates: Partial<Node>): void {
    const nodeMap = this.nodes.get(nodeId);
    if (!nodeMap) {
      logger.warn(`Node ${nodeId} not found for update`);
      return;
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Nested object - merge with existing nested map
        let nestedMap = nodeMap.get(key) as Y.Map<unknown>;
        if (!nestedMap || !(nestedMap instanceof Y.Map)) {
          nestedMap = new Y.Map();
          nodeMap.set(key, nestedMap);
        }
        Object.entries(value).forEach(([k, v]) => nestedMap.set(k, v));
      } else {
        nodeMap.set(key, value);
      }
    });
  }

  /**
   * Add an edge to the shared graph
   */
  private addEdge(edge: Edge): void {
    const edgeMap = new Y.Map();
    Object.entries(edge).forEach(([key, value]) => edgeMap.set(key, value));
    this.edges.push([edgeMap]);
  }

  /**
   * Delete an edge from the shared graph
   */
  private deleteEdge(edgeId: string): void {
    let indexToDelete = -1;
    this.edges.forEach((edgeMap, index) => {
      if (edgeMap.get('id') === edgeId) {
        indexToDelete = index;
      }
    });

    if (indexToDelete >= 0) {
      this.edges.delete(indexToDelete, 1);
    }
  }

  /**
   * Update graph metadata
   */
  private updateMetadata(updates: Record<string, unknown>): void {
    Object.entries(updates).forEach(([key, value]) => {
      this.metadata.set(key, value);
    });
  }

  /**
   * Convert the shared graph to a BrepFlow Graph object
   */
  toGraph(): Graph {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Convert nodes
    this.nodes.forEach((nodeMap, nodeId) => {
      const node: unknown = { id: nodeId };
      nodeMap.forEach((value, key) => {
        if (value instanceof Y.Map) {
          // Nested map - convert to plain object
          const nestedObj: any = {};
          value.forEach((v, k) => (nestedObj[k] = v));
          node[key] = nestedObj;
        } else {
          node[key] = value;
        }
      });
      nodes.push(node as Node);
    });

    // Convert edges
    this.edges.forEach((edgeMap) => {
      const edge: unknown = {};
      edgeMap.forEach((value, key) => (edge[key] = value));
      edges.push(edge as Edge);
    });

    // Convert metadata
    const metadata: unknown = {};
    this.metadata.forEach((value, key) => (metadata[key] = value));

    return {
      nodes,
      edges,
      metadata,
      version: '1', // CRDT version managed by Yjs
      units: this.metadata.get('units') || 'mm',
      tolerance: this.metadata.get('tolerance') || 0.001,
    };
  }

  /**
   * Initialize from a BrepFlow Graph
   * Used for bootstrapping from existing graph data
   */
  fromGraph(graph: Graph): void {
    this.ydoc.transact(() => {
      // Clear existing data
      this.nodes.clear();
      // Clear edges manually (Y.Array doesn't have clear method)
      const edgeCount = this.edges.length;
      this.edges.delete(0, edgeCount);
      this.metadata.clear();

      // Add nodes
      graph.nodes.forEach((node) => this.addNode(node));

      // Add edges
      graph.edges.forEach((edge) => this.addEdge(edge));

      // Add metadata
      if (graph.metadata) {
        this.updateMetadata(graph.metadata);
      }
    });
  }

  /**
   * Get a snapshot of the graph state as binary data
   * Used for persistence and network transmission
   */
  getSnapshot(): Uint8Array {
    return Y.encodeStateAsUpdate(this.ydoc);
  }

  /**
   * Apply a binary snapshot to the graph
   * Merges with existing state using CRDT semantics
   */
  applySnapshot(snapshot: Uint8Array): void {
    Y.applyUpdate(this.ydoc, snapshot);
  }

  /**
   * Get the document size in bytes
   * Useful for monitoring memory usage
   */
  getDocumentSize(): number {
    return Y.encodeStateAsUpdate(this.ydoc).byteLength;
  }

  /**
   * Subscribe to graph changes
   */
  onChange(callback: (event: Y.YEvent<unknown>[]) => void): void {
    this.ydoc.on('update', (update: Uint8Array, origin: any) => {
      // Convert update to events for callback
      const events: Y.YEvent<unknown>[] = [];
      // Note: Yjs doesn't provide direct event access from update
      // This is a simplified version - real implementation would need
      // to observe individual shared types
      callback(events);
    });
  }

  /**
   * Perform undo operation
   * Reverts the last local operation
   */
  undo(): boolean {
    const result = this.undoManager.undo();
    return result !== null;
  }

  /**
   * Perform redo operation
   * Re-applies the last undone operation
   */
  redo(): boolean {
    const result = this.undoManager.redo();
    return result !== null;
  }

  /**
   * Clear undo/redo history
   */
  clearHistory(): void {
    this.undoManager.clear();
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoManager.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.undoManager.redoStack.length > 0;
  }

  /**
   * Destroy the shared graph and cleanup resources
   */
  destroy(): void {
    this.undoManager.destroy();
    this.ydoc.destroy();
  }
}
