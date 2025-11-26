import type { Operation, Graph, Node, Edge } from '../types';
import { createLogger } from '@sim4d/engine-core';

const logger = createLogger('Collaboration');

/**
 * OptimisticStateManager - Manages optimistic UI updates with rollback
 *
 * This manager provides instant UI feedback by applying operations locally
 * before server confirmation. If the server rejects an operation or applies
 * a conflicting operation, this manager can roll back the optimistic changes.
 *
 * Features:
 * - Instant local updates (no network latency)
 * - Automatic rollback on conflicts
 * - Operation tracking and reconciliation
 * - Conflict resolution strategies
 */
export class OptimisticStateManager {
  private baseGraph: Graph;
  private optimisticGraph: Graph;
  private pendingOperations: Map<string, PendingOperation> = new Map();
  private readonly maxPendingAge: number;

  constructor(initialGraph: Graph, options: OptimisticStateOptions = {}) {
    this.baseGraph = this.cloneGraph(initialGraph);
    this.optimisticGraph = this.cloneGraph(initialGraph);
    this.maxPendingAge = options.maxPendingAge ?? 30000; // 30 seconds
  }

  /**
   * Apply an operation optimistically
   * Returns the optimistic graph state
   */
  applyOptimistic(operation: Operation): Graph {
    // Track as pending
    const pending: PendingOperation = {
      operation,
      appliedAt: Date.now(),
      status: 'pending',
    };
    this.pendingOperations.set(operation.id, pending);

    // Apply to optimistic graph
    this.applyOperationToGraph(this.optimisticGraph, operation);

    return this.cloneGraph(this.optimisticGraph);
  }

  /**
   * Confirm an operation was accepted by server
   * Updates base graph and removes from pending
   */
  confirmOperation(operationId: string): void {
    const pending = this.pendingOperations.get(operationId);
    if (!pending) {
      return;
    }

    // Apply to base graph
    this.applyOperationToGraph(this.baseGraph, pending.operation);

    // Remove from pending
    this.pendingOperations.delete(operationId);

    // Update status
    pending.status = 'confirmed';
  }

  /**
   * Reject an operation (server rejected or conflict detected)
   * Rolls back the optimistic change
   */
  rejectOperation(operationId: string): Graph {
    const pending = this.pendingOperations.get(operationId);
    if (!pending) {
      return this.optimisticGraph;
    }

    // Mark as rejected
    pending.status = 'rejected';
    this.pendingOperations.delete(operationId);

    // Rebuild optimistic graph from base + remaining pending ops
    this.rebuildOptimisticGraph();

    return this.cloneGraph(this.optimisticGraph);
  }

  /**
   * Apply a remote operation from server
   * Reconciles with pending operations
   */
  applyRemoteOperation(operation: Operation): Graph {
    // Apply to base graph
    this.applyOperationToGraph(this.baseGraph, operation);

    // Check for conflicts with pending operations
    this.detectAndResolveConflicts(operation);

    // Rebuild optimistic graph
    this.rebuildOptimisticGraph();

    return this.cloneGraph(this.optimisticGraph);
  }

  /**
   * Get the current optimistic graph state
   */
  getOptimisticGraph(): Graph {
    return this.cloneGraph(this.optimisticGraph);
  }

  /**
   * Get the base graph state (confirmed operations only)
   */
  getBaseGraph(): Graph {
    return this.cloneGraph(this.baseGraph);
  }

  /**
   * Get all pending operations
   */
  getPendingOperations(): PendingOperation[] {
    return Array.from(this.pendingOperations.values());
  }

  /**
   * Check if there are pending operations
   */
  hasPendingOperations(): boolean {
    return this.pendingOperations.size > 0;
  }

  /**
   * Remove expired pending operations
   */
  removeExpiredPending(): number {
    const now = Date.now();
    let removed = 0;

    for (const [id, pending] of this.pendingOperations.entries()) {
      const age = now - pending.appliedAt;
      if (age > this.maxPendingAge) {
        this.pendingOperations.delete(id);
        removed++;
      }
    }

    if (removed > 0) {
      this.rebuildOptimisticGraph();
    }

    return removed;
  }

  /**
   * Rebuild optimistic graph from base + pending operations
   */
  private rebuildOptimisticGraph(): void {
    // Start with base graph
    this.optimisticGraph = this.cloneGraph(this.baseGraph);

    // Reapply all pending operations in order
    const pendingOps = Array.from(this.pendingOperations.values()).sort(
      (a, b) => a.operation.timestamp - b.operation.timestamp
    );

    for (const pending of pendingOps) {
      if (pending.status === 'pending') {
        this.applyOperationToGraph(this.optimisticGraph, pending.operation);
      }
    }
  }

