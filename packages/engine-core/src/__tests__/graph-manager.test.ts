/**
 * Graph Manager Tests
 * Comprehensive tests for graph CRUD operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GraphManager } from '../graph-manager';
import type { GraphInstance, NodeInstance, Edge, NodeId } from '@brepflow/types';
import { createNodeId, createEdgeId } from '@brepflow/types';

describe('GraphManager', () => {
  let manager: GraphManager;

  beforeEach(() => {
    manager = new GraphManager();
  });

  describe('Initialization', () => {
    it('should create an empty graph by default', () => {
      const graph = manager.getGraph();

      expect(graph).toBeDefined();
      expect(graph.version).toBe('0.1.0');
      expect(graph.units).toBe('mm');
      expect(graph.tolerance).toBe(0.001);
      expect(graph.nodes).toEqual([]);
      expect(graph.edges).toEqual([]);
      expect(graph.metadata).toBeDefined();
      expect(graph.metadata.created).toBeDefined();
    });

    it('should accept an initial graph', () => {
      const initialGraph: GraphInstance = {
        version: '0.2.0',
        units: 'cm',
        tolerance: 0.01,
        nodes: [],
        edges: [],
        metadata: {
          created: '2024-01-01T00:00:00.000Z',
          name: 'Test Graph',
        },
      };

      const customManager = new GraphManager(initialGraph);
      const graph = customManager.getGraph();

      expect(graph.version).toBe('0.2.0');
      expect(graph.units).toBe('cm');
      expect(graph.tolerance).toBe(0.01);
      expect(graph.metadata.name).toBe('Test Graph');
    });
  });

  describe('Node Management', () => {
    it('should add a node to the graph', () => {
      const nodeData = {
        type: 'Math::Add',
        params: { value: 5 },
        inputs: {},
        outputs: {},
      };

      const node = manager.addNode(nodeData);

      expect(node.id).toBeDefined();
      expect(node.type).toBe('Math::Add');
      expect(node.params).toEqual({ value: 5 });
      expect(node.dirty).toBe(true);

      const graph = manager.getGraph();
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0]).toBe(node);
    });

    it('should generate unique IDs for new nodes', () => {
      const node1 = manager.addNode({ type: 'Test::Node1', params: {}, inputs: {}, outputs: {} });
      const node2 = manager.addNode({ type: 'Test::Node2', params: {}, inputs: {}, outputs: {} });

      expect(node1.id).not.toBe(node2.id);
    });

    it('should remove a node from the graph', () => {
      const node = manager.addNode({ type: 'Test::Node', params: {}, inputs: {}, outputs: {} });

      expect(manager.getGraph().nodes).toHaveLength(1);

      manager.removeNode(node.id);

      expect(manager.getGraph().nodes).toHaveLength(0);
    });

    it('should remove connected edges when removing a node', () => {
      const node1 = manager.addNode({ type: 'Test::Node1', params: {}, inputs: {}, outputs: {} });
      const node2 = manager.addNode({ type: 'Test::Node2', params: {}, inputs: {}, outputs: {} });
      const node3 = manager.addNode({ type: 'Test::Node3', params: {}, inputs: {}, outputs: {} });

      manager.addEdge({
        source: node1.id,
        sourceHandle: 'out',
        target: node2.id,
        targetHandle: 'in',
      });

      manager.addEdge({
        source: node2.id,
        sourceHandle: 'out',
        target: node3.id,
        targetHandle: 'in',
      });

      expect(manager.getGraph().edges).toHaveLength(2);

      manager.removeNode(node2.id);

      // Both edges connected to node2 should be removed
      expect(manager.getGraph().edges).toHaveLength(0);
      expect(manager.getGraph().nodes).toHaveLength(2);
    });

    it('should update node properties', () => {
      const node = manager.addNode({
        type: 'Math::Add',
        params: { value: 5 },
        inputs: {},
        outputs: {},
      });

      manager.updateNode(node.id, { params: { value: 10 } });

      const updated = manager.getGraph().nodes[0];
      expect(updated.params.value).toBe(10);
      expect(updated.dirty).toBe(true);
    });

    it('should mark node as dirty when updated', () => {
      const node = manager.addNode({
        type: 'Test::Node',
        params: {},
        inputs: {},
        outputs: {},
      });

      // Clear dirty flag using clearDirtyFlags
      manager.clearDirtyFlags();
      expect(manager.getGraph().nodes[0].dirty).toBe(false);

      // Update should mark as dirty again
      manager.updateNode(node.id, { params: { value: 123 } });
      expect(manager.getGraph().nodes[0].dirty).toBe(true);
    });

    it('should handle updating non-existent node gracefully', () => {
      const fakeId = createNodeId('non-existent');

      expect(() => {
        manager.updateNode(fakeId, { params: { value: 10 } });
      }).not.toThrow();

      expect(manager.getGraph().nodes).toHaveLength(0);
    });
  });

  describe('Edge Management', () => {
    let sourceNode: NodeInstance;
    let targetNode: NodeInstance;

    beforeEach(() => {
      sourceNode = manager.addNode({
        type: 'Test::Source',
        params: {},
        inputs: {},
        outputs: { out: null },
      });
      targetNode = manager.addNode({
        type: 'Test::Target',
        params: {},
        inputs: {},
        outputs: {},
      });
    });

    it('should add an edge to the graph', () => {
      const edgeData = {
        source: sourceNode.id,
        sourceHandle: 'out',
        target: targetNode.id,
        targetHandle: 'in',
      };

      const edge = manager.addEdge(edgeData);

      expect(edge.id).toBeDefined();
      expect(edge.source).toBe(sourceNode.id);
      expect(edge.target).toBe(targetNode.id);
      expect(edge.sourceHandle).toBe('out');
      expect(edge.targetHandle).toBe('in');

      const graph = manager.getGraph();
      expect(graph.edges).toHaveLength(1);
    });

    it('should generate unique IDs for new edges', () => {
      const edge1 = manager.addEdge({
        source: sourceNode.id,
        sourceHandle: 'out1',
        target: targetNode.id,
        targetHandle: 'in1',
      });

      const edge2 = manager.addEdge({
        source: sourceNode.id,
        sourceHandle: 'out2',
        target: targetNode.id,
        targetHandle: 'in2',
      });

      expect(edge1.id).not.toBe(edge2.id);
    });

    it('should remove an edge from the graph', () => {
      const edge = manager.addEdge({
        source: sourceNode.id,
        sourceHandle: 'out',
        target: targetNode.id,
        targetHandle: 'in',
      });

      expect(manager.getGraph().edges).toHaveLength(1);

      manager.removeEdge(edge.id);

      expect(manager.getGraph().edges).toHaveLength(0);
    });

    it('should handle removing non-existent edge gracefully', () => {
      const fakeId = createEdgeId('non-existent');

      expect(() => {
        manager.removeEdge(fakeId);
      }).not.toThrow();
    });
  });

  describe('Graph Operations', () => {
    it('should replace entire graph', () => {
      // Add some nodes to initial graph
      manager.addNode({ type: 'Test::Node1', params: {}, inputs: {}, outputs: {} });
      manager.addNode({ type: 'Test::Node2', params: {}, inputs: {}, outputs: {} });

      expect(manager.getGraph().nodes).toHaveLength(2);

      // Replace with new graph
      const newGraph: GraphInstance = {
        version: '0.2.0',
        units: 'in',
        tolerance: 0.001,
        nodes: [
          {
            id: createNodeId('new-node-1'),
            type: 'New::Node',
            params: {},
            inputs: {},
            outputs: {},
            dirty: true,
          },
        ],
        edges: [],
        metadata: { created: new Date().toISOString() },
      };

      manager.setGraph(newGraph);

      const graph = manager.getGraph();
      expect(graph.version).toBe('0.2.0');
      expect(graph.units).toBe('in');
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0].type).toBe('New::Node');
    });

    it('should clear all nodes and edges', () => {
      manager.addNode({ type: 'Test::Node1', params: {}, inputs: {}, outputs: {} });
      manager.addNode({ type: 'Test::Node2', params: {}, inputs: {}, outputs: {} });

      const emptyGraph: GraphInstance = {
        version: '0.1.0',
        units: 'mm',
        tolerance: 0.001,
        nodes: [],
        edges: [],
        metadata: { created: new Date().toISOString() },
      };

      manager.setGraph(emptyGraph);

      expect(manager.getGraph().nodes).toHaveLength(0);
      expect(manager.getGraph().edges).toHaveLength(0);
    });
  });

  describe('Change Notifications', () => {
    it('should notify listeners when nodes are added', () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      manager.addNode({ type: 'Test::Node', params: {}, inputs: {}, outputs: {} });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(manager.getGraph());
    });

    it('should notify listeners when nodes are removed', () => {
      const node = manager.addNode({ type: 'Test::Node', params: {}, inputs: {}, outputs: {} });

      const listener = vi.fn();
      manager.subscribe(listener);

      manager.removeNode(node.id);

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should notify listeners when nodes are updated', () => {
      const node = manager.addNode({
        type: 'Test::Node',
        params: { value: 5 },
        inputs: {},
        outputs: {},
      });

      const listener = vi.fn();
      manager.subscribe(listener);

      manager.updateNode(node.id, { params: { value: 10 } });

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should notify listeners when graph is replaced', () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      const newGraph: GraphInstance = {
        version: '0.1.0',
        units: 'mm',
        tolerance: 0.001,
        nodes: [],
        edges: [],
        metadata: { created: new Date().toISOString() },
      };

      manager.setGraph(newGraph);

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should allow multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      manager.subscribe(listener1);
      manager.subscribe(listener2);
      manager.subscribe(listener3);

      manager.addNode({ type: 'Test::Node', params: {}, inputs: {}, outputs: {} });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener3).toHaveBeenCalledTimes(1);
    });

    it('should allow unsubscribing listeners', () => {
      const listener = vi.fn();
      const unsubscribe = manager.subscribe(listener);

      manager.addNode({ type: 'Test::Node1', params: {}, inputs: {}, outputs: {} });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      manager.addNode({ type: 'Test::Node2', params: {}, inputs: {}, outputs: {} });
      expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('Dirty Propagation', () => {
    it('should mark downstream nodes as dirty when source node updates', () => {
      const node1 = manager.addNode({
        type: 'Math::Add',
        params: { value: 5 },
        inputs: {},
        outputs: { result: null },
      });

      const node2 = manager.addNode({
        type: 'Math::Multiply',
        params: { factor: 2 },
        inputs: {},
        outputs: { result: null },
      });

      const node3 = manager.addNode({
        type: 'Math::Subtract',
        params: {},
        inputs: {},
        outputs: {},
      });

      // Connect: node1 -> node2 -> node3
      manager.addEdge({
        source: node1.id,
        sourceHandle: 'result',
        target: node2.id,
        targetHandle: 'input',
      });

      manager.addEdge({
        source: node2.id,
        sourceHandle: 'result',
        target: node3.id,
        targetHandle: 'input',
      });

      // Clear dirty flags using clearDirtyFlags
      manager.clearDirtyFlags();

      expect(manager.getGraph().nodes[0].dirty).toBe(false);
      expect(manager.getGraph().nodes[1].dirty).toBe(false);
      expect(manager.getGraph().nodes[2].dirty).toBe(false);

      // Update node1 - should mark node2 and node3 as dirty
      manager.updateNode(node1.id, { params: { value: 10 } });

      const graph = manager.getGraph();
      expect(graph.nodes.find((n) => n.id === node1.id)?.dirty).toBe(true);
      expect(graph.nodes.find((n) => n.id === node2.id)?.dirty).toBe(true);
      expect(graph.nodes.find((n) => n.id === node3.id)?.dirty).toBe(true);
    });
  });

  describe('Graph Validation', () => {
    it('should detect cycles in graph', () => {
      const node1 = manager.addNode({ type: 'Test::Node1', params: {}, inputs: {}, outputs: {} });
      const node2 = manager.addNode({ type: 'Test::Node2', params: {}, inputs: {}, outputs: {} });
      const node3 = manager.addNode({ type: 'Test::Node3', params: {}, inputs: {}, outputs: {} });

      // Create cycle: node1 -> node2 -> node3 -> node1
      manager.addEdge({
        source: node1.id,
        sourceHandle: 'out',
        target: node2.id,
        targetHandle: 'in',
      });

      manager.addEdge({
        source: node2.id,
        sourceHandle: 'out',
        target: node3.id,
        targetHandle: 'in',
      });

      manager.addEdge({
        source: node3.id,
        sourceHandle: 'out',
        target: node1.id,
        targetHandle: 'in',
      });

      const errors = manager.validate();
      expect(errors).toContain('Graph contains cycles');
    });

    it('should validate successfully for acyclic graph', () => {
      const node1 = manager.addNode({ type: 'Test::Node1', params: {}, inputs: {}, outputs: {} });
      const node2 = manager.addNode({ type: 'Test::Node2', params: {}, inputs: {}, outputs: {} });
      const node3 = manager.addNode({ type: 'Test::Node3', params: {}, inputs: {}, outputs: {} });

      // Linear: node1 -> node2 -> node3
      manager.addEdge({
        source: node1.id,
        sourceHandle: 'out',
        target: node2.id,
        targetHandle: 'in',
      });

      manager.addEdge({
        source: node2.id,
        sourceHandle: 'out',
        target: node3.id,
        targetHandle: 'in',
      });

      const errors = manager.validate();
      expect(errors).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle removing node input references', () => {
      const source = manager.addNode({
        type: 'Test::Source',
        params: {},
        inputs: {},
        outputs: { out: null },
      });

      const target = manager.addNode({
        type: 'Test::Target',
        params: {},
        inputs: { in: { nodeId: source.id, socketId: 'out' } },
        outputs: {},
      });

      expect(manager.getGraph().nodes[1].inputs.in).toBeDefined();

      manager.removeNode(source.id);

      const graph = manager.getGraph();
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0].inputs.in).toBeUndefined();
    });

    it('should handle array input references when removing node', () => {
      const source1 = manager.addNode({
        type: 'Test::Source1',
        params: {},
        inputs: {},
        outputs: { out: null },
      });
      const source2 = manager.addNode({
        type: 'Test::Source2',
        params: {},
        inputs: {},
        outputs: { out: null },
      });
      const target = manager.addNode({
        type: 'Test::Target',
        params: {},
        inputs: {
          multiInput: [
            { nodeId: source1.id, socketId: 'out' },
            { nodeId: source2.id, socketId: 'out' },
          ],
        },
        outputs: {},
      });

      manager.removeNode(source1.id);

      const graph = manager.getGraph();
      const targetNode = graph.nodes.find((n) => n.id === target.id);

      expect(targetNode?.inputs.multiInput).toHaveLength(1);
      expect(targetNode?.inputs.multiInput[0].nodeId).toBe(source2.id);
    });
  });

  describe('Utility Methods', () => {
    it('should get dirty nodes', () => {
      const node1 = manager.addNode({ type: 'Test::Node1', params: {}, inputs: {}, outputs: {} });
      const node2 = manager.addNode({ type: 'Test::Node2', params: {}, inputs: {}, outputs: {} });
      const node3 = manager.addNode({ type: 'Test::Node3', params: {}, inputs: {}, outputs: {} });

      // All nodes are dirty by default
      const dirtyNodes = manager.getDirtyNodes();
      expect(dirtyNodes.size).toBe(3);
      expect(dirtyNodes.has(node1.id)).toBe(true);
      expect(dirtyNodes.has(node2.id)).toBe(true);
      expect(dirtyNodes.has(node3.id)).toBe(true);
    });

    it('should clear dirty flags', () => {
      manager.addNode({ type: 'Test::Node1', params: {}, inputs: {}, outputs: {} });
      manager.addNode({ type: 'Test::Node2', params: {}, inputs: {}, outputs: {} });

      expect(manager.getDirtyNodes().size).toBe(2);

      manager.clearDirtyFlags();

      expect(manager.getDirtyNodes().size).toBe(0);
    });

    it('should serialize graph to JSON', () => {
      manager.addNode({ type: 'Test::Node', params: { value: 123 }, inputs: {}, outputs: {} });

      const json = manager.toJSON();
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe('0.1.0');
      expect(parsed.nodes).toHaveLength(1);
      expect(parsed.nodes[0].type).toBe('Test::Node');
      expect(parsed.nodes[0].params.value).toBe(123);
    });

    it('should load graph from JSON', () => {
      const json = JSON.stringify({
        version: '0.2.0',
        units: 'cm',
        tolerance: 0.01,
        nodes: [
          {
            id: createNodeId('test-node'),
            type: 'Loaded::Node',
            params: { value: 456 },
            inputs: {},
            outputs: {},
            dirty: false,
          },
        ],
        edges: [],
        metadata: { created: '2024-01-01T00:00:00.000Z' },
      });

      manager.fromJSON(json);

      const graph = manager.getGraph();
      expect(graph.version).toBe('0.2.0');
      expect(graph.units).toBe('cm');
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0].type).toBe('Loaded::Node');
      expect(graph.nodes[0].params.value).toBe(456);
    });

    it('should notify listeners when loading from JSON', () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      const json = JSON.stringify({
        version: '0.1.0',
        units: 'mm',
        tolerance: 0.001,
        nodes: [],
        edges: [],
        metadata: { created: new Date().toISOString() },
      });

      manager.fromJSON(json);

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Subscription Management', () => {
    it('should return unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = manager.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');

      manager.addNode({ type: 'Test::Node', params: {}, inputs: {}, outputs: {} });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      manager.addNode({ type: 'Test::Node2', params: {}, inputs: {}, outputs: {} });
      expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });
});
