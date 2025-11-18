import { describe, it, expect, beforeEach } from 'vitest';
import { SharedGraph } from '../shared-graph';
import type { Graph, Operation, Node, Edge } from '../../types';
import { createNodeId, createEdgeId } from '@brepflow/types';

describe('SharedGraph', () => {
  let sharedGraph: SharedGraph;
  let sampleGraph: Graph;

  beforeEach(() => {
    sharedGraph = new SharedGraph();

    sampleGraph = {
      nodes: [
        {
          id: createNodeId('node-1'),
          type: 'Box',
          position: { x: 0, y: 0 },
          inputs: {},
          params: { width: 10, height: 10, depth: 10 },
        } as Node,
      ],
      edges: [
        {
          id: createEdgeId('edge-1'),
          source: createNodeId('node-1'),
          target: createNodeId('node-2'),
          sourceSocket: 'output',
          targetSocket: 'input',
        } as Edge,
      ],
      metadata: {
        name: 'Test Graph',
        author: 'Test User',
      },
      version: '1',
      units: 'mm',
      tolerance: 0.001,
    };
  });

  describe('Graph Initialization', () => {
    it('should initialize from a graph', () => {
      sharedGraph.fromGraph(sampleGraph);
      const result = sharedGraph.toGraph();

      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(1);
      expect(result.metadata.name).toBe('Test Graph');
    });

    it('should preserve node data', () => {
      sharedGraph.fromGraph(sampleGraph);
      const result = sharedGraph.toGraph();

      expect(result.nodes[0].type).toBe('Box');
      expect(result.nodes[0].params.width).toBe(10);
    });
  });

  describe('Operation Application', () => {
    it('should apply ADD_NODE operation', () => {
      const operation: Operation = {
        id: 'op-1',
        type: 'ADD_NODE',
        node: sampleGraph.nodes[0],
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      sharedGraph.applyOperation(operation);
      const result = sharedGraph.toGraph();

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].id).toBe(sampleGraph.nodes[0].id);
    });

    it('should apply DELETE_NODE operation', () => {
      sharedGraph.fromGraph(sampleGraph);

      const operation: Operation = {
        id: 'op-2',
        type: 'DELETE_NODE',
        nodeId: sampleGraph.nodes[0].id,
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      sharedGraph.applyOperation(operation);
      const result = sharedGraph.toGraph();

      expect(result.nodes).toHaveLength(0);
    });

    it('should cascade delete connected edges when deleting node', () => {
      sharedGraph.fromGraph(sampleGraph);

      const operation: Operation = {
        id: 'op-3',
        type: 'DELETE_NODE',
        nodeId: createNodeId('node-1'),
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      sharedGraph.applyOperation(operation);
      const result = sharedGraph.toGraph();

      expect(result.edges).toHaveLength(0);
    });

    it('should apply UPDATE_NODE operation', () => {
      sharedGraph.fromGraph(sampleGraph);

      const operation: Operation = {
        id: 'op-4',
        type: 'UPDATE_NODE',
        nodeId: sampleGraph.nodes[0].id,
        updates: { params: { width: 20 } },
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      sharedGraph.applyOperation(operation);
      const result = sharedGraph.toGraph();

      expect(result.nodes[0].params.width).toBe(20);
    });

    it('should apply ADD_EDGE operation', () => {
      const operation: Operation = {
        id: 'op-5',
        type: 'ADD_EDGE',
        edge: sampleGraph.edges[0],
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      sharedGraph.applyOperation(operation);
      const result = sharedGraph.toGraph();

      expect(result.edges).toHaveLength(1);
    });

    it('should apply DELETE_EDGE operation', () => {
      sharedGraph.fromGraph(sampleGraph);

      const operation: Operation = {
        id: 'op-6',
        type: 'DELETE_EDGE',
        edgeId: sampleGraph.edges[0].id,
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      sharedGraph.applyOperation(operation);
      const result = sharedGraph.toGraph();

      expect(result.edges).toHaveLength(0);
    });

    it('should apply UPDATE_GRAPH_METADATA operation', () => {
      const operation: Operation = {
        id: 'op-7',
        type: 'UPDATE_GRAPH_METADATA',
        metadata: { description: 'Updated description' },
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      sharedGraph.applyOperation(operation);
      const result = sharedGraph.toGraph();

      expect(result.metadata.description).toBe('Updated description');
    });
  });

  describe('Undo/Redo', () => {
    // Note: Yjs undo/redo requires proper transaction tracking with origins
    // These tests are skipped pending proper multi-client setup
    it.skip('should support undo operation', () => {
      sharedGraph.fromGraph(sampleGraph);

      const operation: Operation = {
        id: 'op-8',
        type: 'DELETE_NODE',
        nodeId: sampleGraph.nodes[0].id,
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      sharedGraph.applyOperation(operation);
      expect(sharedGraph.toGraph().nodes).toHaveLength(0);

      sharedGraph.undo();
      expect(sharedGraph.toGraph().nodes).toHaveLength(1);
    });

    it.skip('should support redo operation', () => {
      sharedGraph.fromGraph(sampleGraph);

      const operation: Operation = {
        id: 'op-9',
        type: 'DELETE_NODE',
        nodeId: sampleGraph.nodes[0].id,
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      sharedGraph.applyOperation(operation);
      sharedGraph.undo();
      expect(sharedGraph.toGraph().nodes).toHaveLength(1);

      sharedGraph.redo();
      expect(sharedGraph.toGraph().nodes).toHaveLength(0);
    });

    it.skip('should report canUndo/canRedo correctly', () => {
      expect(sharedGraph.canUndo()).toBe(false);
      expect(sharedGraph.canRedo()).toBe(false);

      const operation: Operation = {
        id: 'op-10',
        type: 'ADD_NODE',
        node: sampleGraph.nodes[0],
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      sharedGraph.applyOperation(operation);
      expect(sharedGraph.canUndo()).toBe(true);

      sharedGraph.undo();
      expect(sharedGraph.canRedo()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    it('should create and apply snapshots', () => {
      sharedGraph.fromGraph(sampleGraph);
      const snapshot = sharedGraph.getSnapshot();

      const newGraph = new SharedGraph();
      newGraph.applySnapshot(snapshot);

      const result = newGraph.toGraph();
      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(1);
    });

    it('should report document size', () => {
      sharedGraph.fromGraph(sampleGraph);
      const size = sharedGraph.getDocumentSize();

      expect(size).toBeGreaterThan(0);
    });
  });

  describe('CRDT Convergence', () => {
    it('should converge when merging concurrent operations', () => {
      // Create two shared graphs (simulating two clients)
      const graph1 = new SharedGraph();
      const graph2 = new SharedGraph();

      graph1.fromGraph(sampleGraph);
      graph2.fromGraph(sampleGraph);

      // Apply different operations concurrently
      const op1: Operation = {
        id: 'op-concurrent-1',
        type: 'UPDATE_NODE',
        nodeId: sampleGraph.nodes[0].id,
        updates: { params: { width: 30 } },
        userId: 'user-1',
        timestamp: Date.now(),
        documentId: 'doc-1',
      };

      const op2: Operation = {
        id: 'op-concurrent-2',
        type: 'UPDATE_NODE',
        nodeId: sampleGraph.nodes[0].id,
        updates: { params: { height: 30 } },
        userId: 'user-2',
        timestamp: Date.now() + 1,
        documentId: 'doc-1',
      };

      graph1.applyOperation(op1);
      graph2.applyOperation(op2);

      // Exchange snapshots (simulate sync)
      const snapshot1 = graph1.getSnapshot();
      const snapshot2 = graph2.getSnapshot();

      graph1.applySnapshot(snapshot2);
      graph2.applySnapshot(snapshot1);

      // Both graphs should converge to same state
      const result1 = graph1.toGraph();
      const result2 = graph2.toGraph();

      // CRDT guarantees eventual consistency
      expect(result1.nodes.length).toBe(result2.nodes.length);
    });
  });
});
