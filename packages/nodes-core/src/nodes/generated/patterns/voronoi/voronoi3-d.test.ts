import { describe, it, expect } from 'vitest';
import { PatternsVoronoiVoronoi3DNode } from './voronoi3-d.node';
import { createTestContext } from '../test-utils';

describe('PatternsVoronoiVoronoi3DNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {
      clipToBox: true,
    } as any;

    const result = await PatternsVoronoiVoronoi3DNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
