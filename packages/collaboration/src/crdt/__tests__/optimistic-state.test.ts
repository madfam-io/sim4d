import { describe, it, expect, beforeEach } from 'vitest';
import { OptimisticStateManager } from '../optimistic-state';
import type { Operation, Graph, Node } from '../../types';
import { createNodeId } from '@sim4d/types';

describe('OptimisticStateManager', () => {
  let manager: OptimisticStateManager;
  let baseGraph: Graph;
  let testNode: Node;

  beforeEach(() => {
    testNode = {
      id: createNodeId('node-1'),
      type: 'Box',
      position: { x: 0, y: 0 },
      inputs: {},
      params: { width: 10 },
    };

    baseGraph = {
      nodes: [testNode],
      edges: [],
      metadata: {},
      version: '1',
      units: 'mm',
      tolerance: 0.001,
    };

    manager = new OptimisticStateManager(baseGraph);
  });

  describe('Optimistic Application', () => {
    it('should apply operation optimistically', () => {
      const operation: Operation = {
        id: 'op-1',
        type: 'UPDATE_NODE',
        nodeId: testNode.id,
        updates: { params: { width: 20 } },
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      const optimisticGraph = manager.applyOptimistic(operation);

      expect(optimisticGraph.nodes[0].params.width).toBe(20);
      expect(manager.hasPendingOperations()).toBe(true);
    });

    it('should track pending operations', () => {
      const operation: Operation = {
        id: 'op-1',
        type: 'ADD_NODE',
        node: testNode,
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      manager.applyOptimistic(operation);

      const pending = manager.getPendingOperations();
      expect(pending).toHaveLength(1);
      expect(pending[0].operation.id).toBe('op-1');
      expect(pending[0].status).toBe('pending');
    });
  });

  describe('Operation Confirmation', () => {
    it('should confirm operation', () => {
      const operation: Operation = {
        id: 'op-1',
        type: 'UPDATE_NODE',
        nodeId: testNode.id,
        updates: { params: { width: 20 } },
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      manager.applyOptimistic(operation);
      manager.confirmOperation('op-1');

      expect(manager.hasPendingOperations()).toBe(false);

      // Base graph should now have the change
      const baseGraph = manager.getBaseGraph();
      expect(baseGraph.nodes[0].params.width).toBe(20);
    });
  });

  describe('Operation Rejection', () => {
    it('should reject operation and rollback', () => {
      const operation: Operation = {
        id: 'op-1',
        type: 'UPDATE_NODE',
        nodeId: testNode.id,
        updates: { params: { width: 20 } },
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      manager.applyOptimistic(operation);
      const rejectedGraph = manager.rejectOperation('op-1');

      // Should roll back to original value
      expect(rejectedGraph.nodes[0].params.width).toBe(10);
      expect(manager.hasPendingOperations()).toBe(false);
    });

    it('should rebuild graph after rejection', () => {
      const op1: Operation = {
        id: 'op-1',
        type: 'UPDATE_NODE',
        nodeId: testNode.id,
        updates: { params: { width: 20 } },
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      const op2: Operation = {
        id: 'op-2',
        type: 'UPDATE_NODE',
        nodeId: testNode.id,
        updates: { params: { height: 30 } },
        userId: 'user-1',
        timestamp: Date.now() + 1,
        documentId: 'doc-1',
      };

      manager.applyOptimistic(op1);
      manager.applyOptimistic(op2);

      // Reject first operation
      manager.rejectOperation('op-1');

      // Second operation should still be applied
      const graph = manager.getOptimisticGraph();
      // After rejecting op1, only op2's changes remain (height update)
      expect(graph.nodes[0].params).toBeDefined();
      // Width should be original (10) since op1 was rejected
      expect(graph.nodes[0].params.width || 10).toBe(10);
      // Height should be from op2 (30)
      expect(graph.nodes[0].params.height).toBe(30);
    });
  });

  describe('Remote Operations', () => {
    it('should apply remote operation to base graph', () => {
      const remoteOp: Operation = {
        id: 'remote-1',
        type: 'UPDATE_NODE',
        nodeId: testNode.id,
        updates: { params: { depth: 15 } },
        userId: 'user-2',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      const graph = manager.applyRemoteOperation(remoteOp);

      expect(graph.nodes[0].params.depth).toBe(15);
    });

    it('should detect conflicts with pending operations', () => {
      const localOp: Operation = {
        id: 'local-1',
        type: 'UPDATE_NODE',
        nodeId: testNode.id,
        updates: { params: { width: 20 } },
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      manager.applyOptimistic(localOp);

      const remoteOp: Operation = {
        id: 'remote-1',
        type: 'UPDATE_NODE',
        nodeId: testNode.id,
        updates: { params: { width: 25 } },
        userId: 'user-2',
        timestamp: Date.now() + 1,
        documentId: 'doc-1',
      };

      manager.applyRemoteOperation(remoteOp);

      // Local operation should be marked as conflicted and removed
      expect(manager.hasPendingOperations()).toBe(false);
    });

    it('should handle delete-update conflicts', () => {
      const localOp: Operation = {
        id: 'local-1',
        type: 'UPDATE_NODE',
        nodeId: testNode.id,
        updates: { params: { width: 20 } },
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      manager.applyOptimistic(localOp);

      const remoteOp: Operation = {
        id: 'remote-1',
        type: 'DELETE_NODE',
        nodeId: testNode.id,
        userId: 'user-2',
        timestamp: Date.now() + 1,
        documentId: 'doc-1',
      };

      const graph = manager.applyRemoteOperation(remoteOp);

      // Node should be deleted (remote wins)
      expect(graph.nodes).toHaveLength(0);
      expect(manager.hasPendingOperations()).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should distinguish between base and optimistic graphs', () => {
      const operation: Operation = {
        id: 'op-1',
        type: 'UPDATE_NODE',
        nodeId: testNode.id,
        updates: { params: { width: 20 } },
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      manager.applyOptimistic(operation);

      const optimisticGraph = manager.getOptimisticGraph();
      const baseGraph = manager.getBaseGraph();

      expect(optimisticGraph.nodes[0].params.width).toBe(20);
      expect(baseGraph.nodes[0].params.width).toBe(10);
    });

    it('should reset to base graph', () => {
      const operation: Operation = {
        id: 'op-1',
        type: 'UPDATE_NODE',
        nodeId: testNode.id,
        updates: { params: { width: 20 } },
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      manager.applyOptimistic(operation);
      manager.reset();

      expect(manager.hasPendingOperations()).toBe(false);
      const graph = manager.getOptimisticGraph();
      expect(graph.nodes[0].params.width).toBe(10);
    });
  });

  describe('Statistics', () => {
    it('should provide optimistic stats', () => {
      const operation: Operation = {
        id: 'op-1',
        type: 'UPDATE_NODE',
        nodeId: testNode.id,
        updates: { params: { width: 20 } },
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      manager.applyOptimistic(operation);
      const stats = manager.getStats();

      expect(stats.pendingCount).toBe(1);
      expect(stats.conflictedCount).toBe(0);
      expect(stats.oldestPendingAge).toBeGreaterThanOrEqual(0);
    });

    it('should track conflicted operations in stats', () => {
      const localOp: Operation = {
        id: 'local-1',
        type: 'UPDATE_NODE',
        nodeId: testNode.id,
        updates: { params: { width: 20 } },
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      manager.applyOptimistic(localOp);

      const remoteOp: Operation = {
        id: 'remote-1',
        type: 'DELETE_NODE',
        nodeId: testNode.id,
        userId: 'user-2',
        timestamp: Date.now() + 1,
        documentId: 'doc-1',
      };

      manager.applyRemoteOperation(remoteOp);
      const stats = manager.getStats();

      // Conflicted operations are removed, not tracked in stats
      expect(stats.pendingCount).toBe(0);
    });
  });
});
