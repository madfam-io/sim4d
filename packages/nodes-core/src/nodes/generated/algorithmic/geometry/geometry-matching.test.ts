import { describe, it, expect } from 'vitest';
import { AlgorithmicGeometryGeometryMatchingNode } from './geometry-matching.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicGeometryGeometryMatchingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      source: undefined,
      target: undefined,
    } as any;
    const params = {
      algorithm: 'icp',
      tolerance: 0.01,
      iterations: 50,
    } as any;

    const result = await AlgorithmicGeometryGeometryMatchingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
