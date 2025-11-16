import { describe, it, expect } from 'vitest';
import { SurfaceCurvesCompositeCurveNode } from './composite-curve.node';
import { createTestContext } from '../test-utils';

describe('SurfaceCurvesCompositeCurveNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curves: undefined,
    } as any;
    const params = {
      continuity: 'G1',
      mergeTolerance: 0.01,
    } as any;

    const result = await SurfaceCurvesCompositeCurveNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
