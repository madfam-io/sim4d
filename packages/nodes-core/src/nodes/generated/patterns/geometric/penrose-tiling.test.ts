import { describe, it, expect } from 'vitest';
import { PatternsGeometricPenroseTilingNode } from './penrose-tiling.node';
import { createTestContext } from '../test-utils';

describe('PatternsGeometricPenroseTilingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      boundary: undefined,
    } as any;
    const params = {
      type: 'P2',
      subdivisions: 5,
    } as any;

    const result = await PatternsGeometricPenroseTilingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
