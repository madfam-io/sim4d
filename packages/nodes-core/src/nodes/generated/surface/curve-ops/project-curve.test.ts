import { describe, it, expect } from 'vitest';
import { SurfaceCurveOpsProjectCurveNode } from './project-curve.node';
import { createTestContext } from '../test-utils';

describe('SurfaceCurveOpsProjectCurveNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curve: undefined,
      surface: undefined,
    } as any;
    const params = {
      projectionDirection: [0, 0, -1],
      projectBoth: false,
    } as any;

    const result = await SurfaceCurveOpsProjectCurveNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
