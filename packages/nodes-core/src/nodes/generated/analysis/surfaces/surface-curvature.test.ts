import { describe, it, expect } from 'vitest';
import { AnalysisSurfacesSurfaceCurvatureNode } from './surface-curvature.node';
import { createTestContext } from '../test-utils';

describe('AnalysisSurfacesSurfaceCurvatureNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      uSamples: 50,
      vSamples: 50,
      curvatureType: 'gaussian',
      colorMap: true,
    } as any;

    const result = await AnalysisSurfacesSurfaceCurvatureNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
