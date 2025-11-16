import { describe, it, expect } from 'vitest';
import { AlgorithmicGeometryVisibilityGraphNode } from './visibility-graph.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicGeometryVisibilityGraphNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      obstacles: undefined,
      start: undefined,
      goal: undefined,
    } as any;
    const params = {
      epsilon: 0.01,
      includeInterior: false,
    } as any;

    const result = await AlgorithmicGeometryVisibilityGraphNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
