import { describe, it, expect } from 'vitest';
import { PatternsStochasticPoissonDiskNode } from './poisson-disk.node';
import { createTestContext } from '../test-utils';

describe('PatternsStochasticPoissonDiskNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      boundary: undefined,
    } as any;
    const params = {
      radius: 5,
      k: 30,
    } as any;

    const result = await PatternsStochasticPoissonDiskNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
