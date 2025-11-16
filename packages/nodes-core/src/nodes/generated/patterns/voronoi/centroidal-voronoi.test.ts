import { describe, it, expect } from 'vitest';
import { PatternsVoronoiCentroidalVoronoiNode } from './centroidal-voronoi.node';
import { createTestContext } from '../test-utils';

describe('PatternsVoronoiCentroidalVoronoiNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {
      iterations: 10,
      convergence: 0.001,
    } as any;

    const result = await PatternsVoronoiCentroidalVoronoiNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
