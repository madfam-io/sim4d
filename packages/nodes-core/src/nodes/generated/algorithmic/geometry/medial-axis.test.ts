import { describe, it, expect } from 'vitest';
import { AlgorithmicGeometryMedialAxisNode } from './medial-axis.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicGeometryMedialAxisNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      resolution: 0.1,
      pruning: 0.1,
      simplify: true,
    } as any;

    const result = await AlgorithmicGeometryMedialAxisNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
