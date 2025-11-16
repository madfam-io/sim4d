import { describe, it, expect } from 'vitest';
import { SurfaceCurvesBlendCurveNode } from './blend-curve.node';
import { createTestContext } from '../test-utils';

describe('SurfaceCurvesBlendCurveNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve1: undefined,
      curve2: undefined,
    } as any;
    const params = {
      continuityStart: 'G1',
      continuityEnd: 'G1',
      bulge: 1,
    } as any;

    const result = await SurfaceCurvesBlendCurveNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
