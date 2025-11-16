import { describe, it, expect } from 'vitest';
import { PatternsAlgorithmicPackingCirclesNode } from './packing-circles.node';
import { createTestContext } from '../test-utils';

describe('PatternsAlgorithmicPackingCirclesNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      boundary: undefined,
      radii: undefined,
    } as any;
    const params = {
      algorithm: 'power-diagram',
    } as any;

    const result = await PatternsAlgorithmicPackingCirclesNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
