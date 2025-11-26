import { createNodeId, createEdgeId } from '@sim4d/types';
import type { Operation, Conflict, Node } from '../types';

export class OperationalTransform {
  /**
   * Transform an operation against a list of concurrent operations
   */
  transform(operation: Operation, concurrentOps: Operation[]): Operation {
    let transformedOp = { ...operation };

    for (const concurrentOp of concurrentOps) {
      // Skip if same operation or from same user
      if (concurrentOp.id === operation.id || concurrentOp.userId === operation.userId) {
        continue;
      }

      // Skip if operations are on different documents
      if (concurrentOp.documentId !== operation.documentId) {
        continue;
      }

      // Transform based on operation types
      transformedOp = this.transformPair(transformedOp, concurrentOp);
    }

    return transformedOp;
  }

  /**
   * Transform a pair of operations
   */
  private transformPair(op1: Operation, op2: Operation): Operation {
    // Handle based on operation type combinations
    if (op1.type === 'ADD_NODE' && op2.type === 'ADD_NODE') {
      return this.transformAddNodeAddNode(op1, op2);
    }

    if (op1.type === 'DELETE_NODE' && op2.type === 'DELETE_NODE') {
      return this.transformDeleteNodeDeleteNode(op1, op2);
    }

    if (op1.type === 'UPDATE_NODE' && op2.type === 'UPDATE_NODE') {
      return this.transformUpdateNodeUpdateNode(op1, op2);
    }

    if (op1.type === 'DELETE_NODE' && op2.type === 'UPDATE_NODE') {
      return this.transformDeleteNodeUpdateNode(op1, op2);
    }

    if (op1.type === 'UPDATE_NODE' && op2.type === 'DELETE_NODE') {
      return this.transformUpdateNodeDeleteNode(op1, op2);
    }

    if (op1.type === 'ADD_EDGE' && op2.type === 'ADD_EDGE') {
      return this.transformAddEdgeAddEdge(op1, op2);
    }

    if (op1.type === 'DELETE_EDGE' && op2.type === 'DELETE_EDGE') {
      return this.transformDeleteEdgeDeleteEdge(op1, op2);
    }

    if (op1.type === 'ADD_EDGE' && op2.type === 'DELETE_NODE') {
      return this.transformAddEdgeDeleteNode(op1, op2);
    }

    if (op1.type === 'DELETE_NODE' && op2.type === 'ADD_EDGE') {
      return this.transformDeleteNodeAddEdge(op1, op2);
    }

    // Default: no transformation needed
    return op1;
  }

  private transformAddNodeAddNode(op1: Operation, op2: Operation): Operation {
    if (op1.type !== 'ADD_NODE' || op2.type !== 'ADD_NODE') return op1;

    // If nodes have same ID, use timestamp to determine winner
    if (op1.node.id === op2.node.id) {
      if (op1.timestamp > op2.timestamp) {
        // op1 wins, generate new ID for op1
        return {
          ...op1,
          node: {
            ...op1.node,
            id: createNodeId(`${op1.node.id}_${op1.userId}`),
          },
        };
      }
    }

    return op1;
  }

  private transformDeleteNodeDeleteNode(op1: Operation, op2: Operation): Operation {
    if (op1.type !== 'DELETE_NODE' || op2.type !== 'DELETE_NODE') return op1;

    // Both trying to delete same node - no conflict
    if (op1.nodeId === op2.nodeId) {
      return op1;
    }

    return op1;
  }

  private transformUpdateNodeUpdateNode(op1: Operation, op2: Operation): Operation {
    if (op1.type !== 'UPDATE_NODE' || op2.type !== 'UPDATE_NODE') return op1;

    // If updating same node, merge updates with timestamp priority
    if (op1.nodeId === op2.nodeId) {
      if (op1.timestamp > op2.timestamp) {
        // op1 is newer, keep its updates
        return op1;
      } else {
        // op2 is newer, merge non-conflicting fields
        const mergedUpdates: Partial<Node> = { ...op2.updates };
        for (const [key, value] of Object.entries(op1.updates)) {
          const typedKey = key as keyof Node;
          if (!Object.prototype.hasOwnProperty.call(op2.updates, typedKey)) {
            (mergedUpdates as Record<string, unknown>)[typedKey as string] = value;
          }
        }
        return {
          ...op1,
          updates: mergedUpdates,
        };
      }
    }

    return op1;
  }

