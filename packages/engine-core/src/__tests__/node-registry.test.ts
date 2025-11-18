/**
 * Node Registry Tests
 * Comprehensive tests for node type registration and discovery
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NodeRegistry } from '../node-registry';
import type { NodeDefinition } from '@brepflow/types';

describe('NodeRegistry', () => {
  let registry: NodeRegistry;

  beforeEach(() => {
    registry = NodeRegistry.getInstance();
    // Clear registry before each test to ensure isolation
    registry.clear();
  });

  afterEach(() => {
    // Clean up after each test
    registry.clear();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = NodeRegistry.getInstance();
      const instance2 = NodeRegistry.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should maintain state across getInstance calls', () => {
      const instance1 = NodeRegistry.getInstance();

      const testNode: NodeDefinition = {
        id: 'Test::Node',
        label: 'Test Node',
        category: 'Test',
        description: 'A test node',
        inputs: {},
        outputs: {},
        params: {},
        evaluate: async () => ({}),
      };

      instance1.registerNode(testNode);

      const instance2 = NodeRegistry.getInstance();
      expect(instance2.hasNode('Test::Node')).toBe(true);
    });
  });

  describe('Node Registration', () => {
    it('should register a single node definition', () => {
      const nodeDefinition: NodeDefinition = {
        id: 'Math::Add',
        label: 'Add',
        category: 'Math',
        description: 'Add two numbers',
        inputs: {
          a: { type: 'number', label: 'A' },
          b: { type: 'number', label: 'B' },
        },
        outputs: {
          result: { type: 'number', label: 'Result' },
        },
        params: {},
        evaluate: async (ctx, inputs) => ({
          result: inputs.a + inputs.b,
        }),
      };

      registry.registerNode(nodeDefinition);

      expect(registry.hasNode('Math::Add')).toBe(true);
      expect(registry.getNode('Math::Add')).toEqual(nodeDefinition);
    });

    it('should register multiple node definitions at once', () => {
      const nodes: NodeDefinition[] = [
        {
          id: 'Math::Add',
          label: 'Add',
          category: 'Math',
          description: 'Add numbers',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
        {
          id: 'Math::Subtract',
          label: 'Subtract',
          category: 'Math',
          description: 'Subtract numbers',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
        {
          id: 'Geometry::Box',
          label: 'Box',
          category: 'Geometry',
          description: 'Create a box',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
      ];

      registry.registerNodes(nodes);

      expect(registry.hasNode('Math::Add')).toBe(true);
      expect(registry.hasNode('Math::Subtract')).toBe(true);
      expect(registry.hasNode('Geometry::Box')).toBe(true);
    });

    it('should overwrite existing node definition when re-registered', () => {
      const original: NodeDefinition = {
        id: 'Test::Node',
        label: 'Original',
        category: 'Test',
        description: 'Original description',
        inputs: {},
        outputs: {},
        params: {},
        evaluate: async () => ({}),
      };

      const updated: NodeDefinition = {
        id: 'Test::Node',
        label: 'Updated',
        category: 'Test',
        description: 'Updated description',
        inputs: {},
        outputs: {},
        params: {},
        evaluate: async () => ({ updated: true }),
      };

      registry.registerNode(original);
      expect(registry.getNode('Test::Node')?.label).toBe('Original');

      registry.registerNode(updated);
      expect(registry.getNode('Test::Node')?.label).toBe('Updated');
    });
  });

  describe('Node Retrieval', () => {
    beforeEach(() => {
      const testNodes: NodeDefinition[] = [
        {
          id: 'Math::Add',
          label: 'Add',
          category: 'Math',
          description: 'Add',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
        {
          id: 'Math::Multiply',
          label: 'Multiply',
          category: 'Math',
          description: 'Multiply',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
        {
          id: 'Geometry::Box',
          label: 'Box',
          category: 'Geometry',
          description: 'Box',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
        {
          id: 'Geometry::Sphere',
          label: 'Sphere',
          category: 'Geometry',
          description: 'Sphere',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
      ];

      registry.registerNodes(testNodes);
    });

    it('should retrieve a node definition by type', () => {
      const node = registry.getNode('Math::Add');

      expect(node).toBeDefined();
      expect(node?.id).toBe('Math::Add');
      expect(node?.label).toBe('Add');
      expect(node?.category).toBe('Math');
    });

    it('should return undefined for non-existent node type', () => {
      const node = registry.getNode('NonExistent::Node');

      expect(node).toBeUndefined();
    });

    it('should get all registered node types', () => {
      const types = registry.getAllNodeTypes();

      expect(types).toHaveLength(4);
      expect(types).toContain('Math::Add');
      expect(types).toContain('Math::Multiply');
      expect(types).toContain('Geometry::Box');
      expect(types).toContain('Geometry::Sphere');
    });

    it('should get all node definitions as a record', () => {
      const allDefs = registry.getAllDefinitions();

      expect(Object.keys(allDefs)).toHaveLength(4);
      expect(allDefs['Math::Add']).toBeDefined();
      expect(allDefs['Math::Add'].label).toBe('Add');
      expect(allDefs['Geometry::Box']).toBeDefined();
      expect(allDefs['Geometry::Box'].label).toBe('Box');
    });
  });

  describe('Category Management', () => {
    beforeEach(() => {
      const testNodes: NodeDefinition[] = [
        {
          id: 'Math::Add',
          label: 'Add',
          category: 'Math',
          description: 'Add',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
        {
          id: 'Math::Multiply',
          label: 'Multiply',
          category: 'Math',
          description: 'Multiply',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
        {
          id: 'Geometry::Box',
          label: 'Box',
          category: 'Geometry',
          description: 'Box',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
        {
          id: 'Data::Constant',
          label: 'Constant',
          category: 'Data',
          description: 'Constant value',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
      ];

      registry.registerNodes(testNodes);
    });

    it('should get all categories', () => {
      const categories = registry.getCategories();

      expect(categories).toHaveLength(3);
      expect(categories).toContain('Math');
      expect(categories).toContain('Geometry');
      expect(categories).toContain('Data');
    });

    it('should get nodes by category', () => {
      const mathNodes = registry.getNodesByCategory('Math');

      expect(mathNodes).toHaveLength(2);
      expect(mathNodes.map((n) => n.id)).toContain('Math::Add');
      expect(mathNodes.map((n) => n.id)).toContain('Math::Multiply');
    });

    it('should return empty array for non-existent category', () => {
      const nodes = registry.getNodesByCategory('NonExistent');

      expect(nodes).toEqual([]);
    });

    it('should update category index when node is re-registered', () => {
      const originalNode: NodeDefinition = {
        id: 'Test::Node',
        label: 'Test',
        category: 'Category1',
        description: 'Test',
        inputs: {},
        outputs: {},
        params: {},
        evaluate: async () => ({}),
      };

      const updatedNode: NodeDefinition = {
        id: 'Test::Node',
        label: 'Test',
        category: 'Category2',
        description: 'Test',
        inputs: {},
        outputs: {},
        params: {},
        evaluate: async () => ({}),
      };

      registry.registerNode(originalNode);
      expect(registry.getNodesByCategory('Category1')).toHaveLength(1);
      expect(registry.getNodesByCategory('Category2')).toHaveLength(0);

      registry.registerNode(updatedNode);
      expect(registry.getNodesByCategory('Category1')).toHaveLength(1); // Still has the old reference
      expect(registry.getNodesByCategory('Category2')).toHaveLength(1); // Now has new reference
    });
  });

  describe('Node Existence Check', () => {
    it('should return true for registered node', () => {
      const node: NodeDefinition = {
        id: 'Test::Node',
        label: 'Test',
        category: 'Test',
        description: 'Test',
        inputs: {},
        outputs: {},
        params: {},
        evaluate: async () => ({}),
      };

      registry.registerNode(node);

      expect(registry.hasNode('Test::Node')).toBe(true);
    });

    it('should return false for non-registered node', () => {
      expect(registry.hasNode('NonExistent::Node')).toBe(false);
    });
  });

  describe('Registry Clearing', () => {
    it('should clear all nodes and categories', () => {
      const nodes: NodeDefinition[] = [
        {
          id: 'Math::Add',
          label: 'Add',
          category: 'Math',
          description: 'Add',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
        {
          id: 'Geometry::Box',
          label: 'Box',
          category: 'Geometry',
          description: 'Box',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
      ];

      registry.registerNodes(nodes);
      expect(registry.getAllNodeTypes()).toHaveLength(2);
      expect(registry.getCategories()).toHaveLength(2);

      registry.clear();

      expect(registry.getAllNodeTypes()).toHaveLength(0);
      expect(registry.getCategories()).toHaveLength(0);
      expect(registry.hasNode('Math::Add')).toBe(false);
    });

    it('should allow re-registration after clearing', () => {
      const node: NodeDefinition = {
        id: 'Test::Node',
        label: 'Test',
        category: 'Test',
        description: 'Test',
        inputs: {},
        outputs: {},
        params: {},
        evaluate: async () => ({}),
      };

      registry.registerNode(node);
      expect(registry.hasNode('Test::Node')).toBe(true);

      registry.clear();
      expect(registry.hasNode('Test::Node')).toBe(false);

      registry.registerNode(node);
      expect(registry.hasNode('Test::Node')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty node registration', () => {
      registry.registerNodes([]);

      expect(registry.getAllNodeTypes()).toHaveLength(0);
      expect(registry.getCategories()).toHaveLength(0);
    });

    it('should handle nodes with same category', () => {
      const nodes: NodeDefinition[] = [
        {
          id: 'Math::Add',
          label: 'Add',
          category: 'Math',
          description: 'Add',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
        {
          id: 'Math::Subtract',
          label: 'Subtract',
          category: 'Math',
          description: 'Subtract',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
        {
          id: 'Math::Multiply',
          label: 'Multiply',
          category: 'Math',
          description: 'Multiply',
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        },
      ];

      registry.registerNodes(nodes);

      expect(registry.getCategories()).toHaveLength(1);
      expect(registry.getNodesByCategory('Math')).toHaveLength(3);
    });

    it('should handle special characters in node IDs', () => {
      const node: NodeDefinition = {
        id: 'Special::Node-With_Characters.123',
        label: 'Special',
        category: 'Special',
        description: 'Special',
        inputs: {},
        outputs: {},
        params: {},
        evaluate: async () => ({}),
      };

      registry.registerNode(node);

      expect(registry.hasNode('Special::Node-With_Characters.123')).toBe(true);
      expect(registry.getNode('Special::Node-With_Characters.123')).toEqual(node);
    });

    it('should preserve node definition reference', () => {
      const node: NodeDefinition = {
        id: 'Test::Node',
        label: 'Test',
        category: 'Test',
        description: 'Test',
        inputs: {},
        outputs: {},
        params: {},
        evaluate: async () => ({}),
      };

      registry.registerNode(node);
      const retrieved = registry.getNode('Test::Node');

      expect(retrieved).toBe(node); // Same reference
    });
  });

  describe('Category Index Integrity', () => {
    it('should maintain category index when registering multiple nodes', () => {
      const nodes: NodeDefinition[] = [];

      // Create 100 math nodes
      for (let i = 0; i < 100; i++) {
        nodes.push({
          id: `Math::Op${i}`,
          label: `Op${i}`,
          category: 'Math',
          description: `Operation ${i}`,
          inputs: {},
          outputs: {},
          params: {},
          evaluate: async () => ({}),
        });
      }

      registry.registerNodes(nodes);

      const mathNodes = registry.getNodesByCategory('Math');
      expect(mathNodes).toHaveLength(100);
      expect(registry.getCategories()).toHaveLength(1);
    });

    it('should handle multiple categories efficiently', () => {
      const categories = ['Math', 'Geometry', 'Data', 'Logic', 'Transform'];
      const nodes: NodeDefinition[] = [];

      categories.forEach((category) => {
        for (let i = 0; i < 10; i++) {
          nodes.push({
            id: `${category}::Op${i}`,
            label: `Op${i}`,
            category,
            description: `${category} operation ${i}`,
            inputs: {},
            outputs: {},
            params: {},
            evaluate: async () => ({}),
          });
        }
      });

      registry.registerNodes(nodes);

      expect(registry.getCategories()).toHaveLength(5);
      expect(registry.getAllNodeTypes()).toHaveLength(50);

      categories.forEach((category) => {
        expect(registry.getNodesByCategory(category)).toHaveLength(10);
      });
    });
  });
});
