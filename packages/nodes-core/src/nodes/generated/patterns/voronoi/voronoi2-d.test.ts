import { describe, it, expect } from 'vitest';
import { PatternsVoronoiVoronoi2DNode } from './voronoi2-d.node';
import { createTestContext } from '../test-utils';

describe('PatternsVoronoiVoronoi2DNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {
      boundary: 'box',
      clipToBoundary: true,
    } as any;

    const result = await PatternsVoronoiVoronoi2DNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
