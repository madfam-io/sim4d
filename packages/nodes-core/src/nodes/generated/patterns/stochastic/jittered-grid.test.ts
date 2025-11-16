import { describe, it, expect } from 'vitest';
import { PatternsStochasticJitteredGridNode } from './jittered-grid.node';
import { createTestContext } from '../test-utils';

describe('PatternsStochasticJitteredGridNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      boundary: undefined,
    } as any;
    const params = {
      gridSize: 10,
      jitter: 0.5,
    } as any;

    const result = await PatternsStochasticJitteredGridNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
