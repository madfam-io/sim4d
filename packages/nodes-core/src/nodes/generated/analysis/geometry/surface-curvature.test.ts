import { describe, it, expect } from 'vitest';
import { SurfaceCurvatureNode } from './surfacecurvature.node';
import { createTestContext } from './../../test-utils';

describe('SurfaceCurvatureNode', () => {
  it('should create SurfaceCurvature', async () => {
    const context = createTestContext();
    const inputs = {
      surface: null,
    };
    const params = {
      u: 0.5,
      v: 0.5,
    };

    const result = await SurfaceCurvatureNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.gaussianCurvature).toBeDefined();
    expect(result.meanCurvature).toBeDefined();
    expect(result.minCurvature).toBeDefined();
    expect(result.maxCurvature).toBeDefined();
  });
});
