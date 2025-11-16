import { describe, it, expect } from 'vitest';
import { SpecializedLatticeVoronoiLatticeNode } from './voronoi-lattice.node';
import { createTestContext } from '../test-utils';

describe('SpecializedLatticeVoronoiLatticeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      boundingShape: undefined,
    } as any;
    const params = {
      seedCount: 100,
      strutDiameter: 1,
      randomSeed: 42,
    } as any;

    const result = await SpecializedLatticeVoronoiLatticeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