  /**
   * Detect conflicts between remote operation and pending operations
   */
  private detectAndResolveConflicts(remoteOp: Operation): void {
    const conflictingOps: string[] = [];

    for (const [id, pending] of this.pendingOperations.entries()) {
      if (this.isConflicting(pending.operation, remoteOp)) {
        // Mark as conflicting
        pending.status = 'conflicted';
        pending.conflictWith = remoteOp.id;
        conflictingOps.push(id);
      }
    }

    // Remove conflicting operations
    for (const id of conflictingOps) {
      this.pendingOperations.delete(id);
      logger.warn(`Optimistic operation ${id} conflicted with remote operation ${remoteOp.id}`);
    }
  }

  /**
   * Check if two operations conflict
   */
  private isConflicting(op1: Operation, op2: Operation): boolean {
    // Same node operations
    if (
      op1.type === 'UPDATE_NODE' &&
      op2.type === 'UPDATE_NODE' &&
      'nodeId' in op1 &&
      'nodeId' in op2
    ) {
      return op1.nodeId === op2.nodeId;
    }

    if (
      op1.type === 'DELETE_NODE' &&
      op2.type === 'UPDATE_NODE' &&
      'nodeId' in op1 &&
      'nodeId' in op2
    ) {
      return op1.nodeId === op2.nodeId;
    }

    if (
      op1.type === 'UPDATE_NODE' &&
      op2.type === 'DELETE_NODE' &&
      'nodeId' in op1 &&
      'nodeId' in op2
    ) {
      return op1.nodeId === op2.nodeId;
    }

    // Same edge operations
    if (
      op1.type === 'DELETE_EDGE' &&
      op2.type === 'DELETE_EDGE' &&
      'edgeId' in op1 &&
      'edgeId' in op2
    ) {
      return op1.edgeId === op2.edgeId;
    }

    return false;
  }

  /**
   * Apply an operation to a graph (in-place mutation)
   */
  private applyOperationToGraph(graph: Graph, operation: Operation): void {
    switch (operation.type) {
      case 'ADD_NODE':
        if ('node' in operation) {
          graph.nodes.push(operation.node);
        }
        break;

      case 'DELETE_NODE':
        if ('nodeId' in operation) {
          graph.nodes = graph.nodes.filter((n) => n.id !== operation.nodeId);
          graph.edges = graph.edges.filter(
            (e) => e.source !== operation.nodeId && e.target !== operation.nodeId
          );
        }
        break;

      case 'UPDATE_NODE':
        if ('nodeId' in operation && 'updates' in operation) {
          const nodeIndex = graph.nodes.findIndex((n) => n.id === operation.nodeId);
          if (nodeIndex >= 0) {
            graph.nodes[nodeIndex] = {
              ...graph.nodes[nodeIndex],
              ...operation.updates,
            };
          }
        }
        break;

      case 'ADD_EDGE':
        if ('edge' in operation) {
          graph.edges.push(operation.edge);
        }
        break;

      case 'DELETE_EDGE':
        if ('edgeId' in operation) {
          graph.edges = graph.edges.filter((e) => e.id !== operation.edgeId);
        }
        break;

      case 'UPDATE_GRAPH_METADATA':
        if ('metadata' in operation) {
          graph.metadata = {
            ...graph.metadata,
            ...operation.metadata,
          };
        }
        break;
    }
  }

  /**
   * Deep clone a graph
   */
  private cloneGraph(graph: Graph): Graph {
    return {
      nodes: graph.nodes.map((n) => ({ ...n })),
      edges: graph.edges.map((e) => ({ ...e })),
      metadata: { ...graph.metadata },
      version: graph.version || '1',
      units: graph.units || 'mm',
      tolerance: graph.tolerance || 0.001,
    };
  }

  /**
   * Get statistics about optimistic state
   */
  getStats(): OptimisticStats {
    const pending = Array.from(this.pendingOperations.values());
    const ages = pending.map((p) => Date.now() - p.appliedAt);

    return {
      pendingCount: this.pendingOperations.size,
      oldestPendingAge: ages.length > 0 ? Math.max(...ages) : 0,
      averagePendingAge: ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0,
      conflictedCount: pending.filter((p) => p.status === 'conflicted').length,
    };
  }

  /**
   * Clear all state and reset to base graph
   */
  reset(newBaseGraph?: Graph): void {
    if (newBaseGraph) {
      this.baseGraph = this.cloneGraph(newBaseGraph);
      this.optimisticGraph = this.cloneGraph(newBaseGraph);
    } else {
      this.optimisticGraph = this.cloneGraph(this.baseGraph);
    }
    this.pendingOperations.clear();
  }
}

export interface OptimisticStateOptions {
  maxPendingAge?: number; // Max age for pending operations (ms)
}

export interface PendingOperation {
  operation: Operation;
  appliedAt: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'conflicted';
  conflictWith?: string; // ID of conflicting operation
}

export interface OptimisticStats {
  pendingCount: number;
  oldestPendingAge: number;
  averagePendingAge: number;
  conflictedCount: number;
}
