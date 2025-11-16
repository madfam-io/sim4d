import { describe, it, expect } from 'vitest';
import { PatternsVoronoiVoronoiOnSurfaceNode } from './voronoi-on-surface.node';
import { createTestContext } from '../test-utils';

describe('PatternsVoronoiVoronoiOnSurfaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
      points: undefined,
    } as any;
    const params = {
      geodesic: true,
    } as any;

    const result = await PatternsVoronoiVoronoiOnSurfaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
