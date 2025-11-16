import { describe, it, expect } from 'vitest';
import { PatternsDelaunayConstrainedDelaunayNode } from './constrained-delaunay.node';
import { createTestContext } from '../test-utils';

describe('PatternsDelaunayConstrainedDelaunayNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
      boundary: undefined,
    } as any;
    const params = {
      refinement: true,
      maxArea: 100,
    } as any;

    const result = await PatternsDelaunayConstrainedDelaunayNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
