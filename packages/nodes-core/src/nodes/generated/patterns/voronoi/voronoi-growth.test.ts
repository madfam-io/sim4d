import { describe, it, expect } from 'vitest';
import { PatternsVoronoiVoronoiGrowthNode } from './voronoi-growth.node';
import { createTestContext } from '../test-utils';

describe('PatternsVoronoiVoronoiGrowthNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      seeds: undefined,
    } as any;
    const params = {
      generations: 5,
      growthRate: 1.5,
    } as any;

    const result = await PatternsVoronoiVoronoiGrowthNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
