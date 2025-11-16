import { describe, it, expect } from 'vitest';
import { PatternsVoronoiVoronoiOffsetNode } from './voronoi-offset.node';
import { createTestContext } from '../test-utils';

describe('PatternsVoronoiVoronoiOffsetNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      cells: undefined,
    } as any;
    const params = {
      offset: 1,
      roundCorners: false,
    } as any;

    const result = await PatternsVoronoiVoronoiOffsetNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
