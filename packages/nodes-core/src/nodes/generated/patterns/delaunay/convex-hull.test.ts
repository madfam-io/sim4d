import { describe, it, expect } from 'vitest';
import { PatternsDelaunayConvexHullNode } from './convex-hull.node';
import { createTestContext } from '../test-utils';

describe('PatternsDelaunayConvexHullNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {} as any;

    const result = await PatternsDelaunayConvexHullNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
