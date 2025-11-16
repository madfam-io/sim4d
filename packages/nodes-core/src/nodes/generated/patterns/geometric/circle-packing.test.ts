import { describe, it, expect } from 'vitest';
import { PatternsGeometricCirclePackingNode } from './circle-packing.node';
import { createTestContext } from '../test-utils';

describe('PatternsGeometricCirclePackingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      boundary: undefined,
    } as any;
    const params = {
      packingType: 'hexagonal',
      minRadius: 1,
      maxRadius: 5,
    } as any;

    const result = await PatternsGeometricCirclePackingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
