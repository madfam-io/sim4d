import { describe, it, expect } from 'vitest';
import { SurfaceCurveOpsIntersectCurvesNode } from './intersect-curves.node';
import { createTestContext } from '../test-utils';

describe('SurfaceCurveOpsIntersectCurvesNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve1: undefined,
      curve2: undefined,
    } as any;
    const params = {
      tolerance: 0.01,
      extend: false,
    } as any;

    const result = await SurfaceCurveOpsIntersectCurvesNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
