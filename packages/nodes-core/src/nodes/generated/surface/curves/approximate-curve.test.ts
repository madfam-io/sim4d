import { describe, it, expect } from 'vitest';
import { SurfaceCurvesApproximateCurveNode } from './approximate-curve.node';
import { createTestContext } from '../test-utils';

describe('SurfaceCurvesApproximateCurveNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {
      degree: 3,
      tolerance: 0.01,
      smoothness: 0.5,
    } as any;

    const result = await SurfaceCurvesApproximateCurveNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
