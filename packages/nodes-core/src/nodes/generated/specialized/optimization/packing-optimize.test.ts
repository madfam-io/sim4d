import { describe, it, expect } from 'vitest';
import { SpecializedOptimizationPackingOptimizeNode } from './packing-optimize.node';
import { createTestContext } from '../test-utils';

describe('SpecializedOptimizationPackingOptimizeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      parts: undefined,
    } as any;
    const params = {
      containerSize: [100, 100, 100],
      rotationAllowed: true,
      algorithm: 'genetic',
    } as any;

    const result = await SpecializedOptimizationPackingOptimizeNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
