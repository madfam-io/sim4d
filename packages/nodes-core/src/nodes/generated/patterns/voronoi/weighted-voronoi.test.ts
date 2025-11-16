import { describe, it, expect } from 'vitest';
import { PatternsVoronoiWeightedVoronoiNode } from './weighted-voronoi.node';
import { createTestContext } from '../test-utils';

describe('PatternsVoronoiWeightedVoronoiNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
      weights: undefined,
    } as any;
    const params = {
      powerExponent: 2,
    } as any;

    const result = await PatternsVoronoiWeightedVoronoiNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
