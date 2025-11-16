import { describe, it, expect } from 'vitest';
import { PatternsGeometricHyperbolicTilingNode } from './hyperbolic-tiling.node';
import { createTestContext } from '../test-utils';

describe('PatternsGeometricHyperbolicTilingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      disk: undefined,
    } as any;
    const params = {
      p: 7,
      q: 3,
      iterations: 3,
    } as any;

    const result = await PatternsGeometricHyperbolicTilingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
