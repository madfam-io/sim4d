import { describe, it, expect } from 'vitest';
import { SurfaceCurveOpsGeodesicCurveNode } from './geodesic-curve.node';
import { createTestContext } from '../test-utils';

describe('SurfaceCurveOpsGeodesicCurveNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
      startPoint: undefined,
      endPoint: undefined,
    } as any;
    const params = {} as any;

    const result = await SurfaceCurveOpsGeodesicCurveNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
