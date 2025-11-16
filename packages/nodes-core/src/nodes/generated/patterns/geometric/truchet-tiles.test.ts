import { describe, it, expect } from 'vitest';
import { PatternsGeometricTruchetTilesNode } from './truchet-tiles.node';
import { createTestContext } from '../test-utils';

describe('PatternsGeometricTruchetTilesNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      grid: undefined,
    } as any;
    const params = {
      tileType: 'arc',
      randomSeed: 0,
    } as any;

    const result = await PatternsGeometricTruchetTilesNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
