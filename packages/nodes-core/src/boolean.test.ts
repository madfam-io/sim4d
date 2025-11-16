import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnionNode, SubtractNode, IntersectNode } from './boolean';

describe('Boolean Nodes', () => {
  let mockContext: any;

  beforeEach(() => {
    mockContext = {
      worker: {
        invoke: vi.fn(),
      },
    };
  });

  describe('Union Node', () => {
    it('should perform boolean union of multiple shapes', async () => {
      const inputs = {
        shapes: [
          { type: 'Shape', id: 'shape1' },
          { type: 'Shape', id: 'shape2' },
          { type: 'Shape', id: 'shape3' },
        ],
      };
      const params = { simplify: true };
      const expectedResult = { type: 'Shape', id: 'union-result' };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await UnionNode.evaluate(mockContext, inputs, params);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('BOOLEAN_UNION', {
        shapes: inputs.shapes,
        simplify: params.simplify,
      });
      expect(result).toEqual({ shape: expectedResult });
    });

    it('should use default simplify parameter', async () => {
      const inputs = {
        shapes: [
          { type: 'Shape', id: 'shape1' },
          { type: 'Shape', id: 'shape2' },
        ],
      };
      const params = {};

      mockContext.worker.invoke.mockResolvedValue({ type: 'Shape' });

      await UnionNode.evaluate(mockContext, inputs, params);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('BOOLEAN_UNION', {
        shapes: inputs.shapes,
        simplify: undefined,
      });
    });

    it('should throw error with less than 2 shapes', async () => {
      const inputs = { shapes: [{ type: 'Shape', id: 'shape1' }] };
      const params = { simplify: true };

      await expect(UnionNode.evaluate(mockContext, inputs, params)).rejects.toThrow(
        'Union requires at least 2 shapes'
      );
    });

    it('should throw error with no shapes', async () => {
      const inputs = { shapes: [] };
      const params = { simplify: true };

      await expect(UnionNode.evaluate(mockContext, inputs, params)).rejects.toThrow(
        'Union requires at least 2 shapes'
      );
    });

    it('should validate node definition structure', () => {
      expect(UnionNode.id).toBe('Boolean::Union');
      expect(UnionNode.category).toBe('Boolean');
      expect(UnionNode.label).toBe('Union');
      expect(UnionNode.inputs.shapes.multiple).toBe(true);
      expect(UnionNode.params.simplify.default).toBe(true);
    });
  });

  describe('Subtract Node', () => {
    it('should perform boolean subtraction', async () => {
      const inputs = {
        base: { type: 'Shape', id: 'base-shape' },
        tools: [
          { type: 'Shape', id: 'tool1' },
          { type: 'Shape', id: 'tool2' },
        ],
      };
      const params = { simplify: true };
      const expectedResult = { type: 'Shape', id: 'subtract-result' };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await SubtractNode.evaluate(mockContext, inputs, params);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('BOOLEAN_SUBTRACT', {
        base: inputs.base,
        tools: inputs.tools,
        simplify: params.simplify,
      });
      expect(result).toEqual({ shape: expectedResult });
    });

    it('should handle single tool shape', async () => {
      const inputs = {
        base: { type: 'Shape', id: 'base-shape' },
        tools: [{ type: 'Shape', id: 'tool1' }],
      };
      const params = { simplify: false };

      mockContext.worker.invoke.mockResolvedValue({ type: 'Shape' });

      await SubtractNode.evaluate(mockContext, inputs, params);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('BOOLEAN_SUBTRACT', {
        base: inputs.base,
        tools: inputs.tools,
        simplify: false,
      });
    });

    it('should validate node definition structure', () => {
      expect(SubtractNode.id).toBe('Boolean::Subtract');
      expect(SubtractNode.category).toBe('Boolean');
      expect(SubtractNode.label).toBe('Subtract');
      expect(SubtractNode.inputs.base.type).toBe('Shape');
      expect(SubtractNode.inputs.tools.multiple).toBe(true);
    });
  });

  describe('Intersect Node', () => {
    it('should perform boolean intersection', async () => {
      const inputs = {
        shapes: [
          { type: 'Shape', id: 'shape1' },
          { type: 'Shape', id: 'shape2' },
          { type: 'Shape', id: 'shape3' },
        ],
      };
      const params = { simplify: true };
      const expectedResult = { type: 'Shape', id: 'intersect-result' };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await IntersectNode.evaluate(mockContext, inputs, params);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('BOOLEAN_INTERSECT', {
        shapes: inputs.shapes,
        simplify: params.simplify,
      });
      expect(result).toEqual({ shape: expectedResult });
    });

    it('should throw error with less than 2 shapes', async () => {
      const inputs = { shapes: [{ type: 'Shape', id: 'shape1' }] };
      const params = { simplify: true };

      await expect(IntersectNode.evaluate(mockContext, inputs, params)).rejects.toThrow(
        'Intersect requires at least 2 shapes'
      );
    });

    it('should validate node definition structure', () => {
      expect(IntersectNode.id).toBe('Boolean::Intersect');
      expect(IntersectNode.category).toBe('Boolean');
      expect(IntersectNode.label).toBe('Intersect');
      expect(IntersectNode.inputs.shapes.multiple).toBe(true);
      expect(IntersectNode.params.simplify.default).toBe(true);
    });
  });
});
