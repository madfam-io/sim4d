import { describe, it, expect } from 'vitest';
import { convertToReactFlow, convertFromReactFlow } from './graph-converter';
import type { GraphInstance, NodeInstance, Edge } from '@brepflow/types';

describe('graph-converter', () => {
  const createMockGraph = (): GraphInstance => ({
    version: '0.1.0',
    units: 'mm',
    tolerance: 0.001,
    nodes: [
      {
        id: 'node1',
        type: 'Solid::Box',
        position: { x: 100, y: 200 },
        inputs: {},
        params: { width: 10, height: 20, depth: 30 },
        outputs: {},
        // Don't include onOpenParameterDialog property in mock nodes
      } as NodeInstance,
      {
        id: 'node2',
        type: 'Features::Fillet',
        position: { x: 300, y: 400 },
        inputs: {},
        params: { radius: 5 },
        outputs: {},
      } as NodeInstance,
      {
        id: 'node3',
        type: 'IO::Import::STEP',
        position: { x: 0, y: 0 },
        inputs: {},
        params: {},
        outputs: {},
      } as NodeInstance,
      {
        id: 'node4',
        type: 'IO::Export::STL',
        position: { x: 500, y: 600 },
        inputs: {},
        params: {},
        outputs: {},
      } as NodeInstance,
    ],
    edges: [
      {
        id: 'edge1',
        source: 'node1',
        sourceHandle: 'out',
        target: 'node2',
        targetHandle: 'in',
      },
      {
        id: 'edge2',
        source: 'node2',
        sourceHandle: 'result',
        target: 'node4',
        targetHandle: 'geometry',
      },
    ],
  });

  describe('convertToReactFlow', () => {
    it('converts basic graph to ReactFlow format', () => {
      const graph = createMockGraph();
      const result = convertToReactFlow(graph);

      expect(result.nodes).toHaveLength(4);
      expect(result.edges).toHaveLength(2);
    });

    it('converts nodes with correct positions and data', () => {
      const graph = createMockGraph();
      const result = convertToReactFlow(graph);

      const node1 = result.nodes.find((n) => n.id === 'node1');
      expect(node1).toBeDefined();
      expect(node1?.position).toEqual({ x: 100, y: 200 });
      expect(node1?.data.type).toBe('Solid::Box');
      expect(node1?.data.nodeData).toEqual(graph.nodes[0]);
    });

    it('handles nodes with missing positions', () => {
      const graph: GraphInstance = {
        ...createMockGraph(),
        nodes: [
          {
            id: 'node1',
            type: 'Test',
            inputs: {},
            params: {},
            outputs: {},
            // No position property
          } as NodeInstance,
        ],
      };

      const result = convertToReactFlow(graph);
      expect(result.nodes[0].position).toEqual({ x: 0, y: 0 });
    });

    it('maps node types to ReactFlow types correctly', () => {
      const graph = createMockGraph();
      const result = convertToReactFlow(graph);

      const importNode = result.nodes.find((n) => n.id === 'node3');
      const exportNode = result.nodes.find((n) => n.id === 'node4');
      const defaultNode = result.nodes.find((n) => n.id === 'node1');

      expect(importNode?.type).toBe('input');
      expect(exportNode?.type).toBe('output');
      expect(defaultNode?.type).toBe('default');
    });

    it('generates correct node labels', () => {
      const graph = createMockGraph();
      const result = convertToReactFlow(graph);

      const boxNode = result.nodes.find((n) => n.id === 'node1');
      const filletNode = result.nodes.find((n) => n.id === 'node2');
      const importNode = result.nodes.find((n) => n.id === 'node3');

      expect(boxNode?.data.label).toBe('Box (10×20×30)');
      expect(filletNode?.data.label).toBe('Fillet (R5)');
      expect(importNode?.data.label).toBe('STEP');
    });

    it('handles selectedNodes parameter', () => {
      const graph = createMockGraph();
      const selectedNodes = new Set(['node1', 'node3']);
      const result = convertToReactFlow(graph, selectedNodes);

      const node1 = result.nodes.find((n) => n.id === 'node1');
      const node2 = result.nodes.find((n) => n.id === 'node2');
      const node3 = result.nodes.find((n) => n.id === 'node3');

      expect(node1?.data.isSelected).toBe(true);
      expect(node2?.data.isSelected).toBe(false);
      expect(node3?.data.isSelected).toBe(true);
    });

    it('handles errors parameter', () => {
      const graph = createMockGraph();
      const errors = new Map([
        ['node1', 'Test error'],
        ['node2', 'Another error'],
      ]);
      const result = convertToReactFlow(graph, undefined, errors);

      const node1 = result.nodes.find((n) => n.id === 'node1');
      const node2 = result.nodes.find((n) => n.id === 'node2');
      const node3 = result.nodes.find((n) => n.id === 'node3');

      expect(node1?.data.hasError).toBe(true);
      expect(node2?.data.hasError).toBe(true);
      expect(node3?.data.hasError).toBe(false);
    });

    it('handles executing state', () => {
      const graph: GraphInstance = {
        ...createMockGraph(),
        nodes: [
          {
            ...createMockGraph().nodes[0],
            state: 'executing' as any,
          },
        ],
      };

      const result = convertToReactFlow(graph);
      expect(result.nodes[0].data.isExecuting).toBe(true);
    });

    it('converts edges with correct properties', () => {
      const graph = createMockGraph();
      const result = convertToReactFlow(graph);

      const edge1 = result.edges.find((e) => e.id === 'edge1');
      expect(edge1).toBeDefined();
      expect(edge1?.source).toBe('node1');
      expect(edge1?.sourceHandle).toBe('out');
      expect(edge1?.target).toBe('node2');
      expect(edge1?.targetHandle).toBe('in');
      expect(edge1?.type).toBe('smoothstep');
      expect(edge1?.animated).toBe(true);
      expect(edge1?.style?.stroke).toBe('var(--color-primary-500)');
      expect(edge1?.markerEnd?.type).toBe('arrow');
    });

    it('accepts optional onOpenParameterDialog callback parameter', () => {
      const graph = createMockGraph();
      const mockCallback = () => {};

      // Should not throw when callback provided
      expect(() => convertToReactFlow(graph, undefined, undefined, mockCallback)).not.toThrow();

      // Should not throw when callback not provided
      expect(() => convertToReactFlow(graph)).not.toThrow();

      // Both should return same number of nodes
      const resultWithCallback = convertToReactFlow(graph, undefined, undefined, mockCallback);
      const resultWithoutCallback = convertToReactFlow(graph);
      expect(resultWithCallback.nodes).toHaveLength(resultWithoutCallback.nodes.length);
    });
  });

  describe('convertFromReactFlow', () => {
    it('converts ReactFlow format back to BrepFlow graph', () => {
      const nodes = [
        {
          id: 'node1',
          type: 'default',
          position: { x: 100, y: 200 },
          data: {
            type: 'Solid::Box',
            inputs: { input1: 'value1' },
            params: { width: 10 },
            outputs: { output1: 'result1' },
            state: 'ready',
            dirty: false,
          },
        },
        {
          id: 'node2',
          type: 'input',
          position: { x: 0, y: 0 },
          data: {
            type: 'IO::Import',
            inputs: {},
            params: {},
          },
        },
      ];

      const edges = [
        {
          id: 'edge1',
          source: 'node1',
          sourceHandle: 'out',
          target: 'node2',
          targetHandle: 'in',
          type: 'smoothstep',
        },
        {
          id: 'edge2',
          source: 'node2',
          target: 'node1',
          type: 'default',
        },
      ];

      const result = convertFromReactFlow(nodes, edges);

      expect(result.version).toBe('0.1.0');
      expect(result.units).toBe('mm');
      expect(result.tolerance).toBe(0.001);
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(2);

      const node1 = result.nodes.find((n) => n.id === 'node1');
      expect(node1?.type).toBe('Solid::Box');
      expect(node1?.position).toEqual({ x: 100, y: 200 });
      expect(node1?.inputs).toEqual({ input1: 'value1' });
      expect(node1?.params).toEqual({ width: 10 });
      expect(node1?.outputs).toEqual({ output1: 'result1' });
      expect(node1?.state).toBe('ready');
      expect(node1?.dirty).toBe(false);

      const edge1 = result.edges.find((e) => e.id === 'edge1');
      expect(edge1?.source).toBe('node1');
      expect(edge1?.sourceHandle).toBe('out');
      expect(edge1?.target).toBe('node2');
      expect(edge1?.targetHandle).toBe('in');

      const edge2 = result.edges.find((e) => e.id === 'edge2');
      expect(edge2?.sourceHandle).toBe('');
      expect(edge2?.targetHandle).toBe('');
    });

    it('handles nodes with missing data properties', () => {
      const nodes = [
        {
          id: 'node1',
          type: 'custom',
          position: { x: 50, y: 100 },
          data: {},
        },
        {
          id: 'node2',
          type: 'default',
          position: { x: 200, y: 300 },
          // No data property
        },
      ];

      const result = convertFromReactFlow(nodes, []);

      expect(result.nodes).toHaveLength(2);

      const node1 = result.nodes.find((n) => n.id === 'node1');
      expect(node1?.type).toBe('custom'); // Uses node.type when data.type is missing
      expect(node1?.inputs).toEqual({});
      expect(node1?.params).toEqual({});

      const node2 = result.nodes.find((n) => n.id === 'node2');
      expect(node2?.type).toBe('default'); // Uses node.type when data is missing
      expect(node2?.inputs).toEqual({});
      expect(node2?.params).toEqual({});
    });

    it('handles edges with missing handles', () => {
      const edges = [
        {
          id: 'edge1',
          source: 'node1',
          target: 'node2',
        },
      ];

      const result = convertFromReactFlow([], edges);

      const edge = result.edges[0];
      expect(edge.sourceHandle).toBe('');
      expect(edge.targetHandle).toBe('');
    });
  });

  describe('node type mapping', () => {
    it('correctly identifies import nodes', () => {
      const graph: GraphInstance = {
        ...createMockGraph(),
        nodes: [
          {
            id: '1',
            type: 'IO::Import::STEP',
            position: { x: 0, y: 0 },
            inputs: {},
            params: {},
            outputs: {},
          },
          {
            id: '2',
            type: 'IO::Import::IGES',
            position: { x: 0, y: 0 },
            inputs: {},
            params: {},
            outputs: {},
          },
          {
            id: '3',
            type: 'IO::Import::STL',
            position: { x: 0, y: 0 },
            inputs: {},
            params: {},
            outputs: {},
          },
        ],
      };

      const result = convertToReactFlow(graph);
      expect(result.nodes.every((n) => n.type === 'input')).toBe(true);
    });

    it('correctly identifies export nodes', () => {
      const graph: GraphInstance = {
        ...createMockGraph(),
        nodes: [
          {
            id: '1',
            type: 'IO::Export::STEP',
            position: { x: 0, y: 0 },
            inputs: {},
            params: {},
            outputs: {},
          },
          {
            id: '2',
            type: 'IO::Export::STL',
            position: { x: 0, y: 0 },
            inputs: {},
            params: {},
            outputs: {},
          },
          {
            id: '3',
            type: 'IO::Export::IGES',
            position: { x: 0, y: 0 },
            inputs: {},
            params: {},
            outputs: {},
          },
        ],
      };

      const result = convertToReactFlow(graph);
      expect(result.nodes.every((n) => n.type === 'output')).toBe(true);
    });

    it('defaults to default type for other nodes', () => {
      const graph: GraphInstance = {
        ...createMockGraph(),
        nodes: [
          {
            id: '1',
            type: 'Solid::Box',
            position: { x: 0, y: 0 },
            inputs: {},
            params: {},
            outputs: {},
          },
          {
            id: '2',
            type: 'Features::Fillet',
            position: { x: 0, y: 0 },
            inputs: {},
            params: {},
            outputs: {},
          },
          {
            id: '3',
            type: 'Math::Add',
            position: { x: 0, y: 0 },
            inputs: {},
            params: {},
            outputs: {},
          },
        ],
      };

      const result = convertToReactFlow(graph);
      expect(result.nodes.every((n) => n.type === 'default')).toBe(true);
    });
  });

  describe('node label generation', () => {
    it('generates basic labels from node type', () => {
      const graph: GraphInstance = {
        ...createMockGraph(),
        nodes: [
          {
            id: '1',
            type: 'Solid::Sphere',
            position: { x: 0, y: 0 },
            inputs: {},
            params: {},
            outputs: {},
          },
          {
            id: '2',
            type: 'Features::Chamfer',
            position: { x: 0, y: 0 },
            inputs: {},
            params: {},
            outputs: {},
          },
          {
            id: '3',
            type: 'SingleWord',
            position: { x: 0, y: 0 },
            inputs: {},
            params: {},
            outputs: {},
          },
        ],
      };

      const result = convertToReactFlow(graph);
      expect(result.nodes.find((n) => n.id === '1')?.data.label).toBe('Sphere');
      expect(result.nodes.find((n) => n.id === '2')?.data.label).toBe('Chamfer');
      expect(result.nodes.find((n) => n.id === '3')?.data.label).toBe('SingleWord');
    });

    it('handles Box nodes with dimension parameters', () => {
      const graph: GraphInstance = {
        ...createMockGraph(),
        nodes: [
          {
            id: '1',
            type: 'Solid::Box',
            position: { x: 0, y: 0 },
            inputs: {},
            params: { width: 5, height: 10, depth: 15 },
            outputs: {},
          },
          {
            id: '2',
            type: 'Solid::Box',
            position: { x: 0, y: 0 },
            inputs: {},
            params: { width: 100 },
            outputs: {},
          },
          {
            id: '3',
            type: 'Solid::Box',
            position: { x: 0, y: 0 },
            inputs: {},
            params: {},
            outputs: {},
          },
        ],
      };

      const result = convertToReactFlow(graph);
      expect(result.nodes.find((n) => n.id === '1')?.data.label).toBe('Box (5×10×15)');
      expect(result.nodes.find((n) => n.id === '2')?.data.label).toBe('Box');
      expect(result.nodes.find((n) => n.id === '3')?.data.label).toBe('Box');
    });

    it('handles Fillet nodes with radius parameter', () => {
      const graph: GraphInstance = {
        ...createMockGraph(),
        nodes: [
          {
            id: '1',
            type: 'Features::Fillet',
            position: { x: 0, y: 0 },
            inputs: {},
            params: { radius: 2.5 },
            outputs: {},
          },
          {
            id: '2',
            type: 'Features::Fillet',
            position: { x: 0, y: 0 },
            inputs: {},
            params: {},
            outputs: {},
          },
        ],
      };

      const result = convertToReactFlow(graph);
      expect(result.nodes.find((n) => n.id === '1')?.data.label).toBe('Fillet (R2.5)');
      expect(result.nodes.find((n) => n.id === '2')?.data.label).toBe('Fillet');
    });

    it('returns Unknown for empty type', () => {
      const graph: GraphInstance = {
        ...createMockGraph(),
        nodes: [
          { id: '1', type: '', position: { x: 0, y: 0 }, inputs: {}, params: {}, outputs: {} },
        ],
      };

      const result = convertToReactFlow(graph);
      expect(result.nodes[0].data.label).toBe('Unknown');
    });
  });
});