  private transformDeleteNodeUpdateNode(op1: Operation, op2: Operation): Operation {
    if (op1.type !== 'DELETE_NODE' || op2.type !== 'UPDATE_NODE') return op1;

    // Delete wins over update
    if (op1.nodeId === op2.nodeId) {
      return op1; // Keep delete operation
    }

    return op1;
  }

  private transformUpdateNodeDeleteNode(op1: Operation, op2: Operation): Operation {
    if (op1.type !== 'UPDATE_NODE' || op2.type !== 'DELETE_NODE') return op1;

    // Delete wins over update - mark update as no-op
    if (op1.nodeId === op2.nodeId) {
      return {
        ...op1,
        updates: {}, // Empty update (no-op)
      };
    }

    return op1;
  }

  private transformAddEdgeAddEdge(op1: Operation, op2: Operation): Operation {
    if (op1.type !== 'ADD_EDGE' || op2.type !== 'ADD_EDGE') return op1;

    // If edges have same ID, use timestamp to determine winner
    if (op1.edge.id === op2.edge.id) {
      if (op1.timestamp > op2.timestamp) {
        return {
          ...op1,
          edge: {
            ...op1.edge,
            id: createEdgeId(`${op1.edge.id}_${op1.userId}`),
          },
        };
      }
    }

    return op1;
  }

  private transformDeleteEdgeDeleteEdge(op1: Operation, op2: Operation): Operation {
    if (op1.type !== 'DELETE_EDGE' || op2.type !== 'DELETE_EDGE') return op1;

    // Both trying to delete same edge - no conflict
    return op1;
  }

  private transformAddEdgeDeleteNode(op1: Operation, op2: Operation): Operation {
    if (op1.type !== 'ADD_EDGE' || op2.type !== 'DELETE_NODE') return op1;

    // If edge connects to deleted node, invalidate edge addition
    if (op1.edge.source === op2.nodeId || op1.edge.target === op2.nodeId) {
      // Return a no-op version of the operation
      return {
        ...op1,
        edge: {
          ...op1.edge,
          id: '', // Invalid edge
        },
      };
    }

    return op1;
  }

  private transformDeleteNodeAddEdge(op1: Operation, op2: Operation): Operation {
    if (op1.type !== 'DELETE_NODE' || op2.type !== 'ADD_EDGE') return op1;

    // Delete node operation remains unchanged
    return op1;
  }

  /**
   * Detect conflicts between operations
   */
  detectConflicts(operation: Operation, existingOps: Operation[]): Conflict[] {
    const conflicts: Conflict[] = [];

    for (const existingOp of existingOps) {
      if (this.isConflicting(operation, existingOp)) {
        conflicts.push({
          operation1: operation,
          operation2: existingOp,
          resolution: this.resolveConflict(operation, existingOp),
        });
      }
    }

    return conflicts;
  }

  private isConflicting(op1: Operation, op2: Operation): boolean {
    // Same user operations don't conflict
    if (op1.userId === op2.userId) return false;

    // Operations on different documents don't conflict
    if (op1.documentId !== op2.documentId) return false;

    // Check specific conflict conditions
    if (op1.type === 'UPDATE_NODE' && op2.type === 'UPDATE_NODE' && op1.nodeId === op2.nodeId) {
      return true; // Concurrent updates to same node
    }

    if (op1.type === 'DELETE_NODE' && op2.type === 'UPDATE_NODE' && op1.nodeId === op2.nodeId) {
      return true; // Delete vs update conflict
    }

    if (op1.type === 'ADD_NODE' && op2.type === 'ADD_NODE' && op1.node.id === op2.node.id) {
      return true; // Same ID conflict
    }

    return false;
  }

  private resolveConflict(op1: Operation, op2: Operation): Operation | undefined {
    // Use timestamp-based resolution
    if (op1.timestamp > op2.timestamp) {
      return op1;
    } else {
      return op2;
    }
  }
}
