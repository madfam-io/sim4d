import { describe, it, expect } from 'vitest';
import { AlgorithmicGeometryConvexHull3DNode } from './convex-hull3-d.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicGeometryConvexHull3DNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {
      tolerance: 0.01,
      includeInterior: false,
    } as any;

    const result = await AlgorithmicGeometryConvexHull3DNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
