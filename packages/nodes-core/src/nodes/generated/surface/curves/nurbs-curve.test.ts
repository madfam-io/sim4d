import { describe, it, expect } from 'vitest';
import { SurfaceCurvesNurbsCurveNode } from './nurbs-curve.node';
import { createTestContext } from '../test-utils';

describe('SurfaceCurvesNurbsCurveNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      controlPoints: undefined,
    } as any;
    const params = {
      degree: 3,
      periodic: false,
    } as any;

    const result = await SurfaceCurvesNurbsCurveNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
