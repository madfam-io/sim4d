import { describe, it, expect } from 'vitest';
import { SpecializedLatticeGradedLatticeNode } from './graded-lattice.node';
import { createTestContext } from '../test-utils';

describe('SpecializedLatticeGradedLatticeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      boundingShape: undefined,
    } as any;
    const params = {
      minDensity: 0.2,
      maxDensity: 0.8,
      gradientType: 'linear',
    } as any;

    const result = await SpecializedLatticeGradedLatticeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
